"use client";

import React, { useState } from "react";

export default function SearchPage({
  params,
}) {
  const workspaceId = React.use(params).workspaceId;

  const [query, setQuery] =
    useState("");

  const [results, setResults] =
    useState([]);

  const [loading, setLoading] =
    useState(false);

  async function handleSearch() {
    if (!query.trim()) return;

    setLoading(true);

    try {
      const res = await fetch(
        "/api/search/semantic",
        {
          method: "POST",

          headers: {
            "Content-Type":
              "application/json",
          },

          body: JSON.stringify({
            query,
            workspaceId,
          }),
        }
      );

      const data =
        await res.json();

      console.log(data);

      setResults(
        data.results || []
      );
    } catch (err) {
      console.error(err);
    }

    setLoading(false);
  }

  return (
    <main
      style={{
        padding: 40,
      }}
    >
      <h1
        style={{
          fontSize: 32,
          marginBottom: 20,
        }}
      >
        Semantic Search
      </h1>

      <div
        style={{
          display: "flex",
          gap: 12,
          marginBottom: 30,
        }}
      >
        <input
          value={query}
          onChange={(e) =>
            setQuery(
              e.target.value
            )
          }
          placeholder="Ask anything..."
          style={{
            padding: 12,
            width: 400,
            border:
              "1px solid #ccc",
            borderRadius: 8,
          }}
        />

        <button
          onClick={handleSearch}
          style={{
            padding:
              "12px 20px",
            borderRadius: 8,
            background: "black",
            color: "white",
            border: "none",
            cursor: "pointer",
          }}
        >
          {loading
            ? "Searching..."
            : "Search"}
        </button>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection:
            "column",
          gap: 16,
        }}
      >
        {results.map((note) => (
          <div
            key={note.id}
            style={{
              border:
                "1px solid #e5e5e5",
              borderRadius: 12,
              padding: 20,
            }}
          >
            <h2>
              {note.title}
            </h2>

            <p>
              Similarity:
              {" "}
              {Number(
                note.similarity
              ).toFixed(3)}
            </p>

            <p>
              {note.summary}
            </p>
          </div>
        ))}
      </div>
    </main>
  );
}