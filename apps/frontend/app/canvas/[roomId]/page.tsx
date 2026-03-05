import RoomCanvas from "@/components/Roomcanvas";

const CanvasPage = async ({params}:{params:{roomId:string}}) => {
    const roomId=(await params).roomId;
    console.log("roomId",roomId)  
    return <RoomCanvas roomId={roomId}/>
}

export default CanvasPage
