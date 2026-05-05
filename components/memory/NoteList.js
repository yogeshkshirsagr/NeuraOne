"use client";

import { useEffect, useState } from "react";
import NoteEditor from "./NoteEditor";

export default function NoteList({ folderId, workspaceId, userId }) {
  const [notes, setNotes] = useState([]);
  const [activeNote, setActiveNote] = useState(null);

  // 🔹 Load notes
  useEffect(() => {
    if (!folderId) return;

    fetch(`/api/notes?folderId=${folderId}`)
      .then((res) => res.json())
      .then((data) => {
        setNotes(data);
        setActiveNote(null); // reset editor
      })
      .catch(console.error);
  }, [folderId]);

  // 🔹 Create note → OPEN EDITOR
  const createNote = async () => {
  if (!folderId) return alert("Select folder");

  const res = await fetch("/api/notes", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      folderId,
      workspaceId,
      userId,
      title: "Untitled",
      content: "",
    }),
  });

  const data = await res.json();

  if (!res.ok) {
    alert(data.error);
    return;
  }

  // ✅ ADD THIS (CRITICAL)
  setNotes((prev) => [data, ...prev]);
};

  // 🔹 NO folder selected
  if (!folderId) {
    return (
      <div style={{ padding: 20, color: "#9ca3af" }}>
        Select a folder
      </div>
    );
  }

  return (
    <div style={{ height: "100%" }}>
      
      {/* ✅ IF EDITING → SHOW ONLY EDITOR */}
      {activeNote ? (
        <NoteEditor
          note={activeNote}
          setNotes={setNotes}
          goBack={() => setActiveNote(null)}
        />
      ) : (
        <>
          {/* HEADER */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              padding: 16,
            }}
          >
            <h3>Notes</h3>
            <button onClick={createNote}>+ New Note</button>
          </div>

          {/* TABLE HEADER */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
              padding: "0 16px",
              fontWeight: "bold",
              borderBottom: "1px solid #e5e7eb",
              paddingBottom: 8,
            }}
          >
            <div>Name</div>
            <div>Type</div>
            <div>Tags</div>
            <div>Linked</div>
            <div>Modified</div>
          </div>

          {/* NOTES */}
          {notes.map((note) => (
            <div
              key={note.id}
              onClick={() => setActiveNote(note)}
              style={{
                display: "grid",
                gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr",
                padding: "10px 16px",
                borderBottom: "1px solid #f1f1f1",
                cursor: "pointer",
              }}
            >
              <div>{note.title || "Untitled"}</div>
              <div>Note</div>
              <div>-</div>
              <div>-</div>
              <div>
                {new Date(note.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))}
        </>
      )}
    </div>
  );
}
