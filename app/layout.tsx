import "./globals.css";
import Sidebar from "./components/Sidebar";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body style={{ margin: 0 }}>
        <div style={{ display: "flex" }}>

          {/* Sidebar */}
          <Sidebar />

          {/* Main content */}
          <div style={{ flex: 1, background: "#f9fafb", color: "#020617" }}>
            {children}
          </div>

        </div>
      </body>
    </html>
  );
}
