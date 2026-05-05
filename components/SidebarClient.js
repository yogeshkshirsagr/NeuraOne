"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import {
  Brain,
  ChevronsUpDown,
  LogOut,
  MessageCircle,
  PanelLeft,
  Settings,
  TrendingUp,
} from "lucide-react";

import { useUser, UserButton, SignOutButton } from "@clerk/nextjs";

export default function SidebarClient({ workspaceId, workspaceName }) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  const { user } = useUser();
  const firstName = user?.firstName?.trim();
  const lastName = user?.lastName?.trim();
  const userWorkspaceName =
    firstName && lastName
      ? `${firstName} ${lastName}`
      : workspaceName || firstName || "Workspace";

  const workspaceBasePath = workspaceId ? `/workspace/${workspaceId}` : "/workspace";
  const menu = [
    { name: "Chat", href: `${workspaceBasePath}/chat`, icon: MessageCircle },
    { name: "Memories", href: `${workspaceBasePath}/memories`, icon: Brain },
  ];

  useEffect(() => {
    if (!isProfileOpen) return;

    function handleOutsideClick(event) {
      if (!profileRef.current?.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("pointerdown", handleOutsideClick);

    return () => {
      document.removeEventListener("pointerdown", handleOutsideClick);
    };
  }, [isProfileOpen]);

  return (
    <div
      style={{
        width: isCollapsed ? 64 : 280,
        height: "100vh",
        background: "#f3f4f6",
        borderRight: "1px solid #f3f4f6",
        padding: "18px 8px 20px",
        display: "flex",
        flexDirection: "column",
        boxSizing: "border-box",
        fontFamily: "Inter, Arial, sans-serif",
        overflow: "visible",
        transition: "width 0.2s ease",
      }}
    >
      <style jsx>{`
        .sidebar-toggle {
          width: 30px;
          height: 30px;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0;
          border: 0;
          background: transparent;
          color: #6b7280;
          cursor: pointer;
          transition: color 0.18s ease;
        }

        .sidebar-toggle:hover {
          color: #111827;
        }

        .menu-link,
        .menu-link:visited,
        .menu-link:hover,
        .menu-link:active {
          color: #6b7280;
          display: block;
          cursor: default;
          text-decoration: none !important;
        }

        .menu-link *,
        .menu-link span {
          cursor: default;
          text-decoration: none !important;
        }

        .menu-item {
          height: 36px;
          display: flex;
          align-items: center;
          justify-content: flex-start;
          gap: 10px;
          padding: 0 10px;
          border-radius: 12px;
          background: transparent;
          cursor: default;
          color: #6b7280;
          font-size: 15px;
          line-height: 1;
          font-family: Inter, Arial, sans-serif;
          transition:
            background 0.18s ease,
            color 0.18s ease;
        }

        .menu-link:hover .menu-item,
        .menu-item:hover {
          background: #fff;
          color: #374151;
        }

        .menu-item.active {
          background: #fff;
          color: #111827;
        }

        .menu-link:hover .menu-item.active,
        .menu-item.active:hover {
          color: #111827;
        }

        .menu-link:active .menu-item,
        .menu-item:active {
          background: #f3f4f6;
          color: #111827;
        }

        .menu-icon {
          width: 20px;
          height: 20px;
          flex: 0 0 20px;
        }

        .menu-item.collapsed {
          width: 44px;
          height: 44px;
          justify-content: center;
          gap: 0;
          padding: 0;
          box-sizing: border-box;
        }

        .profile-action {
          color: #6b7280;
          background: transparent;
          transition:
            background 0.18s ease,
            color 0.18s ease;
        }

        .profile-action:hover {
          background: #f3f4f6;
          color: #111827;
        }
      `}</style>
      {/* TOP */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "space-between",
          marginBottom: 30,
          padding: isCollapsed ? 0 : "0 10px",
        }}
      >
        {!isCollapsed && (
          <div
            style={{
              fontSize: 20,
              fontWeight: 800,
              transform: "translate(-2px, -3px)",
            }}
          >
            Neura<span style={{ color: "#8a8f98" }}>One</span>
          </div>
        )}

        <button
          className="sidebar-toggle"
          onClick={() => setIsCollapsed(!isCollapsed)}
        >
          <PanelLeft size={18} />
        </button>
      </div>

      {/* USER */}
      <div
        style={{
          height: 44,
          display: "flex",
          alignItems: "center",
          justifyContent: isCollapsed ? "center" : "flex-start",
          gap: 12,
          padding: isCollapsed ? 0 : "0 12px",
          marginBottom: 16,
          borderRadius: 10,
          background: "#e3e6ec",
          boxSizing: "border-box",
        }}
      >
        <UserButton afterSignOutUrl="/sign-in" />
        {!isCollapsed && (
          <span
            style={{
              minWidth: 0,
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
              fontSize: 15,
              fontWeight: 600,
              lineHeight: "20px",
            }}
          >
            {userWorkspaceName}
          </span>
        )}
      </div>

      {/* MENU */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: isCollapsed ? "center" : "stretch",
          gap: 6,
        }}
      >
        {menu.map((item) => {
          const isActive = pathname.startsWith(item.href);
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className="menu-link"
              style={{ textDecoration: "none" }}
            >
              <div
                className={`menu-item${isActive ? " active" : ""}${
                  isCollapsed ? " collapsed" : ""
                }`}
              >
                <Icon className="menu-icon" />
                {!isCollapsed && <span>{item.name}</span>}
              </div>
            </Link>
          );
        })}
      </div>

      <div style={{ flex: 1 }} />

      {/* PROFILE */}
      <div
        ref={profileRef}
        style={{
          position: "relative",
          margin: "0 -8px -20px",
          padding: isCollapsed ? "12px 10px" : "12px 12px",
          background: "#f9fafb",
          borderTop: "1px solid #dbeafe",
          boxSizing: "border-box",
        }}
      >
        {isProfileOpen && (
          <div
            style={{
              position: "absolute",
              left: isCollapsed ? 20 : 16,
              right: isCollapsed ? "auto" : 16,
              bottom: 80,
              width: isCollapsed ? 248 : "auto",
              padding: "18px 10px 14px",
              background: "#fff",
              border: "1px solid #c7f3ef",
              borderRadius: 12,
              boxShadow: "0 18px 38px rgba(15, 23, 42, 0.16)",
              zIndex: 20,
            }}
          >
            <div
              style={{
                padding: "2px 14px 14px",
                color: "#4b5563",
                fontSize: 13,
                lineHeight: "20px",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
              }}
            >
              {user?.primaryEmailAddress?.emailAddress}
            </div>

            <Link
              href="/settings"
              style={{ color: "#6b7280", textDecoration: "none" }}
            >
              <div
                className="profile-action"
                style={{
                  height: 38,
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  padding: "0 14px",
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                <Settings size={20} strokeWidth={1.8} />
                <span>Settings</span>
              </div>
            </Link>

            <div
              style={{
                height: 1,
                background: "#e5e7eb",
                margin: "8px 0 6px",
              }}
            />

            <Link
              href="/upgrade"
              style={{ color: "#6b7280", textDecoration: "none" }}
            >
              <div
                className="profile-action"
                style={{
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  padding: "0 14px",
                  borderRadius: 8,
                  fontSize: 16,
                  fontWeight: 500,
                  cursor: "pointer",
                }}
              >
                <TrendingUp size={20} strokeWidth={1.8} />
                <span>Upgrade Plan</span>
              </div>
            </Link>

            <SignOutButton redirectUrl="/sign-in">
              <button
                className="profile-action"
                style={{
                  width: "100%",
                  height: 36,
                  display: "flex",
                  alignItems: "center",
                  gap: 24,
                  padding: "0 14px",
                  border: 0,
                  borderRadius: 8,
                  cursor: "pointer",
                  fontFamily: "Inter, Arial, sans-serif",
                  fontSize: 16,
                  fontWeight: 500,
                  textAlign: "left",
                }}
              >
                <LogOut size={20} strokeWidth={1.8} />
                <span>Log out</span>
              </button>
            </SignOutButton>
          </div>
        )}

        <button
          onClick={() => setIsProfileOpen(!isProfileOpen)}
          style={{
            width: "100%",
            minHeight: isCollapsed ? 44 : 50,
            display: "flex",
            alignItems: "center",
            justifyContent: isCollapsed ? "center" : "space-between",
            gap: isCollapsed ? 0 : 10,
            padding: 0,
            border: 0,
            background: "transparent",
            cursor: "pointer",
            textAlign: "left",
            fontFamily: "Inter, Arial, sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: isCollapsed ? "center" : "flex-start",
              gap: isCollapsed ? 0 : 10,
              minWidth: 0,
              width: isCollapsed ? 44 : "auto",
            }}
          >
            <div
              style={{
                width: isCollapsed ? 44 : 40,
                height: isCollapsed ? 44 : 40,
                flex: isCollapsed ? "0 0 44px" : "0 0 40px",
                borderRadius: "50%",
                background: "#6672d5",
                border: "1px solid #fff",
                boxShadow: "0 0 0 1px #9ca3af",
                color: "#fff",
                display: "grid",
                placeItems: "center",
                fontSize: 18,
                fontWeight: 500,
                lineHeight: 1,
              }}
            >
              {user?.firstName?.charAt(0) || "Y"}
            </div>

            {!isCollapsed && (
              <div style={{ minWidth: 0 }}>
                <div
                  style={{
                    color: "#020617",
                    fontSize: 15,
                    fontWeight: 700,
                    lineHeight: "19px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {user?.fullName || "User"}
                </div>
                <div
                  style={{
                    color: "#020617",
                    fontSize: 13,
                    lineHeight: "18px",
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
