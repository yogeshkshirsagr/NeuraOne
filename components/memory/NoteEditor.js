"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";

import { useEffect, useState } from "react";

export default function NoteEditor({ note }) {
  const [title, setTitle] = useState(note?.title || "Untitled");
  const [saving, setSaving] = useState(false);

  // 🔥 MAIN EDITOR (THIS is useEditor)
  const editor = useEditor({
    extensions: [
      StarterKit,
      Underline,
      Link,
      Image,
      Placeholder.configure({
        placeholder: "Start writing...",
      }),
    ],
    content: note?.content || "",
    immediatelyRender: false, // ✅ fixes SSR error
    onUpdate: ({ editor }) => {
      saveNote(title, editor.getHTML());
    },
  });

  // 🔥 AUTO SAVE FUNCTION
  const saveNote = async (newTitle, content) => {
    if (!note?.id) return;

    setSaving(true);

    await fetch(`/api/notes/${note.id}`, {
      method: "PUT",
      body: JSON.stringify({
        title: newTitle,
        content,
      }),
    });

    setSaving(false);
  };

  // 🔥 SAVE TITLE
  useEffect(() => {
    if (!editor) return;
    saveNote(title, editor.getHTML());
  }, [title]);

  if (!editor) return null;

  return (
    <div
      style={{
        padding: 40,
        maxWidth: 900,
        margin: "0 auto",
      }}
    >
      {/* TITLE */}
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Untitled"
        style={{
          fontSize: 40,
          fontWeight: "bold",
          border: "none",
          outline: "none",
          width: "100%",
          marginBottom: 20,
        }}
      />

      {/* STATUS */}
      <div style={{ fontSize: 12, color: "#888", marginBottom: 10 }}>
        {saving ? "Saving..." : "Saved"}
      </div>

      {/* TOOLBAR */}
      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          borderBottom: "1px solid #eee",
          paddingBottom: 10,
          marginBottom: 20,
        }}
      >
        <button onClick={() => editor.chain().focus().toggleBold().run()}>B</button>
        <button onClick={() => editor.chain().focus().toggleItalic().run()}>I</button>
        <button onClick={() => editor.chain().focus().toggleUnderline().run()}>U</button>

        <button onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}>
          H1
        </button>
        <button onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}>
          H2
        </button>

        <button onClick={() => editor.chain().focus().toggleBulletList().run()}>
          • List
        </button>

        <button onClick={() => editor.chain().focus().toggleOrderedList().run()}>
          1. List
        </button>

        <button onClick={() => editor.chain().focus().toggleBlockquote().run()}>
          Quote
        </button>

        <button onClick={() => editor.chain().focus().setHorizontalRule().run()}>
          Divider
        </button>

        <button
          onClick={() => {
            const url = prompt("Enter link");
            if (url) editor.chain().focus().setLink({ href: url }).run();
          }}
        >
          Link
        </button>

        <button
          onClick={() => {
            const url = prompt("Image URL");
            if (url) editor.chain().focus().setImage({ src: url }).run();
          }}
        >
          Image
        </button>
      </div>

      {/* EDITOR */}
      <EditorContent editor={editor} />
    </div>
  );
}