import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";


// ✅ GET NOTES
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const folderId = searchParams.get("folderId");

  if (!folderId) {
    return NextResponse.json([]);
  }

  const notes = await prisma.note.findMany({
    where: { folderId },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(notes);
}


// ✅ CREATE NOTE
export async function POST(req) {
  try {
    const body = await req.json();

    console.log("BODY RECEIVED:", body);

    const { folderId, workspaceId, userId } = body;

    if (!workspaceId || !userId) {
      return NextResponse.json(
        { error: "Missing workspaceId or userId" },
        { status: 400 }
      );
    }

    const note = await prisma.note.create({
      data: {
        title: "Untitled",
        content: "",
        folderId,
        workspaceId,
        userId,
      },
    });

    return NextResponse.json(note);
  } catch (err) {
    console.error("API ERROR:", err);
    return NextResponse.json(
      { error: "Server error" },
      { status: 500 }
    );
  }
}