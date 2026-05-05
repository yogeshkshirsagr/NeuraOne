"use client";

import { useState } from "react";
import FolderSidebar from "@/components/memory/FolderSidebar";
import NoteList from "@/components/memory/NoteList";

export default function MemoriesClient({
  folders,
  workspaceId,
  userId,
}) {
  const [activeFolder, setActiveFolder] = useState(folders?.[0]?.id || null);

  console.log("CLIENT PROPS:", { workspaceId, userId }); // 🔥 DEBUG

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 10,
        boxSizing: "border-box",
      }}
    >
      <section
        style={{
          display: "flex",
          height: "calc(100vh - 20px)",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          overflow: "hidden",
        }}
      >
        {/* LEFT */}
        <div style={{ width: 260, borderRight: "1px solid #e5e7eb" }}>
          <FolderSidebar
            folders={folders}
            activeFolder={activeFolder}
            setActiveFolder={setActiveFolder}
            workspaceId={workspaceId}
          />
        </div>

        {/* RIGHT */}
        <div style={{ flex: 1 }}>
          <NoteList
            folderId={activeFolder}
            workspaceId={workspaceId}
            userId={userId}
          />
        </div>
      </section>
    </main>
  );
}