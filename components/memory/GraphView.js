"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

//
// NODE COLORS
//
function getNodeColor(type) {
  switch ((type || "").toLowerCase()) {
    //
    // CORE NOTES
    //
    case "note":
      return "#10b981"; // emerald

    case "idea":
      return "#8b5cf6"; // violet

    case "research":
      return "#0ea5e9"; // sky blue

    case "memory":
      return "#f59e0b"; // amber

    case "task":
      return "#ef4444"; // red

    case "meeting":
      return "#ec4899"; // pink

    case "journal":
      return "#6366f1"; // indigo

    //
    // FUTURE TYPES
    //
    case "person":
      return "#3b82f6";

    case "organization":
      return "#f97316";

    case "knowledge":
      return "#14b8a6";

    default:
      return "#64748b"; // slate
  }
}

export default function GraphView({
  workspaceId,
  activeFolder,
}) {
  const router = useRouter();

  const containerRef = useRef(null);
  const graphRef = useRef(null);

  const [graphData, setGraphData] =
    useState({
      nodes: [],
      links: [],
    });

  //
  // LOAD GRAPH
  //
  useEffect(() => {
    const loadGraph = async () => {
      try {
        const res = await fetch(
          "/api/graph"
        );

        const data = await res.json();

        setGraphData(data);
      } catch (err) {
        console.error(err);
      }
    };

    loadGraph();
  }, []);

  //
  // INIT GRAPH
  //
  useEffect(() => {
    let cancelled = false;

    async function initGraph() {
      const ForceGraph =
        (await import("force-graph"))
          .default;

      const d3 = await import("d3-force");

      if (
        cancelled ||
        !containerRef.current
      ) {
        return;
      }

      //
      // CLEAR OLD GRAPH
      //
      containerRef.current.innerHTML =
        "";

      //
      // CREATE GRAPH
      //
      const graph = ForceGraph()(
        containerRef.current
      )
        //
        // CANVAS
        //
        .backgroundColor("#fcfcfd")

        //
        // DATA
        //
        .graphData(graphData)

        //
        // NODE COLORS
        //
        .nodeColor((node) =>
          getNodeColor(node.type)
        )

        //
        // NODE SIZE
        //
        .nodeRelSize(6)

        //
        // LINK STYLE
        //
        .linkWidth(1.2)

        .linkColor(() =>
          "rgba(120,120,120,0.18)"
        )

        //
        // LABELS
        //
        .nodeLabel((node) => `
          ${node.name}
          (${node.type || "note"})
        `)

        //
        // CUSTOM NODE DRAW
        //
        .nodeCanvasObject(
          (
            node,
            ctx,
            globalScale
          ) => {
            const label =
              node.name || "Untitled";

            const fontSize =
              15 / globalScale;

            const color =
              getNodeColor(node.type);

            //
            // GLOW
            //
            ctx.shadowColor = color;

            ctx.shadowBlur = 18;

            //
            // NODE
            //
            ctx.beginPath();

            ctx.fillStyle = color;

            ctx.arc(
              node.x,
              node.y,
              9,
              0,
              2 * Math.PI,
              false
            );

            ctx.fill();

            //
            // RESET SHADOW
            //
            ctx.shadowBlur = 0;

            //
            // LABEL
            //
            ctx.font = `500 ${fontSize}px Inter, sans-serif`;

            ctx.fillStyle = "#111827";

            ctx.fillText(
              label,
              node.x + 16,
              node.y + 5
            );
          }
        )

        //
        // PHYSICS
        //
        .d3Force(
          "charge",
          d3
            .forceManyBody()
            .strength(-260)
        )

        .d3Force(
          "link",
          d3
            .forceLink()
            .distance(150)
        )

        .d3Force(
          "collision",
          d3.forceCollide(42)
        )

        //
        // CENTER
        //
        .d3VelocityDecay(0.28)

        //
        // CLICK
        //
        .onNodeClick((node) => {
          //
          // CENTER CAMERA
          //
          graph.centerAt(
            node.x,
            node.y,
            700
          );

          graph.zoom(2.2, 700);

          //
          // OPEN NOTE
          //
          setTimeout(() => {
            router.push(
              `/workspace/${workspaceId}/memories/${activeFolder}/${node.id}`
            );
          }, 300);
        });

      //
      // RESPONSIVE SIZE
      //
      const updateSize = () => {
        if (!containerRef.current)
          return;

        graph
          .width(
            containerRef.current
              .clientWidth
          )
          .height(
            containerRef.current
              .clientHeight
          );
      };

      updateSize();

      window.addEventListener(
        "resize",
        updateSize
      );

      graphRef.current = graph;

      //
      // CLEANUP
      //
      return () => {
        window.removeEventListener(
          "resize",
          updateSize
        );
      };
    }

    initGraph();

    return () => {
      cancelled = true;

      graphRef.current?.pauseAnimation();

      graphRef.current = null;

      if (containerRef.current) {
        containerRef.current.innerHTML =
          "";
      }
    };
  }, [
    graphData,
    router,
    workspaceId,
    activeFolder,
  ]);

  return (
    <div
      style={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
        background: "#fcfcfd",
      }}
    >
      {/* DOT GRID BACKGROUND */}

      <div
        style={{
          position: "absolute",
          inset: 0,

          backgroundImage:
            "radial-gradient(#d4d4d8 1px, transparent 1px)",

          backgroundSize:
            "26px 26px",

          opacity: 0.45,

          pointerEvents: "none",
        }}
      />

      {/* GRAPH */}

      <div
        ref={containerRef}
        style={{
          width: "100%",
          height: "100%",
          position: "relative",
          zIndex: 2,
          overflow: "hidden",
        }}
      />
    </div>
  );
}