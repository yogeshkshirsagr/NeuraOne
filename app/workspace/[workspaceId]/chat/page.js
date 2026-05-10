"use client";

import {
  use,
  useEffect,
  useRef,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import ConversationSidebar from "@/components/chat/ConversationSidebar";

export default function ChatPage({
  params,
}) {
  //
  // NEXT 16
  //
  const resolvedParams = use(params);

  const workspaceId =
    resolvedParams.workspaceId;

  const router = useRouter();

  //
  // STATES
  //
  const [message, setMessage] =
    useState("");

  const [messages, setMessages] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [connecting, setConnecting] =
    useState(true);

  const [
    conversations,
    setConversations,
  ] = useState([]);

  const [
    conversationId,
    setConversationId,
  ] = useState(null);

  //
  // REFS
  //
  const initializedRef =
    useRef(false);

  const bottomRef = useRef(null);

  //
  // AUTO SCROLL
  //
  useEffect(() => {
    bottomRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  //
  // LOAD CONVERSATIONS
  //
  async function loadConversations() {
    try {
      const res = await fetch(
        `/api/conversation/list?workspaceId=${workspaceId}`
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setConversations(data);
      }
    } catch (err) {
      console.error(err);
    }
  }

  //
  // LOAD MESSAGES
  //
  async function loadMessages(
    id
  ) {
    try {
      const res = await fetch(
        `/api/conversation/messages?conversationId=${id}`
      );

      const data = await res.json();

      if (Array.isArray(data)) {
        setMessages(data);
      } else {
        setMessages([]);
      }
    } catch (error) {
      console.error(error);
    }
  }

  //
  // CREATE NEW CHAT
  //
  async function createNewChat() {
    try {
      setConnecting(true);
      setError("");

      const res = await fetch(
        "/api/conversation/create",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            workspaceId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            "Unable to create chat."
        );

        setConnecting(false);

        return;
      }

      setConversationId(data.id);

      setMessages([]);

      await loadConversations();

      setConnecting(false);
    } catch (error) {
      console.error(error);

      setError(
        "Unable to create chat."
      );

      setConnecting(false);
    }
  }

  //
  // INITIAL LOAD
  //
  useEffect(() => {
    if (
      initializedRef.current ||
      !workspaceId
    ) {
      return;
    }

    initializedRef.current = true;

    async function init() {
      await loadConversations();

      const res = await fetch(
        "/api/conversation/create",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            workspaceId,
          }),
        }
      );

      const data = await res.json();

      if (data?.id) {
        setConversationId(data.id);

        if (
          Array.isArray(
            data.messages
          )
        ) {
          setMessages(
            data.messages
          );
        }
      }

      setConnecting(false);
    }

    init();
  }, [workspaceId]);

  //
  // SEND MESSAGE
  //
  async function sendMessage() {
    if (
      !message.trim() ||
      loading ||
      !conversationId
    ) {
      return;
    }

    const currentMessage =
      message.trim();

    setError("");
    setLoading(true);

    //
    // OPTIMISTIC UI
    //
    const userMessage = {
      role: "user",
      content: currentMessage,
    };

    setMessages((prev) => [
      ...prev,
      userMessage,
    ]);

    setMessage("");

    try {
      const res = await fetch(
        "/api/chat",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            message:
              currentMessage,

            workspaceId,

            conversationId,
          }),
        }
      );

      const data = await res.json();

      if (!res.ok) {
        setError(
          data.error ||
            "Failed sending message."
        );

        setLoading(false);

        return;
      }

      //
      // ADD AI MESSAGE
      //
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content:
            data.message ||
            "No response.",
        },
      ]);

      //
      // REFRESH THREADS
      //
      await loadConversations();
    } catch (error) {
      console.error(error);

      setError(
        "Unable to send message."
      );
    } finally {
      setLoading(false);
    }
  }

  //
  // ENTER SEND
  //
  function handleKeyDown(e) {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();

      sendMessage();
    }
  }

  return (
    <main
      style={{
        height: "100vh",
        overflow: "hidden",
        display: "flex",
        background: "#e5e7eb",
      }}
    >
      {/* THREAD SIDEBAR */}

      <ConversationSidebar
        conversations={
          conversations
        }
        activeConversationId={
          conversationId
        }
        onSelect={async (
          conversation
        ) => {
          setConversationId(
            conversation.id
          );

          await loadMessages(
            conversation.id
          );
        }}
        onNewChat={
          createNewChat
        }
      />

      {/* CHAT SECTION */}

      <section
        style={{
          flex: 1,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
          background: "#fff",
        }}
      >
        {/* MESSAGES */}

        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: 28,
            minHeight: 0,
          }}
        >
          {messages.length === 0 &&
            !connecting && (
              <div
                style={{
                  height: "100%",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  flexDirection:
                    "column",
                  textAlign:
                    "center",
                }}
              >
                <h1
                  style={{
                    fontSize: 52,
                    fontWeight: 700,
                    letterSpacing:
                      "-2px",
                    marginBottom: 16,
                  }}
                >
                  NeuraOne AI
                </h1>

                <p
                  style={{
                    color: "#64748b",
                    fontSize: 18,
                  }}
                >
                  Ask questions about
                  your workspace
                </p>
              </div>
            )}

          {connecting && (
            <div
              style={{
                height: "100%",
                display: "flex",
                alignItems:
                  "center",
                justifyContent:
                  "center",
                color: "#64748b",
              }}
            >
              Connecting...
            </div>
          )}

          {messages.map((m, i) => {
            const isUser =
              m.role === "user";

            return (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent:
                    isUser
                      ? "flex-end"
                      : "flex-start",

                  marginBottom: 24,
                }}
              >
                <div
                  style={{
                    maxWidth: "72%",

                    background:
                      isUser
                        ? "#0f172a"
                        : "#f1f5f9",

                    color: isUser
                      ? "#fff"
                      : "#0f172a",

                    borderRadius: 22,

                    padding:
                      "18px 20px",

                    lineHeight: 1.8,

                    whiteSpace:
                      "pre-wrap",

                    fontSize: 15,

                    boxShadow:
                      "0 1px 3px rgba(0,0,0,0.06)",
                  }}
                >
                  <div
                    style={{
                      fontSize: 13,
                      fontWeight: 700,
                      marginBottom: 8,
                      opacity: 0.7,
                    }}
                  >
                    {isUser
                      ? "You"
                      : "NeuraOne"}
                  </div>

                  {m.content}
                </div>
              </div>
            );
          })}

          {loading && (
            <div
              style={{
                display: "flex",
                justifyContent:
                  "flex-start",
              }}
            >
              <div
                style={{
                  background:
                    "#f1f5f9",

                  borderRadius: 20,

                  padding:
                    "14px 18px",

                  color: "#64748b",

                  fontSize: 14,
                }}
              >
                NeuraOne is thinking...
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* INPUT */}

        <div
          style={{
            borderTop:
              "1px solid #e2e8f0",

            padding: 20,

            background: "#fff",

            flexShrink: 0,
          }}
        >
          {error && (
            <div
              style={{
                marginBottom: 12,

                padding:
                  "12px 14px",

                borderRadius: 12,

                border:
                  "1px solid #fecaca",

                background:
                  "#fef2f2",

                color: "#991b1b",

                fontSize: 14,
              }}
            >
              {error}
            </div>
          )}

          <div
            style={{
              display: "flex",
              gap: 12,
              alignItems:
                "flex-end",
            }}
          >
            <textarea
              value={message}
              onChange={(e) =>
                setMessage(
                  e.target.value
                )
              }
              onKeyDown={
                handleKeyDown
              }
              placeholder="Ask anything..."
              rows={1}
              style={{
                flex: 1,

                border:
                  "1px solid #dbe4ee",

                borderRadius: 16,

                padding: 16,

                outline: "none",

                resize: "none",

                fontSize: 15,

                minHeight: 58,

                maxHeight: 180,

                overflowY: "auto",

                fontFamily:
                  "inherit",
              }}
            />

            <button
              onClick={
                sendMessage
              }
              disabled={
                loading ||
                connecting
              }
              style={{
                height: 58,

                padding:
                  "0 24px",

                border: "none",

                borderRadius: 16,

                background:
                  loading
                    ? "#94a3b8"
                    : "#000",

                color: "#fff",

                fontWeight: 600,

                cursor:
                  loading
                    ? "not-allowed"
                    : "pointer",
              }}
            >
              {loading
                ? "..."
                : "Send"}
            </button>
          </div>
        </div>
      </section>
    </main>
  );
}