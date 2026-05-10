import prisma from "@/lib/prisma";
import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";

import MemoriesClient from "../MemoriesClient";

export default async function MemoriesPage({ params }) {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  // slug parsing
  const { workspaceId, slug = [] } = await params;

  const folderId = slug[0] || null;
  const noteId = slug[1] || null;

  // fetch folders
  const folders = await prisma.folder.findMany({
    where: {
      workspaceId,
    },
    orderBy: {
      createdAt: "asc",
    },
  });

  // fetch notes
  const notes = folderId
    ? await prisma.note.findMany({
        where: {
          workspaceId,
          folderId,
        },
        orderBy: {
          updatedAt: "desc",
        },
      })
    : [];

  // fetch active note
  const activeNote = noteId
    ? await prisma.note.findFirst({
        where: {
          id: noteId,
          workspaceId,
        },
      })
    : null;

  return (
    <MemoriesClient
      folders={folders}
      notes={notes}
      activeFolder={folderId}
      activeNote={activeNote}
      workspaceId={workspaceId}
      userId={userId}
    />
  );
}
