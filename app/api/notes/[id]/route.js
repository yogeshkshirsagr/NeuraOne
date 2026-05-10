import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createEmbedding } from "@/lib/embeddings";
//
// ✅ EXTRACT WIKI LINKS
//
function extractLinks(content) {
  if (!content) return [];

  const plainText =
    content.replace(/<[^>]*>/g, " ");

  //
  // [[Note]]
  //
  const wikiMatches =
    plainText.match(/\[\[(.*?)\]\]/g) || [];

  //
  // @Note
  //
  const atMatches =
    plainText.match(/@([a-zA-Z0-9\-_]+)/g) || [];

  const wikiLinks = wikiMatches.map((match) =>
    match
      .replace("[[", "")
      .replace("]]", "")
      .trim()
  );

  const atLinks = atMatches.map((match) =>
    match.replace("@", "").trim()
  );

  //
  // remove duplicates
  //
  return [...new Set([...wikiLinks, ...atLinks])];
}

function compactTitle(value) {
  return (value || "")
    .toLowerCase()
    .replace(/\s+/g, "")
    .trim();
}

//
// ✅ GET SINGLE NOTE
//
export async function GET(req, { params }) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Missing note id",
        },
        {
          status: 400,
        }
      );
    }

    //
    // ✅ LOAD NOTE + RELATIONS
    //
    const note =
      await prisma.note.findUnique({
        where: {
          id,
        },

        include: {
          //
          // outgoing links
          //
          outgoingRelations: {
            include: {
              toNote: true,
            },
          },

          //
          // backlinks
          //
          incomingRelations: {
            include: {
              fromNote: true,
            },
          },
        },
      });

    if (!note) {
      return NextResponse.json(
        {
          error: "Note not found",
        },
        {
          status: 404,
        }
      );
    }

    return NextResponse.json(
      note
    );
  } catch (error) {
    console.error(
      "GET NOTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch note",
      },
      {
        status: 500,
      }
    );
  }
}

//
// ✅ UPDATE NOTE
//
export async function PATCH(
  req,
  { params }
) {
  try {
    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        {
          error: "Missing note id",
        },
        {
          status: 400,
        }
      );
    }

    //
    // ✅ REQUEST BODY
    //
    const body = await req.json();

    const {
      title,
      content,

      type,
      tags,
      summary,

      isPinned,
      isArchived,
    } = body;

    //
    // ✅ CREATE AI SUMMARY
    //
    const aiSummary =
      summary ||
      (content
        ? content
            .replace(/<[^>]*>/g, "")
            .slice(0, 300)
        : "");

    //
    // ✅ TEXT FOR EMBEDDING
    //
    const embeddingText = `
${title || ""}
${aiSummary || ""}
${content || ""}
`;

    //
    // ✅ GENERATE EMBEDDING
    //
    let embedding = null;

    try {
      embedding =
        await createEmbedding(
          embeddingText
        );
    } catch (embeddingError) {
      console.error(
        "EMBEDDING ERROR:",
        embeddingError
      );
    }

    //
    // ✅ UPDATE NOTE
    //
    const updatedNote =
      await prisma.note.update({
        where: {
          id,
        },

        data: {
          title,
          content,

          type,
          tags,

          summary,

          isPinned,
          isArchived,

          aiSummary,
        },
      });

    //
    // ✅ SAVE VECTOR USING RAW SQL
    //
    if (embedding) {
      await prisma.$executeRawUnsafe(
        `
        UPDATE "Note"
        SET embedding = $1::vector,
            "embeddingReady" = true
        WHERE id = $2
        `,
        JSON.stringify(
          embedding
        ),
        id
      );
    }

    //
    // ✅ EXTRACT LINKS
    //
    const links =
      extractLinks(content);

    //
    // ✅ REMOVE OLD RELATIONS
    //
    await prisma.noteRelation.deleteMany(
      {
        where: {
          fromNoteId: id,
        },
      }
    );

    //
    // ✅ CREATE NEW RELATIONS
    //
    const workspaceNotes =
      await prisma.note.findMany({
        where: {
          workspaceId:
            updatedNote.workspaceId,

          NOT: {
            id,
          },
        },

        select: {
          id: true,
          title: true,
        },
      });

    const relationTargetIds =
      new Set();

    for (const linkTitle of links) {
      const normalizedLink =
        linkTitle.trim();

      const compactLink =
        compactTitle(
          normalizedLink
        );

      const linkedNote =
        workspaceNotes.find(
          (candidate) =>
            candidate.title ===
              normalizedLink ||
            compactTitle(
              candidate.title
            ) === compactLink
        );

      if (linkedNote) {
        relationTargetIds.add(
          linkedNote.id
        );
      }
    }

    //
    // ✅ CREATE RELATIONS
    //
    if (relationTargetIds.size) {
      await prisma.noteRelation.createMany(
        {
          data: Array.from(
            relationTargetIds
          ).map((toNoteId) => ({
            fromNoteId: id,
            toNoteId,
          })),
        }
      );
    }

    //
    // ✅ RETURN FINAL NOTE
    //
    const finalNote =
      await prisma.note.findUnique({
        where: {
          id,
        },

        include: {
          outgoingRelations: {
            include: {
              toNote: true,
            },
          },

          incomingRelations: {
            include: {
              fromNote: true,
            },
          },
        },
      });

    return NextResponse.json(
      finalNote
    );
  } catch (error) {
    console.error(
      "UPDATE NOTE ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to update note",
      },
      {
        status: 500,
      }
    );
  }
}