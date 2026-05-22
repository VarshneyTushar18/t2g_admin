"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      <button
        type="button"
        className="menu-toggle"
        aria-label="Toggle navigation"
        onClick={() => setSidebarOpen((open) => !open)}
      >
        ☰
      </button>

      {sidebarOpen && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`sidebar${sidebarOpen ? " open" : ""}`}>
        <div>
          <h2 className="logo">Admin</h2>

          <nav>
            {navItems.map((item) => {
              const active = pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`link ${active ? "active" : ""}`}
                  onClick={() => setSidebarOpen(false)}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="sidebar-footer">
          <Link href="/admin/login" className="logout">
            Logout
          </Link>
        </div>
      </aside>

      <main className="main">{children}</main>

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
          overflow-x: hidden;
          position: relative;
        }

        .menu-toggle {
          display: none;
        }

        .sidebar-backdrop {
          display: none;
        }

        /* Sidebar */
        .sidebar {
          width: 220px;
          flex-shrink: 0;
          background: var(--bg-surface);
          border-right: 1px solid var(--border);
          padding: 20px;
          display: flex;
          flex-direction: column;
        }

        .sidebar-footer {
          margin-top: auto;
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
          padding: 10px 12px;
          color: var(--danger);
          text-decoration: none;
          border-radius: 8px;
          display: block;
        }

        .logout:hover {
          background: #fee2e2;
        }

        /* Main */
        .main {
          flex: 1;
          min-width: 0;
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

        @media (max-width: 768px) {
          .menu-toggle {
            display: block;
            position: fixed;
            top: 12px;
            left: 12px;
            z-index: 1100;
            background: var(--bg-surface);
            border: 1px solid var(--border);
            border-radius: 8px;
            padding: 8px 12px;
            font-size: 18px;
            cursor: pointer;
            line-height: 1;
          }

          .sidebar-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 999;
            background: rgba(0, 0, 0, 0.35);
            border: none;
            padding: 0;
            cursor: pointer;
          }

          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100vh;
            z-index: 1000;
            transform: translateX(-100%);
            transition: transform 0.2s ease;
            box-shadow: none;
          }

          .sidebar.open {
            transform: translateX(0);
            box-shadow: 4px 0 24px rgba(0, 0, 0, 0.12);
          }

          .main {
            padding: 16px;
            padding-top: 52px;
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}
