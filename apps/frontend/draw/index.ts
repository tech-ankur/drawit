interface Drawprop{
canvas: HTMLCanvasElement,
roomId:string,
socket:WebSocket,
setLoading?: React.Dispatch<React.SetStateAction<boolean>>;

}
export const initDraw =async  ({canvas,roomId,socket}:Drawprop) => {
  const ctx = canvas.getContext("2d")
  if(!ctx) return
    let clicked = false
    let startX = 0
    let startY = 0
     
  
}

 

