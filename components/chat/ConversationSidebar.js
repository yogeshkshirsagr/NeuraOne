"use client";

import {
  Plus,
  MessageSquare,
} from "lucide-react";

export default function ConversationSidebar({
  conversations = [],
  activeConversationId,
  onSelect,
  onNewChat,
}) {
  return (
    <aside
      style={{
        width: 300,
        height: "100vh",
        borderRight:
          "1px solid #e5e7eb",
        background: "#ffffff",
        display: "flex",
        flexDirection: "column",
        flexShrink: 0,
      }}
    >
      {/* HEADER */}

      <div
        style={{
          padding: 20,
          borderBottom:
            "1px solid #f1f5f9",
          display: "flex",
          alignItems: "center",
          justifyContent:
            "space-between",
        }}
      >
        <div>
          <h2
            style={{
              margin: 0,
              fontSize: 26,
              fontWeight: 700,
              color: "#0f172a",
            }}
          >
            Chat
          </h2>

          <p
            style={{
              marginTop: 6,
              marginBottom: 0,
              color: "#64748b",
              fontSize: 14,
            }}
          >
            Your conversations
          </p>
        </div>

        <button
          onClick={onNewChat}
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            border:
              "1px solid #e2e8f0",
            background: "#fff",
            display: "flex",
            alignItems: "center",
            justifyContent:
              "center",
            cursor: "pointer",
          }}
        >
          <Plus size={18} />
        </button>
      </div>

      {/* CONVERSATIONS */}

      <div
        style={{
          flex: 1,
          overflowY: "auto",
          padding: 10,
        }}
      >
        {conversations.length ===
          0 && (
          <div
            style={{
              padding: 20,
              color: "#94a3b8",
              fontSize: 14,
            }}
          >
            No conversations yet
          </div>
        )}

        {conversations.map(
          (conversation) => {
            const active =
              activeConversationId ===
              conversation.id;

            return (
              <button
                key={
                  conversation.id
                }
                onClick={() =>
                  onSelect(
                    conversation
                  )
                }
                style={{
                  width: "100%",
                  border: "none",
                  background: active
                    ? "#f1f5f9"
                    : "transparent",
                  borderRadius: 14,
                  padding: 14,
                  marginBottom: 8,
                  cursor: "pointer",
                  textAlign: "left",
                  transition:
                    "all 0.2s ease",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    alignItems:
                      "flex-start",
                  }}
                >
                  <div
                    style={{
                      marginTop: 2,
                      color:
                        "#64748b",
                    }}
                  >
                    <MessageSquare
                      size={18}
                    />
                  </div>

                  <div
                    style={{
                      flex: 1,
                      minWidth: 0,
                    }}
                  >
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color:
                          "#0f172a",
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {conversation.title ||
                        "New Chat"}
                    </div>

                    <div
                      style={{
                        marginTop: 4,
                        fontSize: 13,
                        color:
                          "#64748b",
                        overflow:
                          "hidden",
                        textOverflow:
                          "ellipsis",
                        whiteSpace:
                          "nowrap",
                      }}
                    >
                      {conversation.lastMessage ||
                        "Start a conversation"}
                    </div>
                  </div>
                </div>
              </button>
            );
          }
        )}
      </div>
    </aside>
  );
}