import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { createEmbedding } from "@/lib/embeddings";

export async function POST(req) {
  try {
    const body = await req.json();

    const {
      query,
      workspaceId,
    } = body;

    //
    // VALIDATION
    //
    if (!query || !workspaceId) {
      return NextResponse.json(
        {
          error:
            "Missing query or workspaceId",
        },
        {
          status: 400,
        }
      );
    }

    //
    // CREATE QUERY EMBEDDING
    //
    const embedding =
      await createEmbedding(query);

    if (!embedding) {
      return NextResponse.json(
        {
          error:
            "Failed to create embedding",
        },
        {
          status: 500,
        }
      );
    }

    //
    // VECTOR SEARCH
    //
    const results =
      await prisma.$queryRawUnsafe(
        `
        SELECT
          id,
          title,
          content,
          summary,
          type,
          tags,
          "createdAt",

          1 - (
            embedding <=> $1::vector
          ) AS similarity

        FROM "Note"

        WHERE
          "workspaceId" = $2
          AND embedding IS NOT NULL

        ORDER BY embedding <=> $1::vector

        LIMIT 8
        `,
        JSON.stringify(embedding),
        workspaceId
      );

    return NextResponse.json({
      results,
    });
  } catch (error) {
    console.error(
      "SEMANTIC SEARCH ERROR:",
      error
    );

    return NextResponse.json(
      {
        error:
          "Semantic search failed",
      },
      {
        status: 500,
      }
    );
  }
}