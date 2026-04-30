import clientPromise from "@/app/lib/mongodb";

export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);
    const noteId = searchParams.get("noteId");

    if (!noteId) {
      return Response.json({ error: "Missing noteId" }, { status: 400 });
    }

    const client = await clientPromise;
    const db = client.db("neuraone");

    const note = await db.collection("notes").findOne({ noteId });

    return Response.json({
      content:
        note?.content || {
          type: "doc",
          content: [
            {
              type: "paragraph"
            }
          ]
        }
    });
  } catch (error) {
    console.error("GET NOTE ERROR:", error);
    return Response.json({ error: "Failed to get note" }, { status: 500 });
  }
}