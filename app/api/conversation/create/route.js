import { auth } from "@clerk/nextjs/server";
import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(req) {
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
    // BODY
    //
    const body = await req.json();

    const { workspaceId } = body;

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

    //
    // VERIFY WORKSPACE
    //
    const workspace =
      await prisma.workspace.findFirst(
        {
          where: {
            id: workspaceId,
            ownerId: userId,
          },
        }
      );

    if (!workspace) {
      return NextResponse.json(
        {
          error:
            "Workspace not found",
        },
        {
          status: 404,
        }
      );
    }

    //
    // REUSE LATEST CONVERSATION
    //
    let conversation =
      await prisma.conversation.findFirst(
        {
          where: {
            workspaceId,
            userId,
          },

          orderBy: {
            updatedAt:
              "desc",
          },

          include: {
            messages: {
              orderBy: {
                createdAt:
                  "asc",
              },

              select: {
                role: true,
                content: true,
              },
            },
          },
        }
      );

    //
    // CREATE ONLY IF NONE EXISTS
    //
    if (!conversation) {
      conversation =
        await prisma.conversation.create(
          {
            data: {
              workspaceId,
              userId,

              title:
                "New Chat",

              lastMessage:
                "",
            },

            include: {
              messages: true,
            },
          }
        );
    }

    //
    // FORMAT MESSAGES
    //
    const formattedMessages =
      (
        conversation.messages ||
        []
      ).map((m) => ({
        role: m.role,
        content: m.content,
      }));

    //
    // RESPONSE
    //
    return NextResponse.json({
      id: conversation.id,

      title:
        conversation.title,

      messages:
        formattedMessages,
    });
  } catch (error) {
    console.error(
      "CREATE CONVERSATION ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Failed creating conversation",
      },
      {
        status: 500,
      }
    );
  }
}