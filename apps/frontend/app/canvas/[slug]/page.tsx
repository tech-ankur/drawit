import RoomCanvas from "@/components/Roomcanvas";
import { HTTP_URL } from "@/config";
import axios from "axios";

// async function getRoomId(slug:string){
//    const response = await axios.get(`${HTTP_URL}/api/room/${slug}`, {
//   headers: {
//     Authorization: `Bearer ${localStorage.getItem("token")}`
//   }
// });
//     return response.data.room.id
// }
const CanvasPage = async ({params}:{params:{slug:string}}) => {
  
    const slug=(await params).slug;
    // const roomId=await getRoomId(slug)
    // console.log("roomId",roomId)  
    return <RoomCanvas roomId={slug}/>
}

export default CanvasPage
