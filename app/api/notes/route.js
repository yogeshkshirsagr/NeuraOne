import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { chunkText } from "@/lib/chunkText";
import { createEmbedding } from "@/lib/embeddings";

//
// ✅ GET NOTES
//
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url);

    const folderId = searchParams.get("folderId");
    const workspaceId =
      searchParams.get("workspaceId");

    if (!folderId && !workspaceId) {
      return NextResponse.json([]);
    }

    const where = {
      ...(workspaceId
        ? { workspaceId }
        : {}),

      ...(folderId
        ? { folderId }
        : {}),
    };

    const notes = await prisma.note.findMany({
      where,

      orderBy: [
        { isPinned: "desc" },
        { updatedAt: "desc" },
      ],
    });

    return NextResponse.json(notes);
  } catch (error) {
    console.error("GET NOTES ERROR:", error);

    return NextResponse.json(
      { error: "Failed to fetch notes" },
      { status: 500 }
    );
  }
}

//
// ✅ CREATE NOTE
//
export async function POST(req) {
  try {
    const body = await req.json();

    console.log("BODY RECEIVED:", body);

    const {
      folderId,
      workspaceId,
      userId,

      title,
      content,

      type,
      tags,
      summary,

      isPinned,
    } = body;

    //
    // ✅ VALIDATION
    //
    if (!workspaceId || !userId) {
      return NextResponse.json(
        { error: "Missing workspaceId or userId" },
        { status: 400 }
      );
    }

    //
    // ✅ CREATE NOTE
    //
    const note = await prisma.note.create({
      data: {
        title: title || "Untitled",

        content: content || "",

        type: type || "note",

        tags: tags || [],

        summary: summary || "",

        isPinned: isPinned || false,

        aiSummary:
          summary ||
          (content
            ? content.slice(0, 300)
            : ""),

        embeddingReady: false,

        folderId,
        workspaceId,
        userId,
      },
    });

    //
// ✅ CREATE NOTE CHUNKS
//
const safeContent = content || "";

console.log("SAFE CONTENT:", safeContent);

const chunks = chunkText(safeContent);

console.log("CHUNKS ARRAY:", chunks);

console.log("TOTAL CHUNKS:", chunks.length);

for (let i = 0; i < chunks.length; i++) {
  const chunk = chunks[i];

  console.log("PROCESSING CHUNK:", i);

  try {
    //
    // ✅ CREATE EMBEDDING
    //
    const embedding =
      await createEmbedding(chunk);

    console.log(
      "EMBEDDING CREATED:",
      embedding?.length
    );

    //
    // ✅ CONVERT VECTOR
    //
    const vectorString =
      `[${embedding.join(",")}]`;

    console.log(
      "VECTOR STRING READY"
    );

    //
    // ✅ RAW INSERT
    //
    const result =
      await prisma.$executeRawUnsafe(`
        INSERT INTO "NoteChunk"
        (
          id,
          "noteId",
          "workspaceId",
          content,
          "chunkIndex",
          "tokenCount",
          embedding,
          metadata,
          "createdAt",
          "updatedAt"
        )
        VALUES
        (
          gen_random_uuid()::text,
          '${note.id}',
          '${note.workspaceId}',
          ${JSON.stringify(chunk)},
          ${i},
          ${chunk.length},
          '${vectorString}'::vector,
          '{}'::jsonb,
          NOW(),
          NOW()
        )
      `);

    console.log(
      "INSERT RESULT:",
      result
    );

    console.log(
      `✅ Chunk ${i} inserted`
    );
  } catch (chunkError) {
    console.error(
      "❌ FULL CHUNK ERROR:"
    );

    console.error(chunkError);
  }
}

    //
    // ✅ MARK EMBEDDING READY
    //
    await prisma.note.update({
      where: {
        id: note.id,
      },

      data: {
        embeddingReady: true,
      },
    });

    return NextResponse.json(note);
  } catch (error) {
    console.error("CREATE NOTE ERROR:", error);

    return NextResponse.json(
      { error: "Failed to create note" },
      { status: 500 }
    );
  }
}