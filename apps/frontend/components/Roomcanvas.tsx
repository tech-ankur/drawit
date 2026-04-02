"use client";
import { WS_URL } from "@/config";
import { useEffect,useState } from "react";
import Canvas from "./Canvas";



export default  function RoomCanvas({roomId}: {roomId: string}) {
   
    const [socket,setSocket]=useState<WebSocket|null>(null)
    useEffect(()=>{
        const ws=new WebSocket(`${WS_URL}?token=${localStorage.getItem("token")}`)
        ws.onopen=()=>{
            setSocket(ws)
            console.log("Joining room:", roomId);
            ws.send(JSON.stringify({
                type:"join_room",
                roomId
            }))
        }
   ws.onclose = () => {
  console.log("WS CLOSED");
};

ws.onerror = (err) => {
  console.log("WS ERROR", err);
};
    },[roomId])
   
    if(!socket){
        return <div>
            connecting to server....
        </div>
    }
    return <Canvas roomId={roomId} socket={socket}/>
}