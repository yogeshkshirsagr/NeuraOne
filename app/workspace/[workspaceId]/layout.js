import Sidebar from "@/components/Sidebar";

export default async function WorkspaceLayout({ children, params }) {
  const { workspaceId } = await params;

  return (
    <div style={{ display: "flex" }}>
      <Sidebar workspaceId={workspaceId} />
      <div style={{ flex: 1 }}>{children}</div>
    </div>
  );
}
