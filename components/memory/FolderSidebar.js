"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function FolderSidebar({
  folders: initialFolders,
  activeFolder,
  workspaceId,
}) {
  const [folders, setFolders] = useState(initialFolders || []);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const router = useRouter();

  // 🔥 CREATE FOLDER
  const createFolder = async () => {
    if (!newName.trim()) return;

    try {
      const res = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newName,
          workspaceId,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      // update sidebar instantly
      setFolders((prev) => [...prev, data]);

      // reset input
      setNewName("");
      setCreating(false);

      // 🔥 go to folder url
      router.push(
        `/workspace/${workspaceId}/memories/${data.id}`
      );
    } catch (err) {
      console.error("Create folder error:", err);
    }
  };

  return (
    <div style={{ padding: 12 }}>
      {/* HEADER */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 10,
        }}
      >
        <h3>Folders</h3>

        <button
          onClick={() => setCreating(true)}
          style={{
            fontSize: 18,
            cursor: "pointer",
            background: "transparent",
            border: "none",
          }}
        >
          +
        </button>
      </div>

      {/* CREATE FOLDER */}
      {creating && (
        <div style={{ marginBottom: 10 }}>
          <input
            autoFocus
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New folder"
            style={{
              width: "100%",
              padding: 6,
              border: "1px solid #ddd",
              borderRadius: 6,
              marginBottom: 6,
            }}
          />

          <div style={{ display: "flex", gap: 6 }}>
            <button onClick={createFolder}>
              Create
            </button>

            <button
              onClick={() => {
                setCreating(false);
                setNewName("");
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* FOLDER LIST */}
      {folders.map((folder) => (
        <div
          key={folder.id}
          onClick={() => {
            router.push(
              `/workspace/${workspaceId}/memories/${folder.id}`
            );
          }}
          style={{
            padding: 8,
            cursor: "pointer",
            borderRadius: 6,
            marginBottom: 4,
            background:
              activeFolder === folder.id
                ? "#f3f4f6"
                : "transparent",
          }}
        >
          {folder.name}
        </div>
      ))}
    </div>
  );
}