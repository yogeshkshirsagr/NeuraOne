import prisma from "@/lib/prisma";
import SidebarClient from "./SidebarClient";

export default async function Sidebar({
  workspaceId,
}) {
  if (!workspaceId) {
    return null;
  }

  let workspace = null;

  try {
    workspace = await prisma.workspace.findUnique({
      where: {
        id: workspaceId,
      },
    });
  } catch (error) {
    console.error("SIDEBAR_WORKSPACE_ERROR:", error);
  }

  if (!workspace && process.env.NODE_ENV === "production") {
    return null;
  }

  return (
    <SidebarClient
      workspaceId={workspaceId}
      workspaceName={workspace?.name || "Workspace"}
    />
  );
}
