"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

function formatNoteDate(value) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const day = String(
    date.getUTCDate()
  ).padStart(2, "0");
  const month = String(
    date.getUTCMonth() + 1
  ).padStart(2, "0");
  const year =
    date.getUTCFullYear();

  return `${day}/${month}/${year}`;
}

export default function NoteList({
  notes,
  workspaceId,
  activeFolder,
}) {
  const router = useRouter();

  //
  // ✅ FILTER STATES
  //
  const [search, setSearch] = useState("");

  const [selectedType, setSelectedType] =
    useState("all");

  const [showPinnedOnly, setShowPinnedOnly] =
    useState(false);

  const [sortBy, setSortBy] =
    useState("updated");

  //
  // ✅ FILTERING + SORTING
  //
  const filteredNotes = useMemo(() => {
    let result = [...(notes || [])];

    //
    // SEARCH
    //
    if (search.trim()) {
      const q = search.toLowerCase();

      result = result.filter((note) => {
        return (
          note.title
            ?.toLowerCase()
            .includes(q) ||

          note.summary
            ?.toLowerCase()
            .includes(q) ||

          note.tags?.some((tag) =>
            tag.toLowerCase().includes(q)
          )
        );
      });
    }

    //
    // TYPE FILTER
    //
    if (selectedType !== "all") {
      result = result.filter(
        (note) =>
          note.type === selectedType
      );
    }

    //
    // PINNED ONLY
    //
    if (showPinnedOnly) {
      result = result.filter(
        (note) => note.isPinned
      );
    }

    //
    // SORTING
    //
    result.sort((a, b) => {
      // pinned first
      if (a.isPinned && !b.isPinned)
        return -1;

      if (!a.isPinned && b.isPinned)
        return 1;

      //
      // recently updated
      //
      if (sortBy === "updated") {
        return (
          new Date(b.updatedAt) -
          new Date(a.updatedAt)
        );
      }

      //
      // title A-Z
      //
      if (sortBy === "title") {
        return a.title.localeCompare(
          b.title
        );
      }

      return 0;
    });

    return result;
  }, [
    notes,
    search,
    selectedType,
    showPinnedOnly,
    sortBy,
  ]);

  //
  // ✅ EMPTY STATE
  //
  if (!notes?.length) {
    return (
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          gap: 12,
          color: "#888",
        }}
      >
        <div
          style={{
            fontSize: 52,
          }}
        >
          🧠
        </div>

        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            color: "#333",
          }}
        >
          No notes yet
        </div>

        <div
          style={{
            fontSize: 14,
          }}
        >
          Create your first intelligent memory
        </div>
      </div>
    );
  }

  return (
    <div
      style={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "white",
      }}
    >
      {/* TOP BAR */}
      <div
        style={{
          padding: 16,
          borderBottom: "1px solid #eee",
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
          background: "white",
          position: "sticky",
          top: 0,
          zIndex: 20,
        }}
      >
        {/* SEARCH */}
        <input
          value={search}
          onChange={(e) =>
            setSearch(e.target.value)
          }
          placeholder="Search notes..."
          style={{
            flex: 1,
            minWidth: 240,
            padding: "11px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
            outline: "none",
            fontSize: 14,
          }}
        />

        {/* TYPE FILTER */}
        <select
          value={selectedType}
          onChange={(e) =>
            setSelectedType(
              e.target.value
            )
          }
          style={{
            padding: "11px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
            background: "white",
          }}
        >
          <option value="all">
            All Types
          </option>

          <option value="note">
            Note
          </option>

          <option value="idea">
            Idea
          </option>

          <option value="research">
            Research
          </option>

          <option value="memory">
            Memory
          </option>

          <option value="task">
            Task
          </option>

          <option value="meeting">
            Meeting
          </option>

          <option value="journal">
            Journal
          </option>
        </select>

        {/* PINNED FILTER */}
        <button
          onClick={() =>
            setShowPinnedOnly(
              !showPinnedOnly
            )
          }
          style={{
            padding: "11px 14px",
            borderRadius: 12,
            border: showPinnedOnly
              ? "1px solid #6366f1"
              : "1px solid #ddd",
            background: showPinnedOnly
              ? "#eef2ff"
              : "white",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          📌 Pinned
        </button>

        {/* SORT */}
        <select
          value={sortBy}
          onChange={(e) =>
            setSortBy(e.target.value)
          }
          style={{
            padding: "11px 14px",
            borderRadius: 12,
            border: "1px solid #ddd",
            background: "white",
          }}
        >
          <option value="updated">
            Recently Updated
          </option>

          <option value="title">
            Title A-Z
          </option>
        </select>
      </div>

      {/* TABLE HEADER */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "2.5fr 1fr 1.5fr 100px 140px",
          padding: "14px 20px",
          borderBottom: "1px solid #eee",
          fontWeight: 600,
          color: "#666",
          fontSize: 14,
          background: "#fafafa",
        }}
      >
        <div>Name</div>

        <div>Type</div>

        <div>Tags</div>

        <div>Pinned</div>

        <div>Updated</div>
      </div>

      {/* NOTES */}
      <div
        style={{
          overflowY: "auto",
          flex: 1,
        }}
      >
        {filteredNotes.map((note) => (
          <div
            key={note.id}
            onClick={() =>
              router.push(
                `/workspace/${workspaceId}/memories/${activeFolder}/${note.id}`
              )
            }
            style={{
              display: "grid",
              gridTemplateColumns:
                "2.5fr 1fr 1.5fr 100px 140px",
              padding: "18px 20px",
              borderBottom:
                "1px solid #f3f4f6",
              cursor: "pointer",
              alignItems: "center",
              transition:
                "background 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background =
                "#fafafa";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background =
                "white";
            }}
          >
            {/* TITLE */}
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 5,
              }}
            >
              <div
                style={{
                  fontWeight: 600,
                  color: "#222",
                  fontSize: 15,
                }}
              >
                {note.title ||
                  "Untitled"}
              </div>

              <div
                style={{
                  fontSize: 13,
                  color: "#888",
                  overflow: "hidden",
                  textOverflow:
                    "ellipsis",
                  whiteSpace: "nowrap",
                  maxWidth: 320,
                }}
              >
                {note.summary ||
                  "No summary"}
              </div>
            </div>

            {/* TYPE */}
            <div>
              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: 999,
                  background: "#eef2ff",
                  color: "#4338ca",
                  fontSize: 12,
                  fontWeight: 500,
                  textTransform:
                    "capitalize",
                }}
              >
                {note.type || "note"}
              </span>
            </div>

            {/* TAGS */}
            <div
              style={{
                display: "flex",
                gap: 6,
                flexWrap: "wrap",
              }}
            >
              {note.tags?.length ? (
                note.tags
                  .slice(0, 2)
                  .map((tag) => (
                    <span
                      key={tag}
                      style={{
                        background:
                          "#f3f4f6",
                        padding:
                          "5px 9px",
                        borderRadius:
                          999,
                        fontSize: 12,
                        color: "#555",
                      }}
                    >
                      #{tag}
                    </span>
                  ))
              ) : (
                <span
                  style={{
                    color: "#aaa",
                    fontSize: 13,
                  }}
                >
                  —
                </span>
              )}
            </div>

            {/* PINNED */}
            <div
              style={{
                fontSize: 18,
              }}
            >
              {note.isPinned
                ? "📌"
                : "—"}
            </div>

            {/* UPDATED */}
            <div
              style={{
                fontSize: 13,
                color: "#777",
              }}
            >
              {formatNoteDate(
                note.updatedAt
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
