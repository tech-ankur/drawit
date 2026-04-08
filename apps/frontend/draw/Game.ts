import { Tool } from "@/components/Canvas";
import { getExistingShapes } from "./http";

type Shape = {
  id?: number;
  type: "rect" | "circle"|"arrow"|"text";
  x: number;
  y: number;
  width: number;
  height: number;
  text?:string;
}

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

  private selectedTool: Tool = "hand";

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
    console.log("Game Tool Updated to:", this.selectedTool);
  }
createTextInput(x: number, y: number) {
  const input = document.createElement("textarea");

  const rect = this.canvas.getBoundingClientRect();

  input.style.position = "absolute";
  input.style.left = `${rect.left + x}px`;
  input.style.top = `${rect.top + y}px`;
input.style.transformOrigin = "top left";
  input.style.transform = `scale(${this.viewportTransform.scale})`;
  input.style.font = "20px Arial";
  input.style.color = "white";
  input.style.background = "black"; // 👈 important (you were using transparent)
  input.style.border = "1px solid white";
  input.style.outline = "none";
  input.style.resize = "none";
  input.style.padding = "4px";
  input.style.zIndex = "9999";

  document.body.appendChild(input);

  setTimeout(() => input.focus(), 0);

  // prevent blur when clicking inside
  input.addEventListener("mousedown", (e) => {
    e.stopPropagation();
  });

  // auto resize
  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
  });

  return input;
}
getScreenCoordinates(x: number, y: number) {
  return {
    x: x * this.viewportTransform.scale + this.viewportTransform.x,
    y: y * this.viewportTransform.scale + this.viewportTransform.y,
  };
}
 drawArrow( fromx:number, fromy:number, tox:number, toy:number){
    //variables to be used when creating the arrow
   let headlen = 10;
    let  angle = Math.atan2(toy-fromy,tox-fromx);
 
    this.ctx.save();
    
 
    //starting path of the arrow from the start square to the end square
    //and drawing the stroke
    this.ctx.beginPath();
    this.ctx.moveTo(fromx, fromy);
    this.ctx.lineTo(tox, toy);
    this.ctx.lineWidth = 2;
    this.ctx.stroke();
 
    //starting a new path from the head of the arrow to one of the sides of
    //the point
    this.ctx.beginPath();
    this.ctx.moveTo(tox, toy);
    this.ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),
               toy-headlen*Math.sin(angle-Math.PI/7));
 
    //path from the side point of the arrow, to the other side point
    this.ctx.lineTo(tox-headlen*Math.cos(angle+Math.PI/7),
               toy-headlen*Math.sin(angle+Math.PI/7));
 
    //path from the side point back to the tip of the arrow, and then
    //again to the opposite side point
    this.ctx.lineTo(tox, toy);
    this.ctx.lineTo(tox-headlen*Math.cos(angle-Math.PI/7),
               toy-headlen*Math.sin(angle-Math.PI/7));
 
    //draws the paths created above
   this. ctx.stroke();
    this.ctx.restore();
}
  async init() {
    this.existingshapes = await getExistingShapes(this.roomId);
    console.log(this.existingshapes);
    this.redraw();
  }

  async initHandler() {
    this.socket.onmessage = (event) => {
      const message = JSON.parse(event.data);

      if (message.type === "chat") {
        const parsedShape = JSON.parse(message.message);
        this.existingshapes.push({ ...parsedShape,
    id: message.id});
        this.redraw();
      }
      
        if (message.type === "delete") {
  this.existingshapes = this.existingshapes.filter(
    (shape) => shape.id !== message.id
  );
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

  else if (shape.type === "circle") {
    const centerX = shape.x + shape.width / 2;
    const centerY = shape.y + shape.height / 2;

    const rx = Math.abs(shape.width / 2);
    const ry = Math.abs(shape.height / 2);

    const dx = x - centerX;
    const dy = y - centerY;

    return (dx * dx) / (rx * rx) + (dy * dy) / (ry * ry) <= 1;
  }

  else if (shape.type === "arrow") {
    const x1 = shape.x;
    const y1 = shape.y;
    const x2 = shape.x + shape.width;
    const y2 = shape.y + shape.height;

    const distance = this.distanceToLine(x, y, x1, y1, x2, y2);
    return distance < 8;
  }

  // ✅ ADD THIS BLOCK
  else if (shape.type === "text") {
  this.ctx.font = "20px Arial";
  const lines = (shape.text || "").split("\n");
  const lineHeight = 24;
  
  // Calculate max width across all lines
  const maxWidth = lines.reduce((max, line) => {
    return Math.max(max, this.ctx.measureText(line).width);
  }, 0);

  const totalHeight = lines.length * lineHeight;

  // Add a 5px padding buffer for easier selection
  const buffer = 5;
  return (
    x >= shape.x - buffer &&
    x <= shape.x + maxWidth + buffer &&
    y >= shape.y - buffer &&
    y <= shape.y + totalHeight + buffer
  );
}

  return false;
}
distanceToLine(px: number, py: number, x1: number, y1: number, x2: number, y2: number) {
  const A = px - x1;
  const B = py - y1;
  const C = x2 - x1;
  const D = y2 - y1;

  const dot = A * C + B * D;
  const lenSq = C * C + D * D;

  let param = -1;
  if (lenSq !== 0) param = dot / lenSq;

  let xx, yy;

  if (param < 0) {
    xx = x1;
    yy = y1;
  } else if (param > 1) {
    xx = x2;
    yy = y2;
  } else {
    xx = x1 + param * C;
    yy = y1 + param * D;
  }

  const dx = px - xx;
  const dy = py - yy;

  return Math.sqrt(dx * dx + dy * dy);
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
    this.ctx.strokeStyle = "white";
    this.ctx.save();
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
      }else if(shape.type==="arrow"){
        const fromx=shape.x;
        const fromy=shape.y;
        const tox=shape.x+shape.width;
        const toy=shape.y+shape.height;
        this.drawArrow(fromx,fromy,tox,toy);
      
      }
      else if(shape.type==="text"){
        this.ctx.font = "20px Arial";
        this.ctx.fillStyle = "white";
        this.ctx.textBaseline = "top";
const lines = (shape.text || "").split("\n");

lines.forEach((line, index) => {
  this.ctx.fillText(line, shape.x, shape.y + index * 24);
});
      }
    
    });
    this.ctx.restore();
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
        this.socket.send(JSON.stringify({
          type: "delete",
          roomId: Number(this.roomId),
          id: shape.id,
        }));
        break;
        
      }
    }

    return; // don't start drawing
  }

  // 🟢 NORMAL BEHAVIOR
  this.clicked = true;

  if (this.selectedTool === "hand") {
    this.panStartX = e.clientX;
    this.panStartY = e.clientY;
  }
else if (this.selectedTool === "text") {
  const { x, y } = this.getWorldCoordinates(e.clientX, e.clientY);
  const screen = this.getScreenCoordinates(x, y);

  const input = this.createTextInput(screen.x, screen.y);

  let isFinished = false;

  const cleanup = () => {
    input.removeEventListener("blur", finish);
    input.removeEventListener("keydown", handleKeyDown);
  };

  const finish = () => {
    if (isFinished) return;
    isFinished = true;

    cleanup(); // ✅ remove listeners FIRST

    const value = input.value.trim();
const metrics = this.ctx.measureText(value);
    if (value) {
      const shape: Shape = {
        type: "text",
        x,
        y,
       width: metrics.width,
  height: 24,
        text: value,
      };

      this.socket.send(JSON.stringify({
        type: "chat",
        roomId: Number(this.roomId),
        message: JSON.stringify(shape),
      }));
    }

    // ✅ safest remove possible
    if (document.body.contains(input)) {
      document.body.removeChild(input);
    }

    this.redraw();
  };

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      finish();
    }
  };

  input.addEventListener("keydown", handleKeyDown);
  input.addEventListener("blur", finish);

  return;
}
  else {
    const { x, y } = this.getWorldCoordinates(e.clientX, e.clientY);
    this.startX = x;
    this.startY = y;
  }
});
    // 🟢 MOUSEMOVE
    this.canvas.addEventListener("mousemove", (e) => {
       if (!this.clicked) return;
    console.log("Current Tool:", this.selectedTool);
      if (this.selectedTool === "delete" || this.selectedTool === "text") {
    return;
  }
   
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
      else if(this.selectedTool==="arrow"){
        this.drawArrow(this.startX,this.startY,x,y);
      }

        
    });


    this.canvas.addEventListener("mouseup", (e) => {
  this.clicked = false;

 if (
  this.selectedTool === "hand" ||
  this.selectedTool === "delete" ||
  this.selectedTool === "text"   
){ return}; 

  const { x, y } = this.getWorldCoordinates(e.clientX, e.clientY);

  const width = x - this.startX;
  const height = y - this.startY;
      if(width===0 && height===0) return; // prevent creating empty shapes on click
  const shape: Shape = {
    type: this.selectedTool,
    x: this.startX,
    y: this.startY,
    width,
    height
  };

  

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