"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import FolderSidebar from "@/components/memory/FolderSidebar";
import NoteList from "@/components/memory/NoteList";
import NoteEditor from "@/components/memory/NoteEditor";
import GraphView from "@/components/memory/GraphView";

export default function MemoriesClient({
  folders,
  notes: initialNotes = [],
  workspaceId,
  userId,
  activeFolder,
  activeNote,
}) {
  const router = useRouter();

  const [notes, setNotes] =
    useState(initialNotes);

  const [loading, setLoading] =
    useState(false);

  const [viewMode, setViewMode] =
    useState("list");

  //
  // -----------------------------------
  // FETCH NOTES
  // -----------------------------------
  //

  useEffect(() => {
    if (!activeFolder) {
      queueMicrotask(() => {
        setNotes([]);
      });

      return;
    }

    async function loadNotes() {
      try {
        setLoading(true);

        const res = await fetch(
          `/api/notes?workspaceId=${workspaceId}&folderId=${activeFolder}`,
          {
            cache: "no-store",
          }
        );

        const data =
          await res.json();

        setNotes(data);
      } catch (err) {
        console.error(
          "LOAD NOTES ERROR:",
          err
        );
      } finally {
        setLoading(false);
      }
    }

    loadNotes();
  }, [activeFolder, workspaceId]);

  //
  // -----------------------------------
  // CREATE NOTE
  // -----------------------------------
  //

  async function createNote() {
    if (!activeFolder) return;

    try {
      const res = await fetch(
        "/api/notes",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            folderId:
              activeFolder,

            workspaceId,

            userId,
          }),
        }
      );

      const newNote =
        await res.json();

      //
      // UPDATE LOCAL LIST
      //
      setNotes((prev) => [
        newNote,
        ...prev,
      ]);

      //
      // NAVIGATE
      //
      router.push(
        `/workspace/${workspaceId}/memories/${activeFolder}/${newNote.id}`
      );
    } catch (err) {
      console.error(
        "CREATE NOTE ERROR:",
        err
      );
    }
  }

  //
  // -----------------------------------
  // UI
  // -----------------------------------
  //

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 10,
        boxSizing: "border-box",
        overflow: "hidden",
      }}
    >
      <section
        style={{
          display: "flex",

          height:
            "calc(100vh - 20px)",

          background: "#fff",

          border:
            "1px solid #e5e7eb",

          borderRadius: 12,

          overflow: "hidden",
        }}
      >
        {/* LEFT SIDEBAR */}

        <div
          style={{
            width: 260,

            borderRight:
              "1px solid #e5e7eb",

            flexShrink: 0,
          }}
        >
          <FolderSidebar
            folders={folders}
            activeFolder={
              activeFolder
            }
            workspaceId={
              workspaceId
            }
          />
        </div>

        {/* RIGHT SIDE */}

        <div
          style={{
            flex: 1,

            minWidth: 0,

            display: "flex",

            flexDirection: "column",

            overflow: "hidden",
          }}
        >
          {/* HEADER */}

          <div
            style={{
              display: "flex",

              justifyContent:
                "space-between",

              alignItems:
                "center",

              padding:
                "10px 16px",

              borderBottom:
                "1px solid #e5e7eb",

              fontWeight: 600,
            }}
          >
            {/* LEFT */}

            <div
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: 10,
              }}
            >
              <span>
                {viewMode ===
                "graph"
                  ? "Graph View"
                  : activeNote
                  ? "Editor"
                  : "Notes"}
              </span>

              {/* LIST BUTTON */}

              <button
                onClick={() =>
                  setViewMode(
                    "list"
                  )
                }
                style={{
                  padding:
                    "6px 12px",

                  borderRadius: 8,

                  border:
                    viewMode ===
                    "list"
                      ? "1px solid #111"
                      : "1px solid #ddd",

                  background:
                    viewMode ===
                    "list"
                      ? "#111"
                      : "#fff",

                  color:
                    viewMode ===
                    "list"
                      ? "#fff"
                      : "#111",

                  cursor:
                    "pointer",

                  fontWeight: 500,
                }}
              >
                List
              </button>

              {/* GRAPH BUTTON */}

              <button
                onClick={() =>
                  setViewMode(
                    "graph"
                  )
                }
                style={{
                  padding:
                    "6px 12px",

                  borderRadius: 8,

                  border:
                    viewMode ===
                    "graph"
                      ? "1px solid #111"
                      : "1px solid #ddd",

                  background:
                    viewMode ===
                    "graph"
                      ? "#111"
                      : "#fff",

                  color:
                    viewMode ===
                    "graph"
                      ? "#fff"
                      : "#111",

                  cursor:
                    "pointer",

                  fontWeight: 500,
                }}
              >
                Graph
              </button>
            </div>

            {/* RIGHT */}

            <button
              onClick={createNote}
              style={{
                padding:
                  "6px 10px",

                border:
                  "1px solid #ddd",

                borderRadius: 6,

                background:
                  "#fff",

                cursor: "pointer",

                fontWeight: 500,
              }}
            >
              + New Note
            </button>
          </div>

          {/* CONTENT */}

          <div
            style={{
              flex: 1,
              minHeight: 0,
              overflow: "hidden",
              position: "relative",
            }}
          >
            {viewMode ===
            "graph" ? (
              <GraphView
                workspaceId={
                  workspaceId
                }
              />
            ) : activeNote ? (
              <NoteEditor
                note={activeNote}
                notes={notes}
                workspaceId={
                  workspaceId
                }
                folderId={
                  activeFolder
                }
              />
            ) : loading ? (
              <div
                style={{
                  padding: 20,
                  color: "#888",
                }}
              >
                Loading notes...
              </div>
            ) : (
              <NoteList
                notes={notes}
                workspaceId={
                  workspaceId
                }
                activeFolder={
                  activeFolder
                }
              />
            )}
          </div>
        </div>
      </section>
    </main>
  );
}