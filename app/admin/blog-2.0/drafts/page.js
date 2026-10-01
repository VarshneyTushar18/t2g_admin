"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import * as api from "../services/blog20Service";
import MailerLiteSessionAlert from "../components/MailerLiteSessionAlert";
import BotPushProgress from "../components/BotPushProgress";
import "../blog-2.0.css";

function statusLabel(d) {
  const s = d.mailerlite_push_status;
  if (s === "pushed") return "On MailerLite";
  if (s === "processing") return d.mailerlite_push_step || "Pushing…";
  if (s === "failed") return "Push failed";
  return "Blog-2.0 only";
}

export default function Blog20DraftsPage() {
  const router = useRouter();
  const { loading: authLoading, canView, canEdit, isReadOnly } = useAuth();
  const [drafts, setDrafts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pushingId, setPushingId] = useState(null);
  const [approvingId, setApprovingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [settings, setSettings] = useState(null);

  const canEditModule = canEdit("blog_2_0") && !isReadOnly("blog_2_0");
  const botActive =
    pushingId != null ||
    drafts.some((d) => d.mailerlite_push_status === "processing");

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
      const [list, s] = await Promise.all([api.listDrafts(), api.getSettings()]);
      setDrafts(list);
      setSettings(s);
    } catch (err) {
      setError(err.message || "Failed to load drafts");
    } finally {
      setLoading(false);
    }
  };

  const refreshDraftsQuiet = async () => {
    try {
      const list = await api.listDrafts();
      setDrafts(list);
    } catch {
      /* ignore background refresh errors */
    }
  };

  useEffect(() => {
    if (!botActive) return undefined;
    const id = setInterval(refreshDraftsQuiet, 3000);
    return () => clearInterval(id);
  }, [botActive]);

  const handleSendApproval = async (id) => {
    setApprovingId(id);
    setError("");
    setSuccess("");
    try {
      const res = await api.requestDraftApproval(id);
      const who = (res.recipients || []).join(", ");
      setSuccess(`Approval email sent for draft #${id}${who ? ` to ${who}` : ""}.`);
    } catch (err) {
      setError(err.message || "Failed to send approval email");
    } finally {
      setApprovingId(null);
    }
  };

  const handleDelete = async (d) => {
    const onMailerLite = d.mailerlite_push_status === "pushed";
    const ok = window.confirm(
      onMailerLite
        ? `Delete draft #${d.id} from Admin?\n\n"${d.title}"\n\nThis does NOT remove the post from MailerLite — only hides it from this list.`
        : `Delete draft #${d.id}?\n\n"${d.title}"`,
    );
    if (!ok) return;
    setDeletingId(d.id);
    setError("");
    setSuccess("");
    try {
      const res = await api.deleteDraft(d.id);
      setSuccess(res.note || `Draft #${d.id} deleted.`);
      await load();
    } catch (err) {
      setError(err.message || "Failed to delete draft");
    } finally {
      setDeletingId(null);
    }
  };

  const handlePush = async (id, publishLive = false) => {
    setPushingId(id);
    setError("");
    setSuccess("");
    try {
      const res = await api.pushDraftToMailerLite(id, { publishLive });
      setSuccess(
        res.note ||
          (publishLive
            ? `Draft ${id} published live on MailerLite.`
            : `Draft ${id} saved as draft on MailerLite.`),
      );
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
          Each time the Blog Agent saves a post, a <strong>new row</strong> is added here — repeated
          tests create duplicates with the same title. Use <strong>Delete</strong> to clean up.
          Deleting only removes the Admin record; posts already on MailerLite stay there.
        </p>
      </div>

      <MailerLiteSessionAlert
        settings={settings}
        canEdit={canEditModule}
        onRefresh={load}
      />

      <BotPushProgress
        active={botActive}
        onComplete={() => {
          refreshDraftsQuiet();
          load();
        }}
      />

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
                  d.mailerlite_push_status === "pushed"
                    ? "done"
                    : d.mailerlite_push_status === "processing"
                      ? "active"
                      : "pending"
                }`}
              />
              <div style={{ flex: 1 }}>
                <strong>{d.title}</strong>
                <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                  #{d.id} · {statusLabel(d)}
                  {d.mailerlite_push_error ? ` — ${d.mailerlite_push_error}` : ""}
                </div>
                {d.mailerlite_push_status === "processing" && d.mailerlite_push_step && (
                  <div
                    style={{
                      fontSize: "0.8rem",
                      color: "#7c3aed",
                      marginTop: "0.2rem",
                      fontWeight: 500,
                    }}
                  >
                    {d.mailerlite_push_step}
                  </div>
                )}
              </div>
              {canEditModule && (
                <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap", alignItems: "center" }}>
                  {d.mailerlite_push_status !== "pushed" && (
                    <>
                      <button
                        type="button"
                        className="b20-btn b20-btn-secondary"
                        disabled={approvingId === d.id}
                        onClick={() => handleSendApproval(d.id)}
                      >
                        {approvingId === d.id ? "Sending…" : "Send approval email"}
                      </button>
                      <button
                        type="button"
                        className="b20-btn b20-btn-secondary"
                        disabled={pushingId === d.id}
                        onClick={() => handlePush(d.id, false)}
                      >
                        {pushingId === d.id ? "Working…" : "Save as draft"}
                      </button>
                      {settings?.mailerlite_allow_direct_publish !== false && (
                        <button
                          type="button"
                          className="b20-btn b20-btn-primary"
                          disabled={pushingId === d.id}
                          onClick={() => handlePush(d.id, true)}
                        >
                          {pushingId === d.id ? "Working…" : "Publish live"}
                        </button>
                      )}
                    </>
                  )}
                  <button
                    type="button"
                    className="b20-btn b20-btn-secondary"
                    disabled={deletingId === d.id}
                    onClick={() => handleDelete(d)}
                    style={{ color: "#b91c1c", borderColor: "#fecaca" }}
                  >
                    {deletingId === d.id ? "Deleting…" : "Delete"}
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
