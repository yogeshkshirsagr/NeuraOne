import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const { searchParams } =
      new URL(req.url);

    const query =
      searchParams.get("q");

    //
    // prevent empty spam
    //
    if (!query?.trim()) {
      return NextResponse.json([]);
    }

    const notes =
      await prisma.note.findMany({
        where: {
          title: {
            contains: query,
            mode: "insensitive",
          },
        },

        select: {
          id: true,
          title: true,
        },

        take: 8,
      });

    return NextResponse.json(notes);
  } catch (err) {
    console.error(err);

    return NextResponse.json(
      [],
      { status: 500 }
    );
  }
}