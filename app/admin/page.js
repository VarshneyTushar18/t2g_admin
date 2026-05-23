"use client";

import Link from "next/link";
import { useAuth } from "./context/AuthContext";
import { getModuleTiles } from "@/lib/adminModules";
import { ModuleIcon, MODULE_THEMES } from "./components/ModuleIcons";
import "./admin-home.css";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function roleLabel(role) {
  if (role === "super_admin") return "Super Admin";
  if (role === "hr") return "HR";
  if (role === "digital_marketing") return "Digital Marketing";
  return role || "Staff";
}

function userInitial(email) {
  return (email?.[0] || "A").toUpperCase();
}

export default function AdminHomePage() {
  const { user, loading, logout } = useAuth();
  const tiles = getModuleTiles(user);
  const isSuperAdmin = user?.role === "super_admin";

  if (loading) {
    return (
      <div className="admin-home-loading">
        <div className="admin-home-spinner" />
        <span>Loading workspace…</span>
      </div>
    );
  }

  const firstName =
    user?.email?.split("@")[0]?.replace(/[._]/g, " ") || "there";

  return (
    <div className="admin-home">
      <div className="admin-home-bg" aria-hidden />
      <div className="admin-home-grid-pattern" aria-hidden />

      <div className="admin-home-shell">
        <header className="admin-home-nav">
          <Link href="/admin" className="admin-home-brand">
            <div className="admin-home-logo">T2G</div>
            <div className="admin-home-brand-text">
              <strong>Tech2Globe</strong>
              <span>Admin Console</span>
            </div>
          </Link>

          <div className="admin-home-nav-right">
            <div className="admin-home-user">
              <div className="admin-home-avatar">{userInitial(user?.email)}</div>
              <span className="admin-home-user-email">{user?.email}</span>
            </div>
            {isSuperAdmin && (
              <>
                <Link href="/admin/users" className="admin-home-btn admin-home-btn-ghost">
                  <UsersIcon />
                  Users
                </Link>
                <Link href="/admin/profile" className="admin-home-btn admin-home-btn-ghost">
                  <KeyIcon />
                  Security
                </Link>
              </>
            )}
            <button
              type="button"
              className="admin-home-btn admin-home-btn-primary"
              onClick={logout}
            >
              <LogoutIcon />
              Sign out
            </button>
          </div>
        </header>

        <section className="admin-home-hero">
          <div className="admin-home-hero-badge">Workspace active</div>
          <h1>
            {getGreeting()}, {firstName}
          </h1>
          <p>
            Pick a module below to manage your site content. Everything you need
            is one click away.
          </p>
        </section>

        <div className="admin-home-stats">
          <div className="admin-home-stat">
            <div className="admin-home-stat-label">Modules</div>
            <div className="admin-home-stat-value">{tiles.length}</div>
            <div className="admin-home-stat-hint">Available to you</div>
          </div>
          <div className={`admin-home-stat${isSuperAdmin ? " role-super" : ""}`}>
            <div className="admin-home-stat-label">Your role</div>
            <div className="admin-home-stat-value">{roleLabel(user?.role)}</div>
            <div className="admin-home-stat-hint">
              {isSuperAdmin ? "Full platform access" : "Scoped permissions"}
            </div>
          </div>
          <div className="admin-home-stat">
            <div className="admin-home-stat-label">Session</div>
            <div className="admin-home-stat-value" style={{ fontSize: 16 }}>
              Secure
            </div>
            <div className="admin-home-stat-hint">8-hour authenticated session</div>
          </div>
        </div>

        <div className="admin-home-section-head">
          <div>
            <h2>Your modules</h2>
            <p>Select where you want to work today</p>
          </div>
        </div>

        {tiles.length === 0 ? (
          <div className="admin-home-empty">
            <h3>No modules assigned</h3>
            <p>Contact your super admin to get access.</p>
          </div>
        ) : (
          <div className="admin-home-modules">
            {tiles.map((tile) => {
              const theme = MODULE_THEMES[tile.key] || MODULE_THEMES.leads;
              return (
                <Link
                  key={tile.key}
                  href={tile.href}
                  className="admin-home-module-card"
                  style={{
                    "--module-accent": theme.accent,
                    "--module-glow": theme.glow,
                    "--module-icon-bg": theme.bg,
                  }}
                >
                  <div className="admin-home-module-icon">
                    <ModuleIcon moduleKey={tile.key} />
                  </div>
                  <h3>{tile.label}</h3>
                  <p className="module-desc">{tile.description}</p>
                  <div className="admin-home-module-footer">
                    <span>Open module</span>
                    <ArrowIcon />
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        <footer className="admin-home-footer">
          Tech2Globe Admin · {new Date().getFullYear()}
        </footer>
      </div>
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function UsersIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" strokeLinecap="round" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" strokeLinecap="round" />
    </svg>
  );
}

function KeyIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M21 2l-2 2m-7.61 7.61a5.5 5.5 0 11-7.778 7.778 5.5 5.5 0 017.777-7.777zm0 0L15.5 7.5m0 0l3 3L22 7l-3-3m-3.5 3.5L19 4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
