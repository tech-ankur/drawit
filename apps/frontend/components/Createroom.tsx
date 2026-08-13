"use client";

import { HTTP_URL } from "@/config";
import axios from "axios";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CreateRoom = ({ onClose, onCreated }: any) => {
  const [slug, setSlug] = useState("");
  const [loading, setLoading] = useState(false);
const navigate = useRouter();
  const handleCreate = async () => {
    if (!slug.trim()) return;

    try {
      setLoading(true);
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${HTTP_URL}/api/room`,
        { slug },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      onCreated(res.data.room);
      navigate.push(`/canvas/${res.data.room.slug}`);
      
     
    } catch (err: any) {
  console.error(err);

  if (axios.isAxiosError(err)) {
    alert(err.response?.data?.error || "Failed to create room");
  } else {
    alert("Something went wrong");
  }
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
        <h2 className="text-xl font-semibold mb-4">Create New Room</h2>

        <input
          type="text"
          placeholder="Enter room name..."
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full bg-black border border-[#333] focus:border-[#6F8F76] p-3 rounded-lg outline-none mb-4"
          autoFocus
          onKeyDown={(e) => e.key === "Enter" && handleCreate()}
        />

        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg border border-[#333] hover:bg-[#222]"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            disabled={loading}
            className={`px-4 py-2 rounded-lg ${
              loading
                ? "bg-gray-500"
                : "bg-[#6F8F76] hover:bg-[#5f7c66] text-black"
            }`}
          >
            {loading ? "Creating..." : "Create"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;
