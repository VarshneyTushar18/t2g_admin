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
      <aside
        style={{
          width: "220px",
          background: "#1e293b",
          color: "white",
          padding: "20px",
        }}
      >
        <h2>Admin</h2>

        <div style={{ marginTop: "30px" }}>
          <p>
            <Link href="/admin/dashboard" style={{ color: "white" }}>
              Dashboard
            </Link>
          </p>

          <p>
            <Link href="/admin/leads" style={{ color: "white" }}>
              Leads
            </Link>
          </p>

          <p>
            <Link href="/admin/portfolio" style={{ color: "white" }}>
              Portfolio
            </Link>
          </p>
          <p>
            <Link href="/admin/career/jobs" style={{ color: "white" }}>
              Career Jobs
            </Link>
          </p>

          <p>
            <Link href="/admin/life" style={{ color: "white" }}>
              Life Gallery
            </Link>
          </p>

          <p>
            <Link href="/admin/testimonials" style={{ color: "white" }}>
              Testimonials
            </Link>
          </p>

          <p>
            <Link href="/admin/case-studies" style={{ color: "white" }}>
              Case Studies
            </Link>
          </p>

          <p>
            <Link href="/admin/login" style={{ color: "white" }}>
              Logout
            </Link>
          </p>
        </div>
      </aside>

      <main style={{ flex: 1, padding: "40px" }}>{children}</main>
    </div>
  );
}
