"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { api } from "@/lib/api";
import PasswordInput from "../components/PasswordInput";
import AccessToggle from "../components/AccessToggle";
import ModulePermissionMatrix from "../components/ModulePermissionMatrix";
import {
  buildEmptyMatrix,
  formatPermissionSummary,
  matrixFromModuleList,
  moduleListFromMatrix,
} from "@/lib/modulePermissions";
import { adminLoginUrl, teamLoginUrl } from "@/lib/authUrls";
import "../admin-users.css";

function isUserActive(u) {
  return u.is_active === true || u.is_active === 1;
}

export default function UsersPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [createMatrix, setCreateMatrix] = useState(buildEmptyMatrix);
  const [togglingId, setTogglingId] = useState(null);
  const [editingUser, setEditingUser] = useState(null);
  const [editMatrix, setEditMatrix] = useState(buildEmptyMatrix);
  const [newPassword, setNewPassword] = useState("");
  const [saving, setSaving] = useState(false);

  const teamLoginLink = useMemo(() => {
    if (typeof window !== "undefined") {
      return teamLoginUrl(window.location.origin);
    }
    return teamLoginUrl();
  }, []);

  const adminLoginLink = useMemo(() => {
    if (typeof window !== "undefined") {
      return adminLoginUrl(window.location.origin);
    }
    return adminLoginUrl();
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (user?.role !== "super_admin") {
      router.replace("/admin");
      return;
    }
    loadUsers();
  }, [authLoading, user, router]);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await api.get("/api/auth/users");
      setUsers(data.data || []);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const createUser = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    const moduleAccess = moduleListFromMatrix(createMatrix);
    if (moduleAccess.length === 0) {
      setError("Enable at least one module and set permissions");
      return;
    }
    setSaving(true);
    try {
      const res = await api.post("/api/auth/users", {
        email: email.trim(),
        password,
        fullName: fullName.trim() || undefined,
        moduleAccess,
      });
      setEmail("");
      setPassword("");
      setFullName("");
      setCreateMatrix(buildEmptyMatrix());
      setSuccess(
        res.message ||
          `User created. They can log in at ${teamLoginLink} with the email and password you set.`,
      );
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const setAccess = async (userId, isActive) => {
    setTogglingId(userId);
    try {
      await api.patch(`/api/auth/users/${userId}/status`, { isActive });
      setUsers((prev) =>
        prev.map((u) =>
          u.id === userId ? { ...u, is_active: isActive ? 1 : 0 } : u,
        ),
      );
    } catch (err) {
      alert(err.message);
      loadUsers();
    }
    setTogglingId(null);
  };

  const openEdit = (u) => {
    setEditingUser(u);
    setEditMatrix(matrixFromModuleList(u.moduleAccess || u.modules || []));
    setNewPassword("");
    setError("");
    setSuccess("");
  };

  const saveEdit = async () => {
    if (!editingUser) return;
    const moduleAccess = moduleListFromMatrix(editMatrix);
    if (moduleAccess.length === 0) {
      setError("Enable at least one module");
      return;
    }
    setSaving(true);
    try {
      await api.patch(`/api/auth/users/${editingUser.id}/modules`, {
        moduleAccess,
      });
      setEditingUser(null);
      setEditMatrix(buildEmptyMatrix());
      setSuccess("Permissions updated.");
      loadUsers();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const savePassword = async () => {
    if (!editingUser) return;
    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await api.patch(`/api/auth/users/${editingUser.id}/password`, {
        newPassword,
      });
      setSuccess(`Password updated for ${editingUser.email}`);
      setNewPassword("");
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const revokeUser = async (userId, userEmail) => {
    if (
      !confirm(
        `Permanently revoke ${userEmail}?\n\nUse the access toggle to suspend temporarily.`,
      )
    ) {
      return;
    }
    try {
      await api.delete(`/api/auth/users/${userId}`);
      if (editingUser?.id === userId) {
        setEditingUser(null);
        setEditMatrix(buildEmptyMatrix());
      }
      loadUsers();
    } catch (err) {
      alert(err.message);
    }
  };

  if (authLoading || loading) {
    return <p className="users-loading">Loading…</p>;
  }

  const staffUsers = users.filter((u) => u.role !== "super_admin");

  return (
    <div className="users-saas">
      <header className="users-saas-header">
        <div>
          <h1>Manage users</h1>
          <p>
            Share the team login URL with staff (not the admin login). Super admins use{" "}
            <a href={adminLoginLink} className="users-login-link" target="_blank" rel="noreferrer">
              {adminLoginLink.replace(/^https?:\/\//, "")}
            </a>
            .
          </p>
        </div>
        <div className="users-saas-actions">
          <Link href="/admin" className="users-btn users-btn-ghost">
            All modules
          </Link>
        </div>
      </header>

      <div className="users-login-banner">
        <div>
          <strong>Team login URL</strong> — send this to HR, marketing, etc.
          <code>{teamLoginLink}</code>
        </div>
        <button
          type="button"
          className="users-btn users-btn-ghost users-btn-sm"
          onClick={() => navigator.clipboard?.writeText(teamLoginLink)}
        >
          Copy team link
        </button>
      </div>
      <p className="users-login-hint">
        Your super-admin login:{" "}
        <a href={adminLoginLink}>{adminLoginLink.replace(/^https?:\/\//, "")}</a>
      </p>

      {error && <div className="users-alert users-alert-error">{error}</div>}
      {success && <div className="users-alert users-alert-success">{success}</div>}

      <div className="users-grid">
        <section className="users-panel">
          <h2>{editingUser ? "Edit user" : "New user"}</h2>
          <p className="panel-sub">
            {editingUser
              ? editingUser.email
              : "Create an account — share the login URL and password with them"}
          </p>

          {!editingUser && (
            <form onSubmit={createUser}>
              <div className="users-field">
                <label htmlFor="new-email">Email</label>
                <input
                  id="new-email"
                  type="email"
                  placeholder="hr@tech2globe.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="users-field">
                <label htmlFor="new-name">Full name (optional)</label>
                <input
                  id="new-name"
                  type="text"
                  placeholder="HR User"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>
              <div className="users-field">
                <label>Password</label>
                <PasswordInput
                  placeholder="Min 6 characters"
                  value={password}
                  onChange={setPassword}
                  required
                  minLength={6}
                />
              </div>
              <ModulePermissionMatrix
                matrix={createMatrix}
                onChange={setCreateMatrix}
                disabled={saving}
              />
              <div className="users-form-footer">
                <button
                  type="submit"
                  className="users-btn users-btn-primary"
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Create user"}
                </button>
              </div>
            </form>
          )}

          {editingUser && (
            <>
              <ModulePermissionMatrix
                matrix={editMatrix}
                onChange={setEditMatrix}
                disabled={saving}
              />
              <div className="users-form-footer">
                <button
                  type="button"
                  className="users-btn users-btn-primary"
                  onClick={saveEdit}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Save permissions"}
                </button>
                <button
                  type="button"
                  className="users-btn users-btn-ghost"
                  onClick={() => {
                    setEditingUser(null);
                    setEditMatrix(buildEmptyMatrix());
                    setError("");
                  }}
                >
                  Cancel
                </button>
              </div>

              <div className="users-reset-password">
                <h3>Change password</h3>
                <p className="panel-sub">Set a new password for this user</p>
                <PasswordInput
                  placeholder="New password (min 6 chars)"
                  value={newPassword}
                  onChange={setNewPassword}
                  minLength={6}
                />
                <button
                  type="button"
                  className="users-btn users-btn-primary"
                  style={{ marginTop: 10 }}
                  onClick={savePassword}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Update password"}
                </button>
              </div>
            </>
          )}
        </section>

        <section className="users-panel">
          <h2>All users</h2>
          <p className="panel-sub">{staffUsers.length} team member(s)</p>

          {staffUsers.length === 0 ? (
            <p className="users-empty">No staff users yet. Create one on the left.</p>
          ) : (
            <div className="users-list">
              {staffUsers.map((u) => {
                const active = isUserActive(u);
                const isEditing = editingUser?.id === u.id;
                const summary = formatPermissionSummary(
                  u.moduleAccess || u.modules,
                );
                return (
                  <div
                    key={u.id}
                    className={`users-list-item${!active ? " suspended" : ""}${isEditing ? " is-active-edit" : ""}`}
                  >
                    <div>
                      <div className="users-list-email">{u.email}</div>
                      <div className="users-list-meta">
                        <span className="users-badge users-badge-role">
                          {u.role}
                        </span>
                        {!active && (
                          <span className="users-badge users-badge-warn">
                            Suspended
                          </span>
                        )}
                      </div>
                      <div className="users-list-badges">
                        <span className="users-badge">{summary}</span>
                      </div>
                    </div>
                    <div className="users-list-actions">
                      <AccessToggle
                        id={`access-${u.id}`}
                        active={active}
                        disabled={togglingId === u.id}
                        onChange={(checked) => setAccess(u.id, checked)}
                      />
                      <button
                        type="button"
                        className={`users-icon-btn${isEditing ? " primary" : ""}`}
                        onClick={() => openEdit(u)}
                      >
                        {isEditing ? "Editing…" : "Edit"}
                      </button>
                      <button
                        type="button"
                        className="users-icon-btn"
                        onClick={() => revokeUser(u.id, u.email)}
                        style={{ color: "#dc2626", borderColor: "#fecaca" }}
                      >
                        Revoke
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>

      <style>{`
        .users-loading { color: #64748b; padding: 24px; }
      `}</style>
    </div>
  );
}
