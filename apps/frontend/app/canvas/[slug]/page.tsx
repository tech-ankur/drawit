"use client";

import RoomCanvas from "@/components/Roomcanvas";
import { HTTP_URL } from "@/config";
import axios from "axios";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation"; // ✅ IMPORTANT

const CanvasPage = () => {
  const [roomid, setRoomId] = useState("");
  const params = useParams();

  const slug = params.slug as string; // ✅ safe cast

  useEffect(() => {
    async function getRoomId() {
      try {
        const response = await axios.get(
          `${HTTP_URL}/api/room/${slug}`,
          {
            headers: {
              Authorization: localStorage.getItem("token") || "",
            },
          }
        );

        console.log("API response:", response.data);

        setRoomId(response.data.messages?.id.toString());
      } catch (err) {
        console.error("Error fetching room:", err);
      }
    }

    if (slug) getRoomId(); // ✅ avoid undefined
  }, [slug]);

  if (!roomid) return <div>Loading...</div>;

  return <RoomCanvas roomId={roomid} />;
};

export default CanvasPage;