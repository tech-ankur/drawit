"use client"
import { initDraw } from "@/draw"
import { useEffect, useRef } from "react"


const Canvas = () => {
    const canvasRef=useRef<HTMLCanvasElement>(null)
    useEffect(()=>{
        if(canvasRef.current){
              const canvas=canvasRef.current;
              if(initDraw(canvas)===null){
                return
            }
        }
    },[])
  return (
    <div>
      <canvas ref={canvasRef} width={800} height={600} />
    </div>
  )
}

export default Canvas
