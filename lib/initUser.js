import prisma from "./prisma";

export async function initUser(userId) {
  if (!userId) {
    throw new Error("Cannot initialize workspace without a Clerk user id.");
  }

  // Ensure user exists in DB.
  const dbUser = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!dbUser) {
    await prisma.user.create({
      data: {
        id: userId,
      },
    });
  }

  // Always check if workspace already exists.
  let workspace = await prisma.workspace.findFirst({
    where: { ownerId: userId },
  });

  // Create only if not exists.
  if (!workspace) {
    workspace = await prisma.workspace.create({
      data: {
        name: "My Workspace",
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

  // Always ensure default folder exists.
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
