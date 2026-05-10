import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json(
        {
          error: "Unauthorized",
        },
        {
          status: 401,
        }
      );
    }

    const { searchParams } =
      new URL(req.url);

    const workspaceId =
      searchParams.get(
        "workspaceId"
      );

    if (!workspaceId) {
      return NextResponse.json(
        {
          error:
            "Workspace required",
        },
        {
          status: 400,
        }
      );
    }

    const conversations =
      await prisma.conversation.findMany(
        {
          where: {
            workspaceId,
            userId,
          },

          orderBy: {
            updatedAt: "desc",
          },
        }
      );

    return NextResponse.json(
      conversations
    );
  } catch (error) {
    console.error(error);

    return NextResponse.json(
      {
        error:
          "Failed loading conversations",
      },
      {
        status: 500,
      }
    );
  }
}