"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import * as api from "../services/blog20Service";
import "../blog-2.0.css";

function statusLabel(s) {
  if (s === "pushed") return "On MailerLite";
  if (s === "processing") return "Pushing…";
  if (s === "failed") return "Push failed";
  return "Blog-2.0 only";
}

export default function Blog20DraftsPage() {
  const router = useRouter();
  const { loading: authLoading, canView, canEdit, isReadOnly } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pushingId, setPushingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canEditModule = canEdit("blog_2_0") && !isReadOnly("blog_2_0");

  useEffect(() => {
    if (authLoading) return;
    if (!canView("blog_2_0")) {
      router.replace("/admin");
      return;
    }
    load();
  }, [authLoading, canView, router]);

  const load = async () => {
    setLoading(true);
    try {
      const list = await api.listDrafts();
      setDrafts(list);
    } catch (err) {
      setError(err.message || "Failed to load drafts");
    } finally {
      setLoading(false);
    }
  };

  const handlePush = async (id) => {
    setPushingId(id);
    setError("");
    setSuccess("");
    try {
      const res = await api.pushDraftToMailerLite(id);
      setSuccess(res.note || `Draft ${id} pushed to MailerLite.`);
      await load();
    } catch (err) {
      setError(err.message || "Push failed");
    } finally {
      setPushingId(null);
    }
  };

  if (authLoading || loading) {
    return <div className="b20-page"><p>Loading drafts…</p></div>;
  }

  return (
    <div className="b20-page">
      <div className="b20-hero">
        <h1>Bright CRM drafts</h1>
        <p>
          Saved by Blog-2.0 agent. Push to MailerLite website with the browser bot, or copy
          manually from Blog Agent chat.
        </p>
      </div>

      {error && <div className="b20-alert err">{error}</div>}
      {success && <div className="b20-alert ok">{success}</div>}

      <div className="b20-card">
        <div className="b20-actions" style={{ marginBottom: "1rem" }}>
          <Link href="/admin/blog-2.0/mailerlite" className="b20-btn b20-btn-secondary">
            Bot settings
          </Link>
          <Link href="/admin/blog-2.0/agent" className="b20-btn b20-btn-secondary">
            Blog Agent
          </Link>
        </div>

        {!drafts.length && <p>No drafts yet. Use Blog Agent to create one.</p>}

        <ul className="b20-checklist">
          {drafts.map((d) => (
            <li key={d.id}>
              <span
                className={`b20-dot ${
                  d.mailerlite_push_status === "pushed" ? "done" : "pending"
                }`}
              />
              <div style={{ flex: 1 }}>
                <strong>{d.title}</strong>
                <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  #{d.id} · {statusLabel(d.mailerlite_push_status)}
                  {d.mailerlite_push_error ? ` — ${d.mailerlite_push_error}` : ""}
                </div>
              </div>
              {canEditModule && d.mailerlite_push_status !== "pushed" && (
                <button
                  type="button"
                  className="b20-btn b20-btn-primary"
                  disabled={pushingId === d.id}
                  onClick={() => handlePush(d.id)}
                >
                  {pushingId === d.id ? "Pushing…" : "Push to MailerLite"}
                </button>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
