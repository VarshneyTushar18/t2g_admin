"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { api } from "@/lib/api";
import PasswordInput from "../components/PasswordInput";

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user?.role !== "super_admin") {
      router.replace("/admin");
    }
  }, [authLoading, user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    if (newPassword !== confirm) {
      setError("New passwords do not match");
      return;
    }
    setLoading(true);
    try {
      await api.patch("/api/auth/me/password", { currentPassword, newPassword });
      setMessage("Password updated successfully");
      setCurrentPassword("");
      setNewPassword("");
      setConfirm("");
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  if (authLoading || user?.role !== "super_admin") {
    return <p>Loading...</p>;
  }

  return (
    <>
      <style>{`
        .profile-form { max-width: 400px; }
        .profile-field { margin-bottom: 16px; }
        .profile-field label {
          display: block;
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 6px;
          color: #334155;
        }
        @media (max-width: 640px) {
          .profile-form { max-width: none; }
          .profile-form button[type="submit"] {
            width: 100%;
            min-height: 44px;
          }
        }
      `}</style>
      <div>
        <h1 style={{ marginBottom: 8 }}>Change password</h1>
        <p style={{ color: "#64748b", marginBottom: 24 }}>{user?.email}</p>
        <p style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>
          Only the super admin account can update its password here. Other users
          must contact super admin to reset their password.
        </p>

        <form onSubmit={handleSubmit} className="profile-form">
          <div className="profile-field">
            <label htmlFor="current-password">Current password</label>
            <PasswordInput
              id="current-password"
              value={currentPassword}
              onChange={setCurrentPassword}
              required
            />
          </div>
          <div className="profile-field">
            <label htmlFor="new-password">New password</label>
            <PasswordInput
              id="new-password"
              value={newPassword}
              onChange={setNewPassword}
              required
              minLength={6}
              placeholder="Min 6 characters"
            />
          </div>
          <div className="profile-field">
            <label htmlFor="confirm-password">Confirm new password</label>
            <PasswordInput
              id="confirm-password"
              value={confirm}
              onChange={setConfirm}
              required
              placeholder="Repeat new password"
            />
          </div>
          {error && <p style={{ color: "#dc2626", marginBottom: 12 }}>{error}</p>}
          {message && <p style={{ color: "#16a34a", marginBottom: 12 }}>{message}</p>}
          <button type="submit" disabled={loading} style={{ padding: "10px 20px" }}>
            {loading ? "Saving..." : "Update password"}
          </button>
        </form>
      </div>
    </>
  );
}
