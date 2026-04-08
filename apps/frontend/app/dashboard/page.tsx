"use client";

import CreateRoom from "@/components/Createroom";
import { HTTP_URL } from "@/config";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import JoinRoom from "@/components/Joinroom";
import { LogOut } from "lucide-react"; // Optional: adding an icon

interface Room {
  id: string | number;
  slug: string;
  createdAt: string;
}

const Page = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [showJoin, setShowJoin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function getRooms() {
      try {
        const token = localStorage.getItem("token");
        // Redirect if no token exists
        if (!token) {
          router.push("/signin");
          return;
        }

        const res = await axios.get(`${HTTP_URL}/api/rooms`, {
          headers: {
            Authorization: token,
          },
        });
        setRooms(res.data.rooms);
      } catch (err) {
        console.error("Failed to fetch rooms:", err);
      }
    }
    getRooms();
  }, [router]);

  // ✅ Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/"); // or wherever your login page is
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return isNaN(date.getTime())
      ? new Date().toLocaleDateString()
      : date.toLocaleDateString();
  };

  return (
    <div className="p-6 min-h-screen bg-black text-[#E5E5E5]">
      {/* 🔹 Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Your Rooms</h1>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowJoin(true)}
            className="cursor-pointer bg-[#111111] border border-[#333] hover:border-[#6F8F76] text-[#E5E5E5] px-5 py-2 rounded-xl transition"
          >
            Join Room
          </button>

          <button
            onClick={() => setShowCreate(true)}
            className="cursor-pointer bg-[#6F8F76] hover:bg-[#5f7c66] text-black px-5 py-2 rounded-xl transition shadow-md"
          >
            Create Room
          </button>

          {/* ✅ Logout Button */}
          <button
            onClick={handleLogout}
            className="cursor-pointer flex items-center gap-2 bg-transparent border border-red-900/50 hover:bg-red-950/30 text-red-500 px-4 py-2 rounded-xl transition ml-2"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </div>

      {/* 🔹 Rooms Grid */}
      {rooms.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-gray-400">
            No rooms found. Start by creating one!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => router.push(`/canvas/${room.slug}`)}
              className="cursor-pointer bg-[#111111] rounded-2xl p-5 shadow-md hover:shadow-2xl transition-all duration-300 border border-[#222222] hover:border-[#6F8F76] hover:scale-105"
            >
              <h2 className="text-lg font-semibold mb-2">{room.slug}</h2>

              <p className="text-sm text-[#9CA3AF] mb-4">
                Created At: {formatDate(room.createdAt)}
              </p>

              <div className="text-[#6F8F76] text-sm font-medium">
                Open Canvas →
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🔹 Create Room Modal */}
      {showCreate && (
        <CreateRoom
          onCreated={(room: Room) => {
            setRooms((prev) => [...prev, room]);
            setShowCreate(false);
          }}
        />
      )}

      {/* 🔹 Join Room Modal */}
      {showJoin && <JoinRoom onClose={() => setShowJoin(false)} />}
    </div>
  );
};

export default Page;