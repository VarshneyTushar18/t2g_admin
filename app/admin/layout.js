"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) return <>{children}</>;

  const navItems = [
    { href: "/admin/leads", label: "Leads" },
    { href: "/admin/portfolio", label: "Portfolio" },
    { href: "/admin/career/jobs", label: "Career Jobs" },
    { href: "/admin/life", label: "Life Gallery" },
    { href: "/admin/testimonials", label: "Testimonials" },
    { href: "/admin/case-studies", label: "Case Studies" },
  ];

  return (
    <div className="admin-scope">

      {/* Sidebar */}
      <aside className="sidebar">
        <h2 className="logo">Admin</h2>

        <nav>
          {navItems.map((item) => {
            const active = pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`link ${active ? "active" : ""}`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <Link href="/admin/login" className="logout">
          Logout
        </Link>
      </aside>

      {/* Main */}
      <main className="main">
        {children}
      </main>

      {/* 🔥 Scoped Theme ONLY for Admin */}
      <style>{`
        .admin-scope {
          --bg-base: #f5f7fb;
          --bg-surface: #ffffff;
          --bg-muted: #f1f5f9;

          --text-primary: #0f172a;
          --text-secondary: #64748b;

          --border: #e2e8f0;

          --primary: #2563eb;
          --primary-light: #eff6ff;

          --danger: #ef4444;

          display: flex;
          min-height: 100vh;
          background: var(--bg-base);
          color: var(--text-primary);
        }

        /* Sidebar */
        .sidebar {
          width: 220px;
          background: var(--bg-surface);
          border-right: 1px solid var(--border);
          padding: 20px;
          display: flex;
          flex-direction: column;
        }

        .logo {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 30px;
        }

        .link {
          display: block;
          padding: 10px 12px;
          border-radius: 8px;
          color: var(--text-secondary);
          text-decoration: none;
          margin-bottom: 6px;
          font-size: 14px;
        }

        .link:hover {
          background: var(--bg-muted);
          color: var(--text-primary);
        }

        .link.active {
          background: var(--primary-light);
          color: var(--primary);
          font-weight: 600;
        }

        .logout {
          margin-top: auto;
          padding: 10px 12px;
          color: var(--danger);
          text-decoration: none;
          border-radius: 8px;
        }

        .logout:hover {
          background: #fee2e2;
        }

        /* Main */
        .main {
          flex: 1;
          padding: 30px;
          background: var(--bg-base);
        }

        /* Tables (auto applied to all pages inside admin) */
        table {
          width: 100%;
          background: var(--bg-surface);
        }

        thead {
          background: var(--bg-muted);
          color: var(--text-secondary);
          font-size: 12px;
          text-transform: uppercase;
        }

        tbody tr {
          border-bottom: 1px solid var(--border);
        }

        tbody tr:hover {
          background: var(--bg-muted);
        }
      `}</style>
    </div>
  );
}