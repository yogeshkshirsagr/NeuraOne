import prisma from "@/lib/prisma";
import SidebarClient from "./SidebarClient";

export default async function Sidebar({ workspaceId }) {
  const workspace = await prisma.workspace.findUnique({
    where: { id: workspaceId },
  });

  return (
    <SidebarClient
      workspaceId={workspaceId}
      workspaceName={workspace?.name}
    />
  );
}