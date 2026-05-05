import prisma from "@/lib/prisma";
import { currentUser } from "@clerk/nextjs/server";
import MemoriesClient from "./MemoriesClient";
import { redirect } from "next/navigation";

export default async function MemoriesPage({ params }) {
  const { workspaceId } = await params;

  const user = await currentUser(); // ✅ FIX

  console.log("SERVER USER:", user);

  if (!user) {
    redirect("/sign-in");
  }

  const folders = await prisma.folder.findMany({
    where: { workspaceId },
  });

  return (
    <MemoriesClient
      folders={folders}
      workspaceId={workspaceId}
      userId={user.id} // ✅ IMPORTANT
    />
  );
}