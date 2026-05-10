import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";

import prisma from "@/lib/prisma";

export async function GET(req) {
  try {
    //
    // AUTH
    //
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

    //
    // QUERY PARAM
    //
    const { searchParams } =
      new URL(req.url);

    const conversationId =
      searchParams.get(
        "conversationId"
      );

    if (!conversationId) {
      return NextResponse.json(
        {
          error:
            "conversationId required",
        },
        {
          status: 400,
        }
      );
    }

    //
    // VERIFY CONVERSATION
    //
    const conversation =
      await prisma.conversation.findFirst(
        {
          where: {
            id: conversationId,
            userId,
          },
        }
      );

    if (!conversation) {
      return NextResponse.json(
        {
          error:
            "Conversation not found",
        },
        {
          status: 404,
        }
      );
    }

    //
    // LOAD MESSAGES
    //
    const messages =
      await prisma.chatMessage.findMany(
        {
          where: {
            conversationId,
          },

          orderBy: {
            createdAt: "asc",
          },
        }
      );

    return NextResponse.json(
      messages
    );
  } catch (error) {
    console.error(
      "MESSAGES ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed loading messages",
      },
      {
        status: 500,
      }
    );
  }
}