"use client";
import { initDraw } from '@/draw';
import { useEffect, useRef } from 'react'

const Canvas = ({roomId}:{
    roomId:string
}) => {
     const canvasRef=useRef<HTMLCanvasElement>(null)
     useEffect(()=>{
        if(canvasRef.current){
            const canvas=canvasRef.current;
            if(initDraw(canvas,roomId)===null){
            return
            }
        }
    },[])
  return (
    <div>
      <canvas ref={canvasRef} width={1500} height={698} />
    </div>
  )
}

export default Canvas
