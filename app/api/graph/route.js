import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    //
    // FETCH NOTES
    //
    const notes = await prisma.note.findMany({
      select: {
        id: true,
        title: true,
        type: true,
      },
    });

    //
    // FETCH RELATIONS
    //
    const relations =
      await prisma.noteRelation.findMany({
        select: {
          fromNoteId: true,
          toNoteId: true,
        },
      });

    //
    // BUILD NODES
    //
    const nodes = notes.map((note) => ({
      id: note.id,
      name: note.title || "Untitled",
      type: note.type || "note",
    }));

    //
    // BUILD LINKS
    //
    const links = relations.map((rel) => ({
      source: rel.fromNoteId,
      target: rel.toNoteId,
    }));

    return NextResponse.json({
      nodes,
      links,
    });
  } catch (error) {
    console.error("GRAPH API ERROR:", error);

    return NextResponse.json(
      {
        error: "Failed to load graph",
      },
      {
        status: 500,
      }
    );
  }
}