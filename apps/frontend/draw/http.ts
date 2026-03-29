import axios from "axios";
import { HTTP_URL } from "@/config";
export async function getExistingShapes(roomId:string){
  const res=await axios.get(`${HTTP_URL}/api/chats/${roomId}`)
  const messages=res.data.messages;
  const shapes=messages.map((x:{message:string})=>{
    const messageData=JSON.parse(x.message);
    return messageData
  })
  return shapes;
}