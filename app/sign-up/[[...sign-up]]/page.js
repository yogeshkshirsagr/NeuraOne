"use client";

import { SignUp, useUser } from "@clerk/nextjs";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Page() {
  const { isSignedIn, isLoaded } = useUser(); // ✅ FIX
  const router = useRouter();

  useEffect(() => {
    if (!isLoaded) return; // ✅ WAIT for Clerk

    if (isSignedIn) {
      router.replace("/"); // ✅ correct flow
    }
  }, [isSignedIn, isLoaded, router]);

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div
        style={{
          flex: 1,
          background: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ width: 400 }}>
          <SignUp
            routing="path"
            path="/sign-up"
            signInUrl="/sign-in"
          />
        </div>
      </div>

      <div
        style={{
          flex: 1,
          background: "#000",
          color: "#fff",
          padding: "80px 60px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <div style={{ maxWidth: 700 }}>
          <h1>NeuraOne</h1>

          <h2
            style={{
              fontSize: 32,
              fontWeight: 600,
              margin: "48px 0 24px",
            }}
          >
            Your personal knowledge system, reimagined.
          </h2>

          <p style={{ color: "#6b7280" }}>
            One intelligent space to save, organize, and retrieve your knowledge instantly.
          </p>
        </div>
      </div>
    </div>
  );
}