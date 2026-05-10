import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { initUser } from "@/lib/initUser";

export default async function Page() {
  const { userId } = await auth();

  if (!userId) {
    redirect("/sign-in");
  }

  const workspaceId = await initUser(userId);

  redirect(`/workspace/${workspaceId}/chat`);
}
