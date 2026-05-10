import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import OpenAI from "openai";

import prisma from "@/lib/prisma";
import { createEmbedding } from "@/lib/embeddings";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

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

    const {
      message,
      workspaceId,
      conversationId,
    } = body;

    if (
      !message ||
      !workspaceId ||
      !conversationId
    ) {
      return NextResponse.json(
        {
          error:
            "Missing required fields",
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
      await prisma.workspace.findFirst({
        where: {
          id: workspaceId,
          ownerId: userId,
        },
      });

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
    // VERIFY CONVERSATION
    //
    const conversation =
      await prisma.conversation.findFirst({
        where: {
          id: conversationId,
          workspaceId,
          userId,
        },
      });

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
    // SAVE USER MESSAGE FIRST
    //
    await prisma.chatMessage.create({
      data: {
        conversationId,
        role: "user",
        content: message,
        sources: {},
      },
    });

    //
    // UPDATE CONVERSATION
    //
    await prisma.conversation.update({
      where: {
        id: conversationId,
      },

      data: {
        lastMessage: message,
      },
    });

    //
    // CREATE EMBEDDING
    //
    let relevantNotes = [];

    try {
      const queryEmbedding =
        await createEmbedding(message);

      //
      // VECTOR SEARCH
      //
      relevantNotes =
        await prisma.$queryRawUnsafe(
          `
          SELECT
            id,
            title,
            content,
            summary,
            "aiSummary",

            1 - (
              embedding <=> $1::vector
            ) AS similarity

          FROM "Note"

          WHERE
            "workspaceId" = $2
            AND embedding IS NOT NULL

          ORDER BY embedding <=> $1::vector

          LIMIT 6
          `,
          `[${queryEmbedding.join(",")}]`,
          workspaceId
        );
    } catch (vectorError) {
      console.error(
        "VECTOR SEARCH ERROR:",
        vectorError
      );

      //
      // FALLBACK
      //
      relevantNotes =
        await prisma.note.findMany({
          where: {
            workspaceId,
          },

          orderBy: {
            updatedAt: "desc",
          },

          take: 5,

          select: {
            id: true,
            title: true,
            content: true,
            summary: true,
            aiSummary: true,
          },
        });
    }

    //
    // BUILD CONTEXT
    //
    const context = relevantNotes
      .map((note) => {
        return `
TITLE:
${note.title || ""}

SUMMARY:
${note.summary || ""}

AI SUMMARY:
${note.aiSummary || ""}

CONTENT:
${String(note.content || "")
  .replace(/<[^>]*>/g, "")
  .slice(0, 4000)}
`;
      })
      .join("\n\n---\n\n");

    //
    // CHAT HISTORY
    //
    const history =
      await prisma.chatMessage.findMany({
        where: {
          conversationId,
        },

        orderBy: {
          createdAt: "asc",
        },

        take: 12,

        select: {
          role: true,
          content: true,
        },
      });

    //
    // OPENAI RESPONSE
    //
    const completion =
      await openai.chat.completions.create({
        model: "gpt-4.1-mini",

        temperature: 0.7,

        messages: [
          {
            role: "system",

            content: `
You are NeuraOne AI.

You are a premium AI workspace assistant.

Your responsibilities:
- answer questions from workspace memory
- summarize notes
- connect ideas
- help decision making
- explain stored information
- provide intelligent insights

RULES:
- prioritize workspace context
- if workspace context is insufficient, clearly say so
- keep answers concise but useful
- format cleanly
- never hallucinate fake workspace data

WORKSPACE:
${workspace.name}

WORKSPACE CONTEXT:
${context}
`,
          },

          ...history.map((m) => ({
            role: m.role,
            content: m.content,
          })),
        ],
      });

    const aiMessage =
      completion?.choices?.[0]?.message
        ?.content || "I could not generate a response.";

    //
    // SAVE AI MESSAGE
    //
    await prisma.chatMessage.create({
      data: {
        conversationId,

        role: "assistant",

        content: aiMessage,

        sources: relevantNotes || {},
      },
    });

    //
    // UPDATE CONVERSATION TITLE
    //
    if (
      conversation.title === "New Chat"
    ) {
      await prisma.conversation.update({
        where: {
          id: conversationId,
        },

        data: {
          title:
            message.slice(0, 40),
        },
      });
    }

    //
    // SUCCESS
    //
    return NextResponse.json({
      success: true,

      message: aiMessage,

      sources: relevantNotes,
    });

  } catch (error) {
    console.error(
      "CHAT ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Chat is unavailable right now.",
      },
      {
        status: 500,
      }
    );
  }
}