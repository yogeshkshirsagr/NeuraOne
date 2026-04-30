"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function EditorPage() {
  const params = useParams();
  const noteId = params?.noteId;

  const [title, setTitle] = useState("Untitled");

  const editor = useEditor({
    extensions: [StarterKit],
    content: "<p>Start typing...</p>",
    immediatelyRender: false,

    onUpdate: ({ editor }) => {
      if (!noteId) return;

      const json = editor.getJSON();

      console.log("🔥 Saving:", noteId);

      fetch("/api/save-note", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          noteId,
          content: json,
        }),
      });
    },
  });

  useEffect(() => {
    if (!noteId || !editor) return;

    fetch(`/api/get-note?noteId=${noteId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.content) {
          editor.commands.setContent(data.content);
        }
      });
  }, [noteId, editor]);

  if (!editor) return null;

  return (
    <div style={{ maxWidth: 800, margin: "40px auto", color: "white" }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Untitled"
        style={{
          width: "100%",
          fontSize: "28px",
          background: "transparent",
          border: "none",
          color: "white",
          marginBottom: "10px",
        }}
      />

      <button onClick={() => editor.chain().focus().toggleBold().run()}>
        Bold
      </button>

      <button onClick={() => editor.chain().focus().toggleItalic().run()}>
        Italic
      </button>

      <div style={{ border: "1px solid #333", padding: 10, marginTop: 10 }}>
        <EditorContent editor={editor} />
      </div>
    </div>
  );
}