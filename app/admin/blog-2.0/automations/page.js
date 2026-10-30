"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import * as api from "../services/blog20Service";
import "../blog-2.0.css";

const DAYS = [
  { id: 0, label: "Sun" },
  { id: 1, label: "Mon" },
  { id: 2, label: "Tue" },
  { id: 3, label: "Wed" },
  { id: 4, label: "Thu" },
  { id: 5, label: "Fri" },
  { id: 6, label: "Sat" },
];

const DEFAULTS = {
  automation_enabled: false,
  automation_frequency: "weekly",
  automation_run_days: [1],
  automation_run_time: "12:00",
  automation_posts_per_run: 1,
  automation_topic_source: "auto_research",
  automation_auto_niche:
    "construction CRM, general contractors, project managers, bids, pipeline, jobsite efficiency",
  automation_posts_stagger_seconds: 120,
  timezone: "Asia/Kolkata",
};

function statusLabel(status) {
  if (status === "draft_ready") return "Draft ready — email sent";
  if (status === "processing") return "AI writing…";
  if (status === "failed") return "Failed";
  if (status === "queued") return "Waiting in queue";
  return status || "—";
}

function statusClass(status) {
  if (status === "draft_ready") return "b20-badge active";
  if (status === "processing") return "b20-badge active";
  if (status === "failed") return "b20-badge pending";
  return "b20-badge pending";
}

export default function Blog20AutomationsPage() {
  const router = useRouter();
  const { loading: authLoading, canView, canEdit, isReadOnly } = useAuth();
  const canEditBlog20 = canEdit("blog_2_0") && !isReadOnly("blog_2_0");

  const [form, setForm] = useState(DEFAULTS);
  const [topics, setTopics] = useState([]);
  const [scheduleStatus, setScheduleStatus] = useState(null);
  const [approvalEmails, setApprovalEmails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [newTopic, setNewTopic] = useState("");
  const [newNotes, setNewNotes] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getAutomations();
      setForm({ ...DEFAULTS, ...data.settings });
      setTopics(data.topics || []);
      setScheduleStatus(data.scheduleStatus || null);
      setApprovalEmails(data.settings?.approval_emails || []);
    } catch (err) {
      setError(err.message || "Failed to load automations");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!canView("blog_2_0")) router.replace("/admin");
    else load();
  }, [authLoading, canView, router, load]);

  const toggleDay = (id) => {
    setForm((prev) => {
      const days = new Set(prev.automation_run_days || []);
      if (days.has(id)) days.delete(id);
      else days.add(id);
      return { ...prev, automation_run_days: [...days].sort((a, b) => a - b) };
    });
  };

  const save = async () => {
    if (!canEditBlog20) return;
    setSaving(true);
    setMessage("");
    setError("");
    try {
      const data = await api.saveAutomationSettings(form);
      setForm({ ...DEFAULTS, ...data.settings });
      setScheduleStatus(data.scheduleStatus);
      setMessage("Schedule saved. Cron runs every minute on the server when enabled.");
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const addTopic = async () => {
    const topic = newTopic.trim();
    if (!topic || !canEditBlog20) return;
    try {
      await api.createAutomationTopic({ topic, notes: newNotes.trim() });
      setNewTopic("");
      setNewNotes("");
      await load();
    } catch (err) {
      setError(err.message || "Could not add topic");
    }
  };

  const runNow = async (bootstrapResearch = false) => {
    if (!canEditBlog20) return;
    setRunning(true);
    setMessage("");
    setError("");
    try {
      const result = await api.runAutomationsNow({
        bootstrap_research: bootstrapResearch,
      });
      await load();
      if (result.processed) {
        const ok = (result.results || []).filter((r) => r.ok).length;
        setMessage(`Run finished: ${ok}/${result.processed} topic(s) wrote drafts + approval emails.`);
      } else {
        setMessage(result.message || "Nothing to run — add topics or enable auto research.");
      }
    } catch (err) {
      setError(err.message || "Run failed");
    } finally {
      setRunning(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="b20-page">
        <p>Loading…</p>
      </div>
    );
  }

  const showWeekdays = form.automation_frequency === "weekly";

  return (
    <div className="b20-page">
      <div className="b20-hero">
        <h1>Automations</h1>
        <p>
          AI researches topics, writes Bright CRM drafts, and emails your team to approve or reject.
          MailerLite push runs after they click Yes (same as manual drafts).
        </p>
      </div>

      {error ? (
        <div className="b20-card" style={{ borderColor: "#fecaca", marginBottom: "1rem" }}>
          <p style={{ margin: 0, color: "#b91c1c" }}>{error}</p>
        </div>
      ) : null}
      {message ? (
        <div className="b20-card" style={{ borderColor: "#bbf7d0", marginBottom: "1rem" }}>
          <p style={{ margin: 0, color: "#166534" }}>{message}</p>
        </div>
      ) : null}

      {!approvalEmails.length ? (
        <div className="b20-card" style={{ marginBottom: "1rem", background: "#fffbeb" }}>
          <p style={{ margin: 0, lineHeight: 1.55 }}>
            Add <strong>approval emails</strong> in{" "}
            <Link href="/admin/blog-2.0/setup">Setup</Link> so automations can send Preview / Yes / No.
            Without them, drafts save but nobody gets emailed.
          </p>
        </div>
      ) : null}

      <div className="b20-card" style={{ marginBottom: "1rem" }}>
        <h2>Schedule</h2>
        {scheduleStatus ? (
          <p style={{ color: "#64748b", fontSize: "0.9rem", marginTop: 0 }}>
            {scheduleStatus.message} · {scheduleStatus.timezone}
            {form.automation_last_run_at
              ? ` · Last run: ${new Date(form.automation_last_run_at).toLocaleString()}`
              : ""}
          </p>
        ) : null}

        <label style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1rem" }}>
          <input
            type="checkbox"
            checked={Boolean(form.automation_enabled)}
            disabled={!canEditBlog20}
            onChange={(e) => setForm((p) => ({ ...p, automation_enabled: e.target.checked }))}
          />
          <strong>Enable scheduled automations</strong>
        </label>

        <div className="b20-form" style={{ display: "grid", gap: "0.75rem", maxWidth: 420 }}>
          <label>
            Frequency
            <select
              value={form.automation_frequency}
              disabled={!canEditBlog20}
              onChange={(e) => setForm((p) => ({ ...p, automation_frequency: e.target.value }))}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly (1st of month)</option>
            </select>
          </label>
          <label>
            Run time ({form.timezone || "Asia/Kolkata"})
            <input
              type="time"
              value={form.automation_run_time}
              disabled={!canEditBlog20}
              onChange={(e) => setForm((p) => ({ ...p, automation_run_time: e.target.value }))}
            />
          </label>
          <label>
            Posts per run (1–5)
            <input
              type="number"
              min={1}
              max={5}
              value={form.automation_posts_per_run}
              disabled={!canEditBlog20}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  automation_posts_per_run: Math.min(5, Math.max(1, Number(e.target.value) || 1)),
                }))
              }
            />
          </label>
        </div>

        {showWeekdays ? (
          <div style={{ marginTop: "1rem" }}>
            <p style={{ margin: "0 0 0.5rem", fontWeight: 600, fontSize: "0.9rem" }}>Weekdays</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.35rem" }}>
              {DAYS.map((d) => {
                const on = (form.automation_run_days || []).includes(d.id);
                return (
                  <button
                    key={d.id}
                    type="button"
                    disabled={!canEditBlog20}
                    className={on ? "b20-btn b20-btn-primary" : "b20-btn b20-btn-secondary"}
                    style={{ padding: "0.35rem 0.65rem", fontSize: "0.85rem" }}
                    onClick={() => toggleDay(d.id)}
                  >
                    {d.label}
                  </button>
                );
              })}
            </div>
          </div>
        ) : null}

        <div style={{ marginTop: "1.25rem" }}>
          <p style={{ margin: "0 0 0.5rem", fontWeight: 600 }}>Topic source</p>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>
            <input
              type="radio"
              name="topicSource"
              checked={form.automation_topic_source === "auto_research"}
              disabled={!canEditBlog20}
              onChange={() => setForm((p) => ({ ...p, automation_topic_source: "auto_research" }))}
            />{" "}
            Auto research (recommended) — AI finds fresh construction CRM angles each run
          </label>
          <label style={{ display: "block" }}>
            <input
              type="radio"
              name="topicSource"
              checked={form.automation_topic_source === "manual"}
              disabled={!canEditBlog20}
              onChange={() => setForm((p) => ({ ...p, automation_topic_source: "manual" }))}
            />{" "}
            Manual queue — you add topics below
          </label>
        </div>

        {form.automation_topic_source === "auto_research" ? (
          <label style={{ display: "block", marginTop: "1rem" }}>
            Research niche
            <textarea
              rows={3}
              value={form.automation_auto_niche}
              disabled={!canEditBlog20}
              onChange={(e) => setForm((p) => ({ ...p, automation_auto_niche: e.target.value }))}
            />
          </label>
        ) : null}

        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "1.25rem" }}>
          <button type="button" className="b20-btn b20-btn-primary" disabled={saving || !canEditBlog20} onClick={save}>
            {saving ? "Saving…" : "Save schedule"}
          </button>
          <button
            type="button"
            className="b20-btn"
            disabled={running || !canEditBlog20}
            onClick={() => runNow(form.automation_topic_source === "auto_research")}
          >
            {running ? "Running…" : "Run now"}
          </button>
        </div>
      </div>

      <div className="b20-card">
        <h2>Topic queue</h2>
        <p style={{ color: "#64748b", fontSize: "0.9rem", lineHeight: 1.5 }}>
          Queued → AI writes → <strong>draft_ready</strong> with approval email pending. Failed rows can
          be retried. View drafts in{" "}
          <Link href="/admin/blog-2.0/drafts">Drafts</Link>.
        </p>

        {canEditBlog20 ? (
          <div className="b20-form" style={{ marginBottom: "1rem" }}>
            <input
              placeholder="Topic title or angle"
              value={newTopic}
              onChange={(e) => setNewTopic(e.target.value)}
            />
            <textarea
              rows={2}
              placeholder="Optional notes for the agent"
              value={newNotes}
              style={{ marginTop: "0.5rem" }}
              onChange={(e) => setNewNotes(e.target.value)}
            />
            <button type="button" className="b20-btn b20-btn-primary" style={{ marginTop: "0.5rem" }} onClick={addTopic}>
              Add to queue
            </button>
          </div>
        ) : null}

        {!topics.length ? (
          <p style={{ color: "#94a3b8" }}>No topics yet. Enable auto research or add one manually.</p>
        ) : (
          <ul className="b20-checklist">
            {topics.map((t) => (
              <li key={t.id}>
                <span
                  className={`b20-dot ${
                    t.status === "draft_ready"
                      ? "done"
                      : t.status === "failed"
                        ? "failed"
                        : t.status === "processing"
                          ? "active"
                          : "pending"
                  }`}
                />
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", alignItems: "center" }}>
                    <strong>{t.topic}</strong>
                    <span className={statusClass(t.status)}>{statusLabel(t.status)}</span>
                  </div>
                  {t.generated_draft_id ? (
                    <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>
                      Draft #{t.generated_draft_id}
                      {t.generated_title ? ` — ${t.generated_title}` : ""}
                    </p>
                  ) : null}
                  {t.error_message ? (
                    <p style={{ margin: "0.25rem 0 0", fontSize: "0.85rem", color: "#b91c1c" }}>{t.error_message}</p>
                  ) : null}
                  {canEditBlog20 && t.status === "failed" ? (
                    <button
                      type="button"
                      className="b20-btn"
                      style={{ marginTop: "0.35rem", fontSize: "0.8rem" }}
                      onClick={async () => {
                        await api.retryAutomationTopic(t.id);
                        load();
                      }}
                    >
                      Retry
                    </button>
                  ) : null}
                  {canEditBlog20 ? (
                    <button
                      type="button"
                      className="b20-btn"
                      style={{ marginTop: "0.35rem", marginLeft: "0.35rem", fontSize: "0.8rem" }}
                      onClick={async () => {
                        if (!window.confirm("Remove this topic from the queue?")) return;
                        await api.deleteAutomationTopic(t.id);
                        load();
                      }}
                    >
                      Delete
                    </button>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
