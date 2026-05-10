"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";
import { createPortal } from "react-dom";

import {
  EditorContent,
  useEditor,
} from "@tiptap/react";

import StarterKit from "@tiptap/starter-kit";

const NOTE_TYPES = [
  "note",
  "idea",
  "meeting",
  "task",
  "research",
  "journal",
];

const POPUP_WIDTH = 280;
const POPUP_MAX_HEIGHT = 320;
const POPUP_GAP = 8;

const EMPTY_AUTOCOMPLETE = {
  open: false,
  type: null,
  query: "",
  range: null,
  items: [],
  selectedIndex: 0,
  position: {
    top: 0,
    left: 0,
  },
};

function getNoteTitle(note) {
  return note?.title?.trim() || "Untitled";
}

function normalizeText(value) {
  return value.toLowerCase().trim();
}

function getAutocompleteMatch(editor) {
  const { selection } = editor.state;

  if (!selection.empty) {
    return null;
  }

  const { from, $from } = selection;
  const blockStart =
    from - $from.parentOffset;

  const textBefore =
    editor.state.doc.textBetween(
      blockStart,
      from,
      "\n",
      "\n"
    );

  const wikiMatch =
    textBefore.match(
      /(?:^|[^\[])\[\[([^\]\n]*)$/
    );

  if (wikiMatch) {
    const triggerText =
      wikiMatch[0].startsWith("[[")
        ? wikiMatch[0]
        : wikiMatch[0].slice(1);

    return {
      type: "wiki",
      query: wikiMatch[1] || "",
      range: {
        from:
          from -
          triggerText.length,
        to: from,
      },
    };
  }

  const mentionMatch =
    textBefore.match(
      /(?:^|[\s([{])@([^\s@\[\]]*)$/
    );

  if (mentionMatch) {
    const triggerText =
      mentionMatch[0].startsWith("@")
        ? mentionMatch[0]
        : mentionMatch[0].slice(1);

    return {
      type: "mention",
      query: mentionMatch[1] || "",
      range: {
        from:
          from -
          triggerText.length,
        to: from,
      },
    };
  }

  return null;
}

function filterAutocompleteNotes(
  notes,
  currentNoteId,
  query
) {
  const normalizedQuery =
    normalizeText(query);

  return (notes || [])
    .filter((candidate) => {
      if (
        candidate.id ===
        currentNoteId
      ) {
        return false;
      }

      if (!normalizedQuery) {
        return true;
      }

      return normalizeText(
        getNoteTitle(candidate)
      ).includes(normalizedQuery);
    })
    .slice(0, 12);
}

function mergeNotesById(...noteLists) {
  const merged = new Map();

  noteLists.flat().forEach((item) => {
    if (item?.id) {
      merged.set(item.id, item);
    }
  });

  return Array.from(merged.values());
}

function getPopupPosition(editor) {
  const { from } =
    editor.state.selection;
  let coords;

  try {
    coords =
      editor.view.coordsAtPos(from);
  } catch {
    return {
      top: POPUP_GAP,
      left: POPUP_GAP,
    };
  }
  const viewportWidth =
    window.innerWidth;
  const viewportHeight =
    window.innerHeight;

  const left = Math.min(
    Math.max(
      POPUP_GAP,
      coords.left
    ),
    viewportWidth -
      POPUP_WIDTH -
      POPUP_GAP
  );

  const below =
    coords.bottom + POPUP_GAP;
  const above =
    coords.top -
    POPUP_MAX_HEIGHT -
    POPUP_GAP;

  return {
    top:
      below + POPUP_MAX_HEIGHT <=
      viewportHeight
        ? below
        : Math.max(
            POPUP_GAP,
            above
          ),
    left,
  };
}

export default function NoteEditor({
  note,
  notes = [],
  workspaceId,
  folderId,
}) {
  const router = useRouter();

  //
  // STATES
  //
  const [title, setTitle] =
    useState("");

  const [type, setType] =
    useState("note");

  const [tags, setTags] =
    useState("");

  const [summary, setSummary] =
    useState("");
  
  const [relations, setRelations] =
    useState({
    outgoing: [],
    incoming: [],
  });

  const [saving, setSaving] =
    useState(false);

  //
  // AUTOCOMPLETE
  //
  const [allNotes, setAllNotes] =
    useState(notes || []);

  const [
    autocomplete,
    setAutocomplete,
  ] = useState(
    EMPTY_AUTOCOMPLETE
  );

  //
  // REFS
  //
  const titleRef = useRef("");

  const typeRef = useRef("");

  const tagsRef = useRef("");

  const summaryRef = useRef("");

  const allNotesRef = useRef([]);

  const noteIdRef = useRef(note?.id);

  const noteRef = useRef(note);

  const autocompleteRef =
    useRef(EMPTY_AUTOCOMPLETE);

  const editorShellRef = useRef(null);

  const editorRef = useRef(null);

  const workspaceIdRef = useRef(
    workspaceId || note?.workspaceId
  );

  const folderIdRef = useRef(
    folderId || note?.folderId
  );

  //
  // LOAD ALL NOTES
  //
  useEffect(() => {
    const loadNotes = async () => {
      try {
        const scopeWorkspaceId =
          workspaceId ||
          note?.workspaceId;
        const scopeFolderId =
          folderId ||
          note?.folderId;

        const params =
          new URLSearchParams();

        if (scopeWorkspaceId) {
          params.set(
            "workspaceId",
            scopeWorkspaceId
          );
        } else if (scopeFolderId) {
          params.set(
            "folderId",
            scopeFolderId
          );
        }

        if (!params.toString()) {
          setAllNotes(notes || []);
          return;
        }

        const res = await fetch(
          `/api/notes?${params.toString()}`,
          {
            cache: "no-store",
          }
        );

        const data =
          await res.json();

        if (!res.ok) {
          throw new Error(
            data?.error ||
              "Failed to load notes"
          );
        }

        setAllNotes(
          mergeNotesById(
            notes || [],
            data || []
          )
        );
      } catch (err) {
        console.error(err);
        setAllNotes(notes || []);
      }
    };

    loadNotes();
  }, [
    notes,
    workspaceId,
    folderId,
    note?.workspaceId,
    note?.folderId,
  ]);


  useEffect(() => {
    allNotesRef.current = allNotes;
  }, [allNotes]);

  useEffect(() => {
    noteIdRef.current = note?.id;
    noteRef.current = note;
    workspaceIdRef.current =
      workspaceId || note?.workspaceId;
    folderIdRef.current =
      folderId || note?.folderId;
  }, [note, workspaceId, folderId]);

  useEffect(() => {
    autocompleteRef.current =
      autocomplete;
  }, [autocomplete]);

  //
  // SAVE NOTE
  //
  const saveNote = async (
    currentTitle,
    currentContent
  ) => {
    const currentNote =
      noteRef.current;

    if (!currentNote?.id) {
      return;
    }

    try {
      setSaving(true);

      await fetch(
        `/api/notes/${currentNote.id}`,
        {
          method: "PATCH",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            title:
              currentTitle ||
              "Untitled",

            content:
              currentContent,

            type:
              typeRef.current ||
              "note",

            tags:
              tagsRef.current,

            summary:
              summaryRef.current,

            isPinned:
              currentNote.isPinned,

            isArchived:
              currentNote.isArchived,
          }),
        }
      );
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  const closeAutocomplete =
    useCallback(() => {
      setAutocomplete(
        EMPTY_AUTOCOMPLETE
      );
    }, []);

  const refreshAutocomplete =
    useCallback((activeEditor) => {
      if (!activeEditor) return;

      const match =
        getAutocompleteMatch(
          activeEditor
        );

      if (!match) {
        closeAutocomplete();
        return;
      }

      const items =
        filterAutocompleteNotes(
          allNotesRef.current,
          noteIdRef.current,
          match.query
        );

      setAutocomplete((prev) => ({
        open: true,
        type: match.type,
        query: match.query,
        range: match.range,
        items,
        selectedIndex: Math.min(
          prev.open
            ? prev.selectedIndex
            : 0,
          Math.max(
            items.length - 1,
            0
          )
        ),
        position:
          getPopupPosition(
            activeEditor
          ),
      }));
    }, [closeAutocomplete]);

  const moveAutocompleteSelection =
    useCallback((direction) => {
      setAutocomplete((prev) => {
        if (
          !prev.open ||
          !prev.items.length
        ) {
          return prev;
        }

        return {
          ...prev,
          selectedIndex:
            (prev.selectedIndex +
              direction +
              prev.items.length) %
            prev.items.length,
        };
      });
    }, []);

  const insertAutocompleteNote =
    useCallback((targetNote) => {
      const activeEditor =
        editorRef.current;
      const activeAutocomplete =
        autocompleteRef.current;

      if (
        !activeEditor ||
        !targetNote ||
        !activeAutocomplete.range
      ) {
        return;
      }

      const linkedTitle =
        getNoteTitle(targetNote);

      const insertedText =
        activeAutocomplete.type ===
        "wiki"
          ? `[[${linkedTitle}]] `
          : `@${linkedTitle.replace(
              /\s+/g,
              ""
            )} `;

      activeEditor
        .chain()
        .focus()
        .deleteRange(
          activeAutocomplete.range
        )
        .insertContent(
          insertedText
        )
        .run();

      closeAutocomplete();

      window.clearTimeout(
        window.noteSaveTimer
      );

      window.noteSaveTimer =
        window.setTimeout(() => {
          saveNote(
            titleRef.current,
            activeEditor.getHTML()
          );
        }, 100);
    }, [closeAutocomplete]);

  //
  // EDITOR
  //
  const editor = useEditor({
    extensions: [StarterKit],

    content: note.content || "",

    immediatelyRender: false,

    editorProps: {
      handleKeyDown: (
        view,
        event
      ) => {
        const current =
          autocompleteRef.current;

        if (!current.open) {
          return false;
        }

        if (
          event.key ===
          "ArrowDown"
        ) {
          event.preventDefault();
          moveAutocompleteSelection(1);
          return true;
        }

        if (
          event.key ===
          "ArrowUp"
        ) {
          event.preventDefault();
          moveAutocompleteSelection(-1);
          return true;
        }

        if (
          event.key === "Enter" ||
          event.key === "Tab"
        ) {
          if (
            !current.items.length
          ) {
            return false;
          }

          event.preventDefault();
          insertAutocompleteNote(
            current.items[
              current.selectedIndex
            ]
          );
          return true;
        }

        if (
          event.key ===
          "Escape"
        ) {
          event.preventDefault();
          closeAutocomplete();
          return true;
        }

        return false;
      },
    },

    onUpdate: ({ editor }) => {
      const html =
        editor.getHTML();

      refreshAutocomplete(editor);

      clearTimeout(
        window.noteSaveTimer
      );

      window.noteSaveTimer =
        setTimeout(() => {
          saveNote(
            titleRef.current,
            html
          );
        }, 500);
    },

    onSelectionUpdate: ({
      editor,
    }) => {
      refreshAutocomplete(editor);
    },

    onBlur: () => {
      window.setTimeout(() => {
        const popup =
          document.getElementById(
            "note-autocomplete-popup"
          );

        if (
          popup?.contains(
            document.activeElement
          )
        ) {
          return;
        }

        closeAutocomplete();
      }, 0);
    },
  });

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  //
  // LOAD NOTE
  //
  useEffect(() => {
    if (!note || !editor)
      return;

    titleRef.current =
      note.title || "";

    typeRef.current =
      note.type || "note";

    tagsRef.current =
      note.tags || "";

    summaryRef.current =
      note.summary || "";
    
    let cancelled = false;

    queueMicrotask(() => {
      if (cancelled) return;

      setTitle(note.title || "");
      setType(note.type || "note");
      setTags(note.tags || "");
      setSummary(
        note.summary || ""
      );
    //
    // LOAD RELATIONS
    //
    fetch(
      `/api/notes/${note.id}/relations`
    )
  .then((res) => res.json())
  .then((data) => {
    setRelations({
      outgoing:
        data.outgoing || [],
      incoming:
        data.incoming || [],
    });
  })
  .catch(console.error);

      closeAutocomplete();
    });

    if (
      editor.getHTML() !==
      (note.content || "")
    ) {
      editor.commands.setContent(
        note.content || ""
      );
    }

    return () => {
      cancelled = true;
    };
  }, [
    note,
    editor,
    closeAutocomplete,
  ]);

  useEffect(() => {
    if (
      autocomplete.open &&
      editor
    ) {
      const frame =
        window.requestAnimationFrame(
          () => {
            refreshAutocomplete(
              editor
            );
          }
        );

      return () => {
        window.cancelAnimationFrame(
          frame
        );
      };
    }
  }, [
    allNotes,
    autocomplete.open,
    editor,
    refreshAutocomplete,
  ]);

  useEffect(() => {
    if (!editor) return;

    const reposition = () => {
      if (
        !autocompleteRef.current.open
      ) {
        return;
      }

      setAutocomplete((prev) => ({
        ...prev,
        position:
          getPopupPosition(editor),
      }));
    };

    window.addEventListener(
      "resize",
      reposition
    );
    window.addEventListener(
      "scroll",
      reposition,
      true
    );

    return () => {
      window.removeEventListener(
        "resize",
        reposition
      );
      window.removeEventListener(
        "scroll",
        reposition,
        true
      );
    };
  }, [editor]);

  useEffect(() => {
    const handlePointerDown = (
      event
    ) => {
      if (
        !autocompleteRef.current.open
      ) {
        return;
      }

      const popup =
        document.getElementById(
          "note-autocomplete-popup"
        );

      if (
        popup?.contains(
          event.target
        ) ||
        editorShellRef.current?.contains(
          event.target
        )
      ) {
        return;
      }

      closeAutocomplete();
    };

    document.addEventListener(
      "pointerdown",
      handlePointerDown
    );

    return () => {
      document.removeEventListener(
        "pointerdown",
        handlePointerDown
      );
    };
  }, [closeAutocomplete]);

  if (!editor) return null;

  return (
    <div
      style={{
        display: "flex",
        height: "100%",
      }}
    >
      {/* MAIN */}
      <div
        ref={editorShellRef}
        style={{
          flex: 1,
          padding: 48,
          overflowY: "auto",
          position: "relative",
        }}
      >
        {/* TITLE */}
        <input
          value={title}
          placeholder="Untitled"

          onChange={(e) => {
            const value =
              e.target.value;

            setTitle(value);

            titleRef.current =
              value;

            clearTimeout(
              window.titleTimer
            );

            window.titleTimer =
              setTimeout(() => {
                saveNote(
                  value,
                  editor.getHTML()
                );
              }, 500);
          }}

          style={{
            width: "100%",
            border: "none",
            outline: "none",
            fontSize: 64,
            fontWeight: 800,
            marginBottom: 24,
            background:
              "transparent",
          }}
        />

        {/* STATUS */}
        <div
          style={{
            fontSize: 14,
            color: "#888",
            marginBottom: 24,
          }}
        >
          {saving
            ? "Saving..."
            : "Saved"}
        </div>

        {/* TOOLBAR */}
        <div
          style={{
            display: "flex",
            gap: 12,
            marginBottom: 24,
            paddingBottom: 16,
            borderBottom:
              "1px solid #eee",
          }}
        >
          <button
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleBold()
                .run()
            }
          >
            B
          </button>

          <button
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleItalic()
                .run()
            }
          >
            I
          </button>

          <button
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({
                  level: 1,
                })
                .run()
            }
          >
            H1
          </button>

          <button
            onClick={() =>
              editor
                .chain()
                .focus()
                .toggleHeading({
                  level: 2,
                })
                .run()
            }
          >
            H2
          </button>
        </div>

        {/* EDITOR */}
        <EditorContent
          editor={editor}
        />

        {/* AUTOCOMPLETE POPUP */}
        {autocomplete.open &&
          createPortal(
            <div
              id="note-autocomplete-popup"
              role="listbox"
              style={{
                position: "fixed",

                top:
                  autocomplete
                    .position.top,

                left:
                  autocomplete
                    .position.left,

                width: POPUP_WIDTH,

                maxHeight:
                  POPUP_MAX_HEIGHT,

                background: "#fff",

                border:
                  "1px solid #e5e7eb",

                borderRadius: 14,

                boxShadow:
                  "0 12px 30px rgba(0,0,0,0.08)",

                overflowY: "auto",

                zIndex: 999999,
              }}
              onMouseDown={(e) =>
                e.preventDefault()
              }
            >
              {autocomplete.items
                .length ? (
                autocomplete.items.map(
                  (n, index) => (
                    <div
                      key={n.id}
                      role="option"
                      aria-selected={
                        autocomplete.selectedIndex ===
                        index
                      }
                      onMouseEnter={() =>
                        setAutocomplete(
                          (prev) => ({
                            ...prev,
                            selectedIndex:
                              index,
                          })
                        )
                      }
                      onClick={() =>
                        insertAutocompleteNote(
                          n
                        )
                      }
                      style={{
                        padding:
                          "14px 16px",

                        cursor: "pointer",

                        borderBottom:
                          "1px solid #f3f4f6",

                        fontSize: 15,

                        fontWeight: 500,

                        background:
                          autocomplete.selectedIndex ===
                          index
                            ? "#f3f4f6"
                            : "#fff",
                      }}
                    >
                      {getNoteTitle(n)}
                    </div>
                  )
                )
              ) : (
                <div
                  style={{
                    padding:
                      "14px 16px",
                    color: "#888",
                    fontSize: 15,
                  }}
                >
                  No matching notes
                </div>
              )}
            </div>,
            document.body
          )}
      </div>

      {/* RIGHT PANEL */}
      <div
        style={{
          width: 320,
          borderLeft:
            "1px solid #eee",
          padding: 24,
          overflowY: "auto",
        }}
      >
        {/* TYPE */}
        <div
          style={{
            marginBottom: 28,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Type
          </div>

          <select
            value={type}
            onChange={(e) => {
              setType(
                e.target.value
              );

              typeRef.current =
                e.target.value;

              saveNote(
                titleRef.current,
                editor.getHTML()
              );
            }}
            style={{
              width: "100%",
              padding: 16,
              border:
                "1px solid #e5e7eb",
              borderRadius: 14,
              fontSize: 16,
              outline: "none",
            }}
          >
            {NOTE_TYPES.map(
              (t) => (
                <option
                  key={t}
                  value={t}
                >
                  {t}
                </option>
              )
            )}
          </select>
        </div>

        {/* TAGS */}
        <div
          style={{
            marginBottom: 28,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Tags
          </div>

          <input
            value={tags}

            placeholder="react, ai, nextjs"

            onChange={(e) => {
              setTags(
                e.target.value
              );

              tagsRef.current =
                e.target.value;

              clearTimeout(
                window.tagTimer
              );

              window.tagTimer =
                setTimeout(() => {
                  saveNote(
                    titleRef.current,
                    editor.getHTML()
                  );
                }, 400);
            }}

            style={{
              width: "100%",
              padding: 16,
              border:
                "1px solid #e5e7eb",
              borderRadius: 14,
              outline: "none",
              fontSize: 15,
            }}
          />
        </div>

        {/* SUMMARY */}
        <div>
          <div
            style={{
              fontWeight: 700,
              marginBottom: 12,
            }}
          >
            Summary
          </div>

          <textarea
            value={summary}

            placeholder="Short summary of this note..."

            onChange={(e) => {
              setSummary(
                e.target.value
              );

              summaryRef.current =
                e.target.value;

              clearTimeout(
                window.summaryTimer
              );

              window.summaryTimer =
                setTimeout(() => {
                  saveNote(
                    titleRef.current,
                    editor.getHTML()
                  );
                }, 400);
            }}

            style={{
              width: "100%",
              minHeight: 220,
              resize: "vertical",
              padding: 18,
              border:
                "1px solid #e5e7eb",
              borderRadius: 16,
              outline: "none",
              fontSize: 16,
              lineHeight: 1.8,
            }}
            
          />
                </div>

        {/* CONNECTED NOTES */}
        <div
          style={{
            marginTop: 36,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              marginBottom: 14,
              fontSize: 16,
            }}
          >
            Connected Notes
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {relations.outgoing
              .length === 0 ? (
              <div
                style={{
                  color: "#999",
                  fontSize: 14,
                }}
              >
                No connected notes
              </div>
            ) : (
              relations.outgoing.map(
                (relation) => (
                  <button
                    key={relation.id}
                    onClick={() =>
                      router.push(
                        `/workspace/${workspaceId}/memories/${folderId}/${relation.toNote.id}`
                      )
                    }
                    style={{
                      width: "100%",
                      padding:
                        "12px 14px",
                      border:
                        "1px solid #e5e7eb",
                      borderRadius: 14,
                      background:
                        "#fff",
                      cursor: "pointer",
                      textAlign: "left",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {
                      relation.toNote
                        ?.title
                    }
                  </button>
                )
              )
            )}
          </div>
        </div>

        {/* BACKLINKS */}
        <div
          style={{
            marginTop: 36,
          }}
        >
          <div
            style={{
              fontWeight: 700,
              marginBottom: 14,
              fontSize: 16,
            }}
          >
            Mentioned In
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: 10,
            }}
          >
            {relations.incoming
              .length === 0 ? (
              <div
                style={{
                  color: "#999",
                  fontSize: 14,
                }}
              >
                No backlinks
              </div>
            ) : (
              relations.incoming.map(
                (relation) => (
                  <button
                    key={relation.id}
                    onClick={() =>
                      router.push(
                        `/workspace/${workspaceId}/memories/${folderId}/${relation.fromNote.id}`
                      )
                    }
                    style={{
                      width: "100%",
                      padding:
                        "12px 14px",
                      border:
                        "1px solid #e5e7eb",
                      borderRadius: 14,
                      background:
                        "#fff",
                      cursor: "pointer",
                      textAlign: "left",
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    {
                      relation
                        .fromNote
                        ?.title
                    }
                  </button>
                )
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
