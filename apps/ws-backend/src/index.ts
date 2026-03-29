import { WebSocket, WebSocketServer } from "ws";
import jwt from "jsonwebtoken";
import { JWT_SECRET } from "@repo/backend-common/config";
import { prismaClient } from "@repo/db/client";

const wss = new WebSocketServer({ port: 8080 });

interface User {
  userId: string;
  rooms: Set<number>;
}

/**
 * Maps for O(1) lookups
 */
const users = new Map<WebSocket, User>();          // ws -> user
const rooms = new Map<number, Set<WebSocket>>();   // roomId -> sockets

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
wss.on("connection", (ws, req) => {
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
  ws.on("message", async (data) => {
    console.log("Received:", data.toString());
    try {
      console.log("Received:", data.toString());
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
          await prismaClient.chat.create({
            data: {
              roomId,
              message,
              userId: user.userId
            }
          });

          // Broadcast
          broadcastToRoom(roomId, {
            type: "chat",
            roomId,
            message,
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