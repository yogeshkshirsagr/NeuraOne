"use client";

import { useState } from "react";

export default function CreateNoteModal({
  folderId,
  workspaceId,
  userId,
  onCreated,
}) {
  const [loading, setLoading] = useState(false);

  const createNote = async () => {
    if (!folderId || !workspaceId || !userId) {
      alert("Missing required data");
      return;
    }

    try {
      setLoading(true);

      const res = await fetch("/api/notes", {
        method: "POST",
        body: JSON.stringify({
          folderId,
          workspaceId,
          userId,
        }),
      });

      const newNote = await res.json();

      // 🔥 update UI instantly
      onCreated?.(newNote);
    } catch (err) {
      console.error(err);
      alert("Failed to create note");
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={createNote}
      disabled={loading}
      style={{
        padding: "6px 10px",
        border: "1px solid #ddd",
        borderRadius: 6,
        cursor: "pointer",
        background: "#fff",
      }}
    >
      {loading ? "Creating..." : "+ New Note"}
    </button>
  );
}