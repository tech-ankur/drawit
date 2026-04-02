"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { HTTP_URL } from "@/config";

const JoinRoom = ({ onClose }: any) => {
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleJoin = async () => {
    if (!slug.trim()) return;

    try {
      setLoading(true);

      await axios.get(`${HTTP_URL}/api/room/${slug}`, {
        headers: {
          Authorization: localStorage.getItem("token") || "",
        },
      });

      router.push(`/canvas/${slug}`);
      onClose();
    } catch {
      alert("Room not found");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex justify-center items-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-[#111111] border border-[#222] text-white p-6 rounded-2xl w-96 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-xl font-semibold mb-4">Join Room</h2>

        <input
          type="text"
          placeholder="Enter room name..."
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full bg-black border border-[#333] focus:border-[#6F8F76] p-3 rounded-lg outline-none mb-4"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleJoin()}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#333] hover:bg-[#222]"
          >
            Cancel
          </button>

          <button
            onClick={handleJoin}
            disabled={loading}
            className={`px-4 py-2 rounded-lg ${
              loading
                ? "bg-gray-500"
                : "bg-[#6F8F76] hover:bg-[#5f7c66] text-black"
            }`}
          >
            {loading ? "Joining..." : "Join"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default JoinRoom;