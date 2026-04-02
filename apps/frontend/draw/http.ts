import { HTTP_URL } from "@/config";
import axios from "axios";

type ChatMessage = {
  id: number;
  message: string;
};

export async function getExistingShapes(roomId: string) {
  const res = await axios.get(`${HTTP_URL}/api/chats/${roomId}`);
  const messages: ChatMessage[] = res.data.messages;

  const shapes = messages.map((x) => {
    const messageData = JSON.parse(x.message);

    return {
      ...messageData,
      id: x.id
    };
  });

  return shapes;
}