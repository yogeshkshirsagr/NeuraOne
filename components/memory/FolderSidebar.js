"use client";
import { useState } from "react";

export default function FolderSidebar({
  folders: initialFolders,
  activeFolder,
  setActiveFolder,
  workspaceId,
}) {
  const [folders, setFolders] = useState(initialFolders || []);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  // 🔥 CREATE FOLDER
  const createFolder = async () => {
    if (!newName.trim()) return;

    try {
      setCreating(true);

      const res = await fetch("/api/folders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newName,
          workspaceId, // ✅ REQUIRED
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error);
        return;
      }

      // ✅ update UI instantly (NO reload)
      setFolders((prev) => [...prev, data]);

      setNewName("");
      setCreating(false);
    } catch (err) {
      console.error("Create folder error:", err);
      setCreating(false);
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
          }}
        >
          +
        </button>
      </div>

      {/* 🔥 CREATE INPUT */}
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
            <button onClick={createFolder}>Create</button>
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
          onClick={() => setActiveFolder(folder.id)}
          style={{
            padding: 8,
            cursor: "pointer",
            borderRadius: 6,
            background:
              activeFolder === folder.id ? "#f3f4f6" : "transparent",
          }}
        >
          {folder.name}
        </div>
      ))}
    </div>
  );
}