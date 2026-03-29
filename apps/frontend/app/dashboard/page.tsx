"use client";

import CreateRoom from "@/components/Createroom";
import { HTTP_URL } from "@/config";
import axios from "axios";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

const Page = () => {
  const [rooms, setRooms] = useState<any[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function getRooms() {
      try {
        const token = localStorage.getItem("token");

        const res = await axios.get(`${HTTP_URL}/api/rooms`, {
          headers: {
            Authorization:token,
          },
        });

        setRooms(res.data.rooms);
      } catch (err) {
        console.error(err);
      }
    }

    getRooms();
  }, []);

  return (
    <div className="p-6 min-h-screen bg-black text-[#E5E5E5]">
      {/* 🔹 Header */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">
          Your Rooms
        </h1>

        <button
          onClick={() => setShowCreate(true)}
          className="bg-[#6F8F76] hover:bg-[#5f7c66] text-black px-5 py-2 rounded-xl transition shadow-md"
        >
          Create Room
        </button>
      </div>

      {/* 🔹 Rooms Grid */}
      {rooms.length === 0 ? (
        <p className="text-gray-400">No rooms found</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {rooms.map((room) => (
            <div
              key={room.id}
              onClick={() => router.push(`/canvas/${room.slug}`)}
              className="cursor-pointer bg-[#111111] rounded-2xl p-5 shadow-md hover:shadow-2xl transition-all duration-300 border border-[#222222] hover:border-[#6F8F76] hover:scale-105"
            >
              <h2 className="text-lg font-semibold mb-2">
                {room.slug}
              </h2>

              <p className="text-sm text-[#9CA3AF] mb-4">
                Created At:{" "}
                {new Date(room.createdAt).toLocaleDateString()}
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
          onClose={() => setShowCreate(false)}
          onCreated={(newRoom) =>
            setRooms((prev) => [...prev, newRoom])
          }
        />
      )}
    </div>
  );
};

export default Page;