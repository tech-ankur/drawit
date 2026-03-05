import { HTTP_URL } from "@/config";
import axios from "axios";

type Shape={
    type:"rect"|"ellipse"|"line"|"circle",
    x:number,
    y:number,
    width:number,
    height:number,
}
let existingshapes:Shape[]=[];

 export const initDraw =async  (canvas: HTMLCanvasElement,roomId:string) => {
  const ctx = canvas.getContext("2d")
  if(!ctx) return

    // existingshapes=await getExistingShapes(roomId)
    ctx.fillStyle = "black"
    ctx.fillRect(0,0,canvas.width,canvas.height)
    ctx.strokeRect(50,50,100,100)
     ctx.strokeStyle="white"
    let clicked = false
    let startX = 0
    let startY = 0

  canvas.addEventListener("mousedown",(e)=>{
    clicked = true
    startX = e.clientX
    startY = e.clientY  
  })

  canvas.addEventListener("mouseup",(e)=>{
    clicked = false;
    const width = e.clientX - startX
    const height = e.clientY - startY
    existingshapes.push({
        type:"rect",
        x:startX,   
        y:startY,
        width,
        height
    })
  })

  canvas.addEventListener("mousemove",(e)=>{
    if(!clicked) return

    const width = e.clientX - startX
    const height = e.clientY - startY
   redraw(ctx)
    ctx.strokeRect(startX,startY,width,height)
  })
}

function redraw(ctx:CanvasRenderingContext2D){
    ctx.clearRect(0,0,ctx.canvas.width,ctx.canvas.height)
    ctx.fillStyle="black"
    ctx.fillRect(0,0,ctx.canvas.width,ctx.canvas.height)
    existingshapes.map((shape)=>{
        if(shape.type==="rect"){
            ctx.strokeRect(shape.x,shape.y,shape.width,shape.height)
        }
    })

}

async function getExistingShapes(roomId:string){
  const res=await axios.get(`${HTTP_URL}/chats/${roomId}`)
  const messages=res.data.messages;
  const shapes=messages.map((x:{message:string})=>{
    const messageData=JSON.parse(x.message);
    return messageData
  })
  return shapes;
}