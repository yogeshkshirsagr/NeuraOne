import prisma from "./prisma";
import { currentUser } from "@clerk/nextjs/server";

export async function initUser(userId) {
  const user = await currentUser();

  // 👉 Ensure user exists in DB
  let dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!dbUser) {
    dbUser = await prisma.user.create({
      data: {
        id: userId,
        email: user?.emailAddresses?.[0]?.emailAddress,
      },
    });
  }

  // 👉 Always check if workspace already exists
  let workspace = await prisma.workspace.findFirst({
    where: { ownerId: userId },
  });

  // 👉 CREATE ONLY IF NOT EXISTS
  if (!workspace) {
    const name =
      `${user?.firstName || ""} ${user?.lastName || ""}`.trim() ||
      "My";

    workspace = await prisma.workspace.create({
      data: {
        name: `${name} Workspace`,
        type: "personal",
        ownerId: userId,
      },
    });

    await prisma.workspaceMember.create({
      data: {
        userId,
        workspaceId: workspace.id,
        role: "owner",
      },
    });
  }

  // 👉 ALWAYS ENSURE DEFAULT FOLDER EXISTS
  const existingFolder = await prisma.folder.findFirst({
    where: {
      workspaceId: workspace.id,
      name: "About NeuraOne",
    },
  });

  if (!existingFolder) {
    await prisma.folder.create({
      data: {
        name: "About NeuraOne",
        workspaceId: workspace.id,
        userId: userId,
      },
    });
  }

  return workspace.id;
}