import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

/**
 * DEPLOYMENT FIX 1: Render dynamic port
 */
const port = Number(process.env.PORT) || 8080;
const wss = new WebSocketServer({ port });

interface User {
  userId: string;
  rooms: Set<number>;
}

/**
 * Maps for O(1) lookups
 */
const users = new Map<WebSocket, User>();       // ws -> user
const rooms = new Map<number, Set<WebSocket>>();   // roomId -> sockets

/**
 * DEPLOYMENT FIX 2: Heartbeat Logic
 * Prevents Render from killing the connection after 5 minutes of silence.
 */
const interval = setInterval(() => {
  wss.clients.forEach((ws: any) => {
    if (ws.isAlive === false) return ws.terminate();
    ws.isAlive = false;
    ws.ping(); 
  });
}, 30000);

wss.on("close", () => {
  clearInterval(interval);
});

/**
 * Verify JWT
 */
function checkUser(token: string): string | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (typeof decoded === "string") return null;
    if (!decoded?.userId) return null;
    return decoded.userId;
  } catch {
    return null;
  }
}

/**
 * Validate room existence
 */
async function validateRoom(roomId: number) {
  return prismaClient.room.findUnique({
    where: { id: roomId }
  });
}

/**
 * Add user to room
 */
function joinRoom(ws: WebSocket, roomId: number) {
  const user = users.get(ws);
  if (!user) return;
  user.rooms.add(roomId);
  if (!rooms.has(roomId)) {
    rooms.set(roomId, new Set());
  }
  rooms.get(roomId)!.add(ws);
}

/**
 * Remove user from room
 */
function leaveRoom(ws: WebSocket, roomId: number) {
  const user = users.get(ws);
  if (!user) return;
  user.rooms.delete(roomId);
  rooms.get(roomId)?.delete(ws);
  if (rooms.get(roomId)?.size === 0) {
    rooms.delete(roomId);
  }
}

/**
 * Broadcast to room
 */
function broadcastToRoom(roomId: number, payload: any) {
  const roomUsers = rooms.get(roomId);
  if (!roomUsers) return;
  const message = JSON.stringify(payload);
  roomUsers.forEach(client => {
    if (client.readyState === WebSocket.OPEN) {
      client.send(message);
    }
  });
}

/**
 * Handle new connections
 */
wss.on("connection", (ws: any, req) => {
  // Setup for Heartbeat
  ws.isAlive = true;
  ws.on('pong', () => { ws.isAlive = true; });

  try {
    const url = req.url;
    const params = new URLSearchParams(url?.split("?")[1]);
    const token = params.get("token");

    const userId = checkUser(token || "");
    if (!userId) {
      ws.close(4001, "Unauthorized");
      return;
    }

    // Store user
    users.set(ws, {
      userId,
      rooms: new Set()
    });

  } catch {
    ws.close(4002, "Connection error");
    return;
  }

  /**
   * Message handler
   */
  ws.on("message", async (data:any) => {
    try {
      const parsedData = JSON.parse(data.toString());

      switch (parsedData.type) {
        case "join_room": {
          const roomId = Number(parsedData.roomId);
          if (!roomId) {
            ws.send(JSON.stringify({ type: "error", message: "Invalid roomId" }));
            return;
          }
          const roomExists = await validateRoom(roomId);
          if (!roomExists) {
            ws.send(JSON.stringify({ type: "error", message: "Room not found" }));
            return;
          }
          joinRoom(ws, roomId);
          ws.send(JSON.stringify({
            type: "joined_room",
            roomId
          }));
          break;
        }

        case "leave_room": {
          const roomId = Number(parsedData.roomId);
          leaveRoom(ws, roomId);
          break;
        }

        case "chat": {
          const roomId = Number(parsedData.roomId);
          const message = parsedData.message;
          const user = users.get(ws);
          if (!user) return;
          if (!user.rooms.has(roomId)) {
            ws.send(JSON.stringify({
              type: "error",
              message: "Join room first"
            }));
            return;
          }

          // Store message in DB
        const response =  await prismaClient.chat.create({
            data: {
              roomId,
              message,
              userId: user.userId
            }
          });

          // Broadcast
          broadcastToRoom(roomId, {
            id:response.id,
            type: "chat",
            roomId,
            message,
            userId: user.userId
          });
          break;
        }
        case "delete": {
          const roomId = Number(parsedData.roomId);
          const id= Number(parsedData.id);
          const user = users.get(ws);
          if (!user) return;
          if (!user.rooms.has(roomId)) {
            ws.send(JSON.stringify({
              type: "error",
              message: "Join room first"
            }));
            return;
          }
          // Delete message from DB
        const response=  await prismaClient.chat.delete({
            where: {
              id
            }
          });
           broadcastToRoom(roomId, {
            id:response.id,
            type: "delete",
            roomId,
            userId: user.userId
          });
          break;
        }

        default:
          ws.send(JSON.stringify({
            type: "error",
            message: "Unknown message type"
          }));
      }

    } catch {
      ws.send(JSON.stringify({
        type: "error",
        message: "Invalid message format"
      }));
    }
  });

  /**
   * Cleanup on disconnect
   */
  ws.on("close", () => {
    const user = users.get(ws);
    if (!user) return;

    user.rooms.forEach(roomId => {
      rooms.get(roomId)?.delete(ws);
      if (rooms.get(roomId)?.size === 0) {
        rooms.delete(roomId);
      }
    });

    users.delete(ws);
  });
});

console.log(`WebSocket server started on port ${port}`);