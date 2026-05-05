import { currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { initUser } from "@/lib/initUser";

export default async function Page() {
  const user = await currentUser();

  if (!user) {
    redirect("/sign-in");
  }

  const workspaceId = await initUser(user.id);

  redirect(`/workspace/${workspaceId}/chat`);
}