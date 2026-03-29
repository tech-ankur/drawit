"use client";
import { HTTP_URL } from "@/config";
import axios from "axios";
import React, { useState } from "react";

const CreateRoom = ({ onClose, onCreated }: any) => {
  const [slug, setSlug] = useState("");

  const handleCreate = async () => {
    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        `${HTTP_URL}/api/room`,
        { slug:slug },
        {
          headers: {
            Authorization: token,
          },
        }
      );

      onCreated(res.data);
      onClose();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    // 🔹 Background Overlay
    <div
      className="fixed inset-0 bg-black/40 flex justify-center items-center z-50"
      onClick={onClose} // 👈 click outside closes
    >
      {/* 🔹 Modal Card */}
      <div
        className="bg-white p-6 rounded-xl w-80 shadow-lg"
        onClick={(e) => e.stopPropagation()} // 👈 prevent closing when clicking inside
      >
        <h2 className="text-lg font-bold mb-4">Create Room</h2>

        <input
          type="text"
          placeholder="Enter room name"
          value={slug}
          onChange={(e) => setSlug(e.target.value)}
          className="w-full border p-2 mb-4 rounded"
        />

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3 py-1 border rounded"
          >
            Cancel
          </button>

          <button
            onClick={handleCreate}
            className="bg-blue-500 text-white px-3 py-1 rounded"
          >
            Create
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateRoom;