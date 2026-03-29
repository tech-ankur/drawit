import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

type Shape = {
  type: "rect" | "pencil" | "circle";
  x: number;
  y: number;
  width: number;
  height: number;
};

export class Game {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private existingshapes: Shape[] = [];
  private roomId: string;
  private socket: WebSocket;

  private clicked: boolean = false;

  // ✅ Drawing (world coords)
  private startX = 0;
  private startY = 0;

  // ✅ Panning (screen coords)
  private panStartX = 0;
  private panStartY = 0;

  private selectedTool: Tool = "circle";

  private viewportTransform = {
    x: 0,
    y: 0,
    scale: 1,
  };

  constructor(canvas: HTMLCanvasElement, roomId: string, socket: WebSocket) {
    this.canvas = canvas;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Canvas context not found");

    this.ctx = ctx;
    this.roomId = roomId;
    this.socket = socket;

    this.init();
    this.initHandler();
    this.initMouseHandlers();
  }

  setTool(tool: Tool) {
    this.selectedTool = tool;
  }

  async init() {
    this.existingshapes = await getExistingShapes(this.roomId);
    this.redraw();
  }

  async initHandler() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "chat") {
        const parsedShape = JSON.parse(message.message);
        this.existingshapes.push(parsedShape);
        this.redraw();
      }
    };
  }
isPointInsideShape(x: number, y: number, shape: Shape) {
  if (shape.type === "rect") {
    return (
      x >= shape.x &&
      x <= shape.x + shape.width &&
      y >= shape.y &&
      y <= shape.y + shape.height
    );
  }

  if (shape.type === "circle") {
    const centerX = shape.x + shape.width / 2;
    const centerY = shape.y + shape.height / 2;

    const rx = Math.abs(shape.width / 2);
    const ry = Math.abs(shape.height / 2);

    const dx = x - centerX;
    const dy = y - centerY;

    return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
  }

  return false;
}
  // ✅ Convert screen → world coords
  getWorldCoordinates(clientX: number, clientY: number) {
    const rect = this.canvas.getBoundingClientRect();

    return {
      x:
        (clientX - rect.left - this.viewportTransform.x) /
        this.viewportTransform.scale,
      y:
        (clientY - rect.top - this.viewportTransform.y) /
        this.viewportTransform.scale,
    };
  }

  redraw() {
    // 1. Reset transform
    this.ctx.setTransform(1, 0, 0, 1, 0, 0);

    // 2. Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // 3. Background
    this.ctx.fillStyle = "black";
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    // 4. Apply transform
    this.ctx.setTransform(
      this.viewportTransform.scale,
      0,
      0,
      this.viewportTransform.scale,
      this.viewportTransform.x,
      this.viewportTransform.y
    );

    // 5. Draw shapes
    this.ctx.strokeStyle = "white";

    this.existingshapes.forEach((shape) => {
      if (shape.type === "rect") {
        this.ctx.strokeRect(shape.x, shape.y, shape.width, shape.height);
      } else if (shape.type === "circle") {
        const centerX = shape.x + shape.width / 2;
        const centerY = shape.y + shape.height / 2;

        this.ctx.beginPath();
        this.ctx.ellipse(
          centerX,
          centerY,
          Math.abs(shape.width / 2),
          Math.abs(shape.height / 2),
          0,
          0,
          Math.PI * 2
        );
        this.ctx.stroke();
      }
    
    });
  }

  // ✅ Smooth zoom
  updateZooming = (e: WheelEvent) => {
    e.preventDefault();

    const oldScale = this.viewportTransform.scale;
    const oldX = this.viewportTransform.x;
    const oldY = this.viewportTransform.y;

    const mouseX = e.clientX;
    const mouseY = e.clientY;

    let newScale = oldScale + e.deltaY * -0.001;

    // clamp
    newScale = Math.max(0.1, Math.min(5, newScale));

    const newX = mouseX - (mouseX - oldX) * (newScale / oldScale);
    const newY = mouseY - (mouseY - oldY) * (newScale / oldScale);

    this.viewportTransform.scale = newScale;
    this.viewportTransform.x = newX;
    this.viewportTransform.y = newY;
  };

  initMouseHandlers() {
    // 🟢 MOUSEDOWN
  this.canvas.addEventListener("mousedown", (e) => {

  // 🗑️ DELETE TOOL
  if (this.selectedTool === "delete") {
    const { x, y } = this.getWorldCoordinates(e.clientX, e.clientY);

    // check top-most shape
    for (let i = this.existingshapes.length - 1; i >= 0; i--) {
      const shape = this.existingshapes[i];

      if (this.isPointInsideShape(x, y, shape)) {
        this.existingshapes.splice(i, 1);
        this.redraw();

       
        this.socket.send(JSON.stringify({
          type: "delete",
          roomId: Number(this.roomId),
          index: i
        }));

        return; // stop after delete
      }
    }

    return; // don't start drawing
  }

  // 🟢 NORMAL BEHAVIOR
  this.clicked = true;

  if (this.selectedTool === "hand") {
    this.panStartX = e.clientX;
    this.panStartY = e.clientY;
  } else {
    const { x, y } = this.getWorldCoordinates(e.clientX, e.clientY);
    this.startX = x;
    this.startY = y;
  }
});
    // 🟢 MOUSEMOVE
    this.canvas.addEventListener("mousemove", (e) => {
      if (!this.clicked) return;

      // ✋ PANNING
      if (this.selectedTool === "hand") {
        const dx = e.clientX - this.panStartX;
        const dy = e.clientY - this.panStartY;

        this.viewportTransform.x += dx;
        this.viewportTransform.y += dy;

        this.panStartX = e.clientX;
        this.panStartY = e.clientY;

        this.redraw();
        return;
      }

      // ✏️ DRAWING
      const { x, y } = this.getWorldCoordinates(
        e.clientX,
        e.clientY
      );

      const width = x - this.startX;
      const height = y - this.startY;

      this.redraw();

      if (this.selectedTool === "rect") {
        this.ctx.strokeRect(this.startX, this.startY, width, height);
      } else if (this.selectedTool === "circle") {
        const centerX = this.startX + width / 2;
        const centerY = this.startY + height / 2;

        this.ctx.beginPath();
        this.ctx.ellipse(
          centerX,
          centerY,
          Math.abs(width / 2),
          Math.abs(height / 2),
          0,
          0,
          Math.PI * 2
        );
        this.ctx.stroke();
      }
    });


    this.canvas.addEventListener("mouseup", (e) => {
  this.clicked = false;

  if (this.selectedTool === "hand" || this.selectedTool === "delete") return;

  const { x, y } = this.getWorldCoordinates(e.clientX, e.clientY);

  const width = x - this.startX;
  const height = y - this.startY;

  const shape: Shape = {
    type: this.selectedTool,
    x: this.startX,
    y: this.startY,
    width,
    height,
  };

  this.existingshapes.push(shape);

  this.socket.send(JSON.stringify({
    type: "chat",
    roomId: Number(this.roomId),
    message: JSON.stringify(shape),
  }));
});

   
    this.canvas.addEventListener("wheel", (e) => {
      this.updateZooming(e);
      this.redraw();
    });
  }
}