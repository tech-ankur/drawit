export const initDraw = (canvas: HTMLCanvasElement): void => {
  const ctx = canvas.getContext("2d")
  if(!ctx) return

  ctx.fillStyle = "black"
  ctx.fillRect(0,0,canvas.width,canvas.height)

  ctx.strokeStyle = "white"
  ctx.strokeRect(50,50,100,100)

  let clicked = false
  let startX = 0
  let startY = 0

  canvas.addEventListener("mousedown",(e)=>{
    clicked = true
    startX = e.clientX
    startY = e.clientY
  })

  canvas.addEventListener("mouseup",()=>{
    clicked = false
  })

  canvas.addEventListener("mousemove",(e)=>{
    if(!clicked) return

    const width = e.clientX - startX
    const height = e.clientY - startY

    ctx.clearRect(0,0,canvas.width,canvas.height)

    ctx.fillStyle="black"
    ctx.fillRect(0,0,canvas.width,canvas.height)

    ctx.strokeStyle="white"
    ctx.strokeRect(startX,startY,width,height)
  })
}