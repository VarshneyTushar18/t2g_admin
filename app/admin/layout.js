"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh" }}>
      <aside style={{
        width: "220px",
        minWidth: "220px",
        flexShrink: 0,
        backgroundColor: "#1e293b",
        color: "white",
        padding: "20px"
      }}>
        <h2 style={{ color: "white", marginBottom: "30px" }}>Admin</h2>
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <Link href="/admin/leads" style={{ color: "white" }}>Leads</Link>
          <Link href="/admin/portfolio" style={{ color: "white" }}>Portfolio</Link>
          <Link href="/admin/career/jobs" style={{ color: "white" }}>Career Jobs</Link>
          <Link href="/admin/life" style={{ color: "white" }}>Life Gallery</Link>
          <Link href="/admin/testimonials" style={{ color: "white" }}>Testimonials</Link>
          <Link href="/admin/case-studies" style={{ color: "white" }}>Case Studies</Link>
          <Link href="/admin/login" style={{ color: "white", marginTop: "40px" }}>Logout</Link>
        </div>
      </aside>

      <main style={{ flex: 1, minWidth: 0, padding: "40px", overflow: "hidden" }}>
        {children}
      </main>
    </div>
  );
}