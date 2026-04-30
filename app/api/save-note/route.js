import clientPromise from "@/app/lib/mongodb";

/**
 * 🔧 Clean TipTap content
 * removes empty text nodes (""), which crash editor
 */
function cleanContent(content) {
  if (!content || !content.content) return content;

  return {
    ...content,
    content: content.content.map((node) => {
      if (node.type === "paragraph") {
        if (!node.content) {
          return { type: "paragraph" };
        }

        const filtered = node.content.filter(
          (item) => item.text && item.text.trim() !== ""
        );

        if (filtered.length === 0) {
          return { type: "paragraph" }; // ✅ valid empty paragraph
        }

        return {
          ...node,
          content: filtered
        };
      }

      return node;
    })
  };
}

export async function POST(req) {
  try {
    const body = await req.json();
    const { noteId, content } = body;

    if (!noteId) {
      return Response.json({ error: "Missing noteId" }, { status: 400 });
    }

    const cleanedContent = cleanContent(content);

    const client = await clientPromise;
    const db = client.db("neuraone");

    await db.collection("notes").updateOne(
      { noteId },
      {
        $set: {
          noteId,
          content: cleanedContent,
          updatedAt: new Date()
        }
      },
      { upsert: true }
    );

    return Response.json({ success: true });
  } catch (error) {
    console.error("SAVE NOTE ERROR:", error);
    return Response.json({ error: "Failed to save note" }, { status: 500 });
  }
}