"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { getActiveSection, getSidebarNav } from "@/lib/adminModules";
import "./admin-mobile.css";

function AdminShell({ children }) {
  const pathname = usePathname();
  const isHome =
    pathname === "/admin" || pathname === "/admin/dashboard";
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout, loading } = useAuth();
  const isSuperAdmin = user?.role === "super_admin";

  const activeSection = getActiveSection(pathname);
  const sectionNav = getSidebarNav(pathname, user);

  useEffect(() => {
    if (typeof document === "undefined") return;
    const mobile = window.matchMedia("(max-width: 768px)");
    const lock = sidebarOpen && mobile.matches;
    document.body.style.overflow = lock ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [sidebarOpen]);

  if (loading && !isHome) {
    return (
      <div className="admin-loading">
        <p>Loading...</p>
        <style>{`
          .admin-loading {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #64748b;
          }
        `}</style>
      </div>
    );
  }

  if (isHome) {
    return (
      <>
        {children}
        <style>{`
          body { margin: 0; background: #f8fafc; }
        `}</style>
      </>
    );
  }

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
          <div className="sidebar-head">
            <h2 className="logo">{activeSection?.label || "Admin"}</h2>
            <button
              type="button"
              className="sidebar-close"
              aria-label="Close menu"
              onClick={() => setSidebarOpen(false)}
            >
              ✕
            </button>
          </div>
          {activeSection && (
            <p className="section-tag">{activeSection.label}</p>
          )}

          <nav>
            <Link
              href="/admin"
              className="link"
              onClick={() => setSidebarOpen(false)}
            >
              ← All modules
            </Link>
            {sectionNav.map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
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
          {isSuperAdmin && (
            <>
              <Link
                href="/admin/profile"
                className="link"
                onClick={() => setSidebarOpen(false)}
              >
                Change password
              </Link>
              <Link
                href="/admin/users"
                className="link"
                onClick={() => setSidebarOpen(false)}
              >
                Manage Users
              </Link>
            </>
          )}
          <button type="button" className="logout logout-btn" onClick={logout}>
            Logout
          </button>
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
        .menu-toggle { display: none; }
        .sidebar-backdrop { display: none; }
        .sidebar-close {
          display: none;
        }
        .sidebar {
          width: min(280px, 85vw);
          flex-shrink: 0;
          background: var(--bg-surface);
          border-right: 1px solid var(--border);
          padding: 20px;
          display: flex;
          flex-direction: column;
        }
        .sidebar-footer { margin-top: auto; }
        .logo {
          font-size: 18px;
          font-weight: 700;
          margin-bottom: 4px;
        }
        .section-tag {
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          color: var(--text-secondary);
          margin: 0 0 20px 12px;
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
        .logout:hover { background: #fee2e2; }
        .logout-btn {
          width: 100%;
          text-align: left;
          background: none;
          border: none;
          font: inherit;
          cursor: pointer;
        }
        .main {
          flex: 1;
          min-width: 0;
          padding: 30px;
          background: var(--bg-base);
        }
        .sidebar-head {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 8px;
          margin-bottom: 4px;
        }
        .admin-scope table {
          width: 100%;
          background: var(--bg-surface);
        }
        .admin-scope thead {
          background: var(--bg-muted);
          color: var(--text-secondary);
          font-size: 12px;
          text-transform: uppercase;
        }
        .admin-scope tbody tr { border-bottom: 1px solid var(--border); }
        .admin-scope tbody tr:hover { background: var(--bg-muted); }
        @media (max-width: 768px) {
          .menu-toggle {
            display: flex;
            align-items: center;
            justify-content: center;
            position: fixed;
            top: 12px;
            left: 12px;
            z-index: 1100;
            width: 44px;
            height: 44px;
            background: var(--bg-surface);
            border: 1px solid var(--border);
            border-radius: 10px;
            padding: 0;
            font-size: 20px;
            cursor: pointer;
            box-shadow: 0 2px 8px rgba(0,0,0,0.08);
          }
          .sidebar-backdrop {
            display: block;
            position: fixed;
            inset: 0;
            z-index: 999;
            background: rgba(0, 0, 0, 0.4);
            border: none;
            cursor: pointer;
          }
          .sidebar-close {
            display: flex;
            align-items: center;
            justify-content: center;
            width: 36px;
            height: 36px;
            flex-shrink: 0;
            border: none;
            background: var(--bg-muted);
            border-radius: 8px;
            font-size: 16px;
            cursor: pointer;
            color: var(--text-secondary);
          }
          .sidebar {
            position: fixed;
            top: 0;
            left: 0;
            height: 100dvh;
            z-index: 1000;
            transform: translateX(-100%);
            transition: transform 0.25s ease;
            overflow-y: auto;
          }
          .sidebar.open {
            transform: translateX(0);
            box-shadow: 4px 0 24px rgba(0, 0, 0, 0.15);
          }
          .main {
            padding: 16px;
            padding-top: 60px;
            width: 100%;
            box-sizing: border-box;
          }
          .logo {
            font-size: 16px;
            line-height: 1.3;
            padding-right: 4px;
          }
        }
        @media (max-width: 480px) {
          .main {
            padding: 12px;
            padding-top: 56px;
          }
        }
      `}</style>
    </div>
  );
}

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const isLoginPage = pathname === "/admin/login";

  if (isLoginPage) return <>{children}</>;

  return (
    <AuthProvider>
      <AdminShell>{children}</AdminShell>
    </AuthProvider>
  );
}
