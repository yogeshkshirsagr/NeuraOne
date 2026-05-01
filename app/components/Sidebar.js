"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Brain,
  ChevronsUpDown,
  LogOut,
  MessageSquare,
  PanelLeft,
  Settings,
  TrendingUp,
} from "lucide-react";

export default function Sidebar() {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  const menu = [
    {
      name: "Chat",
      href: "/",
      icon: MessageSquare,
    },
    {
      name: "Memories",
      href: "/memories",
      icon: Brain,
    },
  ];

  return (
    <div
      style={{
        width: isCollapsed ? 64 : 320,
        height: "100vh",
        background: "#f3f4f6",
        borderRight: "1px solid #e5e7eb",
        padding: isCollapsed ? "22px 8px" : "22px 8px",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        fontFamily: "Inter, Arial, Helvetica, sans-serif",
        transition: "width 0.2s ease",
        position: "relative",
        overflow: "visible",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          marginBottom: 34,
          padding: isCollapsed ? 0 : "0 12px",
        }}
      >
        {!isCollapsed && (
          <div
            style={{
              color: "#000",
              fontSize: 21,
              fontWeight: 800,
              lineHeight: 1,
            }}
          >
            Neura<span style={{ color: "#8a8f98" }}>One</span>
          </div>
        )}

        <button
          aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={() => setIsCollapsed((collapsed) => !collapsed)}
          style={{
            width: 32,
            height: 32,
            border: 0,
            background: "transparent",
            color: "#6b7280",
            display: "grid",
            placeItems: "center",
            cursor: "pointer",
            padding: 0,
          }}
        >
          <PanelLeft size={22} strokeWidth={2.2} />
        </button>
      </div>

      <div
        style={{
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "flex-start",
          gap: isCollapsed ? 0 : 20,
          padding: isCollapsed ? 0 : "0 12px 0 10px",
          margin: isCollapsed ? "0 0 14px 0" : "0 0 14px 2px",
          borderRadius: 12,
          background: isCollapsed ? "transparent" : "#e3e6ec",
          color: "#0f172a",
          fontSize: 16,
          fontWeight: 700,
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            flex: "0 0 36px",
            borderRadius: 14,
            background: "#6672d5",
            color: "#fff",
            display: "grid",
            placeItems: "center",
            fontSize: 20,
            fontWeight: 600,
          }}
        >
          Y
        </div>

        {!isCollapsed && (
          <span
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            yogesh&apos;s workspace
          </span>
        )}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {menu.map((item) => {
          const isActive =
            item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              style={{ display: "block", textDecoration: "none" }}
            >
              <div
                style={{
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: isCollapsed ? "center" : "flex-start",
                  gap: isCollapsed ? 0 : 14,
                  padding: isCollapsed ? 0 : "0 12px",
                  borderRadius: 8,
                  cursor: "pointer",
                  background: isActive ? "#fff" : "transparent",
                  color: isActive ? "#020617" : "#6b7280",
                  boxShadow: isActive ? "0 1px 2px rgba(15, 23, 42, 0.04)" : "none",
                  transition:
                    "background 0.18s ease, color 0.18s ease, box-shadow 0.18s ease",
                }}
                onMouseEnter={(event) => {
                  event.currentTarget.style.background = "#fff";
                  event.currentTarget.style.color = "#020617";
                  event.currentTarget.style.boxShadow =
                    "0 1px 2px rgba(15, 23, 42, 0.04)";
                }}
                onMouseLeave={(event) => {
                  event.currentTarget.style.background = isActive ? "#fff" : "transparent";
                  event.currentTarget.style.color = isActive ? "#020617" : "#6b7280";
                  event.currentTarget.style.boxShadow = isActive
                    ? "0 1px 2px rgba(15, 23, 42, 0.04)"
                    : "none";
                }}
              >
                <Icon size={25} strokeWidth={isActive ? 2 : 2.4} />
                {!isCollapsed && (
                  <span style={{ fontSize: 16, fontWeight: isActive ? 700 : 500 }}>
                    {item.name}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      <div
        style={{
          position: "relative",
          margin: isCollapsed ? "0 -8px -22px" : "0 -8px -22px",
          padding: isCollapsed ? "10px 8px" : "14px 10px",
          background: "#fff",
          borderTop: "1px solid #dbeafe",
        }}
      >
        {isProfileOpen && !isCollapsed && (
          <div
            style={{
              position: "absolute",
              left: 22,
              right: 22,
              bottom: 82,
              padding: "18px 10px 12px",
              background: "#fff",
              border: "1px solid #c7f3ef",
              borderRadius: 12,
              boxShadow: "0 16px 34px rgba(15, 23, 42, 0.18)",
              zIndex: 20,
            }}
          >
            <div
              style={{
                padding: "4px 12px 16px",
                color: "#4b5563",
                fontSize: 15,
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              yogeshkshirsagar2007@gmail.com
            </div>

            <Link href="/settings" style={{ textDecoration: "none" }}>
              <div
                style={{
                  height: 48,
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  padding: "0 12px",
                  color: "#667085",
                  borderRadius: 8,
                  fontSize: 18,
                  fontWeight: 500,
                }}
              >
                <Settings size={22} strokeWidth={1.8} />
                <span>Settings</span>
              </div>
            </Link>

            <div
              style={{
                height: 1,
                background: "#e5e7eb",
                margin: "10px 0 8px",
              }}
            />

            <Link href="/upgrade" style={{ textDecoration: "none" }}>
              <div
                style={{
                  height: 44,
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  padding: "0 12px",
                  color: "#667085",
                  borderRadius: 8,
                  fontSize: 18,
                  fontWeight: 500,
                }}
              >
                <TrendingUp size={22} strokeWidth={1.8} />
                <span>Upgrade Plan</span>
              </div>
            </Link>

            <button
              type="button"
              style={{
                width: "100%",
                height: 44,
                display: "flex",
                alignItems: "center",
                gap: 24,
                padding: "0 12px",
                color: "#667085",
                border: 0,
                borderRadius: 8,
                background: "transparent",
                font: "inherit",
                fontSize: 18,
                fontWeight: 500,
                cursor: "pointer",
              }}
            >
              <LogOut size={22} strokeWidth={1.8} />
              <span>Log out</span>
            </button>
          </div>
        )}

        <button
          type="button"
          aria-expanded={isProfileOpen}
          aria-label="Open profile menu"
          onClick={() => setIsProfileOpen((open) => !open)}
          style={{
            width: "100%",
            minHeight: 54,
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            gap: 12,
            padding: isCollapsed ? 0 : "0 2px",
            border: 0,
            background: "transparent",
            cursor: "pointer",
            textAlign: "left",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              minWidth: 0,
            }}
          >
            <div
              style={{
                width: 44,
                height: 44,
                flex: "0 0 44px",
                borderRadius: "50%",
                background: "#6672d5",
                border: "1px solid #fff",
                boxShadow: "0 0 0 1px #9ca3af",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: 22,
                fontWeight: 500,
              }}
            >
              Y
            </div>

            {!isCollapsed && (
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    color: "#020617",
                    fontSize: 18,
                    fontWeight: 700,
                    lineHeight: "22px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  Yogesh Kshirsagar
                </div>
                <div
                  style={{
                    color: "#020617",
                    fontSize: 14,
                    lineHeight: "20px",
                  }}
                >
                  Free plan
                </div>
              </div>
            )}
          </div>

          {!isCollapsed && (
            <ChevronsUpDown
              size={18}
              strokeWidth={2}
              style={{ color: "#00b7c7", flex: "0 0 auto" }}
            />
          )}
        </button>
      </div>
    </div>
  );
}
