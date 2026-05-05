export default function ChatPage() {
  return (
    <main
      style={{
        minHeight: "100vh",
        padding: 10,
        boxSizing: "border-box",
      }}
    >
      <section
        aria-label="Chat workspace"
        style={{
          minHeight: "calc(100vh - 20px)",
          background: "#fff",
          border: "1px solid #e5e7eb",
          borderRadius: 12,
          boxSizing: "border-box",
        }}
      />
    </main>
  );
}