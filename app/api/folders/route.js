import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function POST(req) {
  try {
    const user = await currentUser();

    if (!user) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { name, workspaceId } = await req.json();

    if (!name || !workspaceId) {
      return Response.json(
        { error: "Missing name or workspaceId" },
        { status: 400 }
      );
    }

    const folder = await prisma.folder.create({
      data: {
        name,
        workspaceId,
        userId: user.id,
      },
    });

    return Response.json(folder);
  } catch (err) {
    console.error("FOLDER CREATE ERROR:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}