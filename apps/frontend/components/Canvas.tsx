"use client";
import { useEffect, useRef, useState } from 'react'
import IconButton from './IconButton';
import { Circle, EraserIcon, Hand, Pencil, RectangleHorizontalIcon } from 'lucide-react';
import { Game } from '@/draw/Game';
interface canvaprop{
  roomId:string,
  socket:WebSocket
}
export type Tool="circle"|"rect"|"pencil"|"hand"|"delete";
const Canvas = ({roomId,socket}:canvaprop) => {
     const canvasRef=useRef<HTMLCanvasElement>(null)
      const gameRef = useRef<Game | null>(null)
      const [selectedTool,setSelectedTool]=useState<Tool>("pencil")

useEffect(()=>{
    gameRef.current?.setTool(selectedTool);
  }
  ,[selectedTool]
)

useEffect(() => {
    if(canvasRef.current){
      gameRef.current=new Game(canvasRef.current,roomId,socket);
  
    }
}, []);
  return (
    <div className='h-screen overflow-hidden'>
      <canvas ref={canvasRef} width={window.innerWidth} height={window.innerHeight} style={{ background: "black" }} />
    <Topbar selectedTool={selectedTool} setSelectedTool={setSelectedTool}/>
    </div>
  )
}
function Topbar({selectedTool,setSelectedTool}:{
 selectedTool:Tool,
setSelectedTool:(s:Tool)=>void
}){
  return <div className='fixed top-10 left-10 border border-white'>
<div className='flex gap-2 m-2 '>
  <IconButton icon={<Pencil/>} onClick={()=>{setSelectedTool("pencil")}} activated={selectedTool==="pencil"}/>
<IconButton icon={<RectangleHorizontalIcon/>} onClick={()=>{setSelectedTool("rect")}} activated={selectedTool==="rect"}/>
<IconButton icon={<Circle/>} onClick={()=>{setSelectedTool("circle")}} activated={selectedTool==="circle"}/>
<IconButton icon={<Hand/>} onClick={()=>{setSelectedTool("hand")}} activated={selectedTool==="hand"}/>
<IconButton icon={<EraserIcon/>} onClick={()=>{setSelectedTool("delete")}} activated={selectedTool==="delete"}/>

</div>
  </div>
}

export default Canvas
