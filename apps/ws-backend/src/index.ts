import { WebSocketServer } from "ws";
const wss=new WebSocketServer({port:8080});
wss.on("connection",(ws,req)=>{
  const url=req.url;
  const qrueryparams=new URLSearchParams(url?.split("?")[1]);
  const token=qrueryparams.get("token");
    ws.on("message",(message)=>{
        console.log("Received message:",message);
    });
})
