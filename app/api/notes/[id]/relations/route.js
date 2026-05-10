import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(
  request,
  { params }
) {
  try {
    const { id } = await params;

    //
    // OUTGOING LINKS
    // current note -> other notes
    //
    const outgoing =
      await prisma.noteRelation.findMany({
        where: {
          fromNoteId: id,
        },

        include: {
          toNote: true,
        },
      });

    //
    // INCOMING LINKS / BACKLINKS
    // other notes -> current note
    //
    const incoming =
      await prisma.noteRelation.findMany({
        where: {
          toNoteId: id,
        },

        include: {
          fromNote: true,
        },
      });

    return NextResponse.json({
      outgoing,
      incoming,
    });
  } catch (error) {
    console.error(
      "RELATIONS API ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed to fetch relations",
      },
      {
        status: 500,
      }
    );
  }
}