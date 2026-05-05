export default function NoteCard({ note, onClick }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: 10,
        border: "1px solid #e5e7eb",
        borderRadius: 8,
        marginBottom: 10,
        cursor: "pointer",
      }}
    >
      <strong>{note.title}</strong>
      <p style={{ fontSize: 12, color: "#555" }}>
        {note.content.slice(0, 50)}
      </p>
    </div>
  );
}