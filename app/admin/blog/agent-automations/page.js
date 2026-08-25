"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import ReadOnlyBanner from "../../components/ReadOnlyBanner";
import * as api from "../services/agentAutomationsService";

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
  enabled: false,
  timezone: "Asia/Kolkata",
  window_start: "",
  window_end: "",
  run_time: "10:00",
  run_days: [1, 2, 3, 4, 5],
  posts_per_run: 1,
  mode: "pending_email",
  approval_emails: "",
};

function toInputDateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  const hh = String(d.getHours()).padStart(2, "0");
  const min = String(d.getMinutes()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}T${hh}:${min}`;
}

function statusBadgeClass(status) {
  if (status === "draft_ready") return "aa-badge ok";
  if (status === "processing") return "aa-badge info";
  if (status === "failed") return "aa-badge bad";
  if (status === "queued") return "aa-badge warn";
  return "aa-badge";
}

export default function AgentAutomationsPage() {
  const { loading: authLoading, canView, canEdit, isReadOnly, user } = useAuth();
  const [settings, setSettings] = useState(DEFAULTS);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [runningNow, setRunningNow] = useState(false);
  const [testingEmail, setTestingEmail] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");
  const [topicForm, setTopicForm] = useState({
    topic: "",
    notes: "",
    author_name: "Tech2Globe Digital Team",
    tags: "",
    priority: 0,
    scheduled_for: "",
  });

  const canEditBlog = canEdit("blog") && !isReadOnly("blog");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const [s, t] = await Promise.all([api.getSettings(), api.listTopics()]);
      setSettings({
        enabled: !!s.enabled,
        timezone: s.timezone || "Asia/Kolkata",
        window_start: toInputDateTime(s.window_start),
        window_end: toInputDateTime(s.window_end),
        run_time: s.run_time || "10:00",
        run_days: Array.isArray(s.run_days) ? s.run_days : [1, 2, 3, 4, 5],
        posts_per_run: Number(s.posts_per_run || 1),
        mode: s.mode || "pending_email",
        approval_emails:
          Array.isArray(s.approval_emails) && s.approval_emails.length
            ? s.approval_emails.join(", ")
            : user?.email || "",
      });
      setTopics(t);
    } catch (err) {
      setError(err.message || "Failed to load automation settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && canView("blog")) load();
  }, [authLoading, canView]);

  const statusText = useMemo(() => {
    if (!settings.enabled) return "Automation is off";
    const days = DAYS.filter((d) => settings.run_days.includes(d.id))
      .map((d) => d.label)
      .join(", ");
    return `Runs at ${settings.run_time} · ${days || "no days selected"} · ${settings.timezone}`;
  }, [settings]);

  const saveSettings = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    const needsEmail = settings.mode !== "draft_only";
    const emails = settings.approval_emails
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (needsEmail && !emails.length) {
      setError("Add at least one sample blog email");
      setSaving(false);
      return;
    }
    try {
      const next = await api.saveSettings({
        ...settings,
        approval_emails: emails,
      });
      setSettings((prev) => ({
        ...prev,
        enabled: !!next.enabled,
        approval_emails: Array.isArray(next.approval_emails)
          ? next.approval_emails.join(", ")
          : prev.approval_emails,
      }));
      setSuccess(
        "Settings saved. Blog samples will go to: " + emails.join(", "),
      );
    } catch (err) {
      setError(err.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const testEmail = async () => {
    setTestingEmail(true);
    setError("");
    setSuccess("");
    const emails = settings.approval_emails
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    if (!emails.length) {
      setError("Enter a sample blog email first");
      setTestingEmail(false);
      return;
    }
    try {
      const result = await api.sendTestEmail(emails);
      setSuccess(`Test email sent to: ${(result.sentTo || emails).join(", ")}`);
    } catch (err) {
      setError(err.message || "Test email failed");
    } finally {
      setTestingEmail(false);
    }
  };

  const toggleDay = (id) => {
    setSettings((prev) => {
      const exists = prev.run_days.includes(id);
      const run_days = exists
        ? prev.run_days.filter((d) => d !== id)
        : [...prev.run_days, id].sort((a, b) => a - b);
      return { ...prev, run_days };
    });
  };

  const addTopic = async (e) => {
    e.preventDefault();
    if (!topicForm.topic.trim()) return;
    setError("");
    try {
      const created = await api.createTopic({
        ...topicForm,
        tags: topicForm.tags
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean),
        scheduled_for: topicForm.scheduled_for || null,
      });
      setTopics((prev) => [...prev, created]);
      setTopicForm((prev) => ({
        ...prev,
        topic: "",
        notes: "",
        tags: "",
        scheduled_for: "",
      }));
      setSuccess("Topic added to queue");
    } catch (err) {
      setError(err.message || "Could not add topic");
    }
  };

  const removeTopic = async (id) => {
    if (!confirm("Delete this topic?")) return;
    try {
      await api.deleteTopic(id);
      setTopics((prev) => prev.filter((t) => t.id !== id));
    } catch (err) {
      setError(err.message || "Delete failed");
    }
  };

  const runNow = async () => {
    setRunningNow(true);
    setError("");
    setSuccess("");
    try {
      await api.runNow();
      await load();
      setSuccess("Run finished. Check topic queue for results.");
    } catch (err) {
      setError(err.message || "Run now failed");
    } finally {
      setRunningNow(false);
    }
  };

  if (authLoading || !canView("blog")) {
    return (
      <div className="aa-page">
        <p>Loading…</p>
      </div>
    );
  }

  return (
    <>
      <style>{`
        .aa-page {
          min-height: 100vh;
          background: #f0f2f5;
          padding: 20px 24px 40px;
          font-family: system-ui, -apple-system, sans-serif;
          color: #0f172a;
        }
        .aa-inner { max-width: 1100px; margin: 0 auto; }
        .aa-back {
          display: inline-flex;
          color: #4f46e5;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .aa-back:hover { text-decoration: underline; }
        .aa-title {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
          color: #1a1a2e;
        }
        .aa-subtitle {
          margin: 6px 0 0;
          font-size: 14px;
          color: #64748b;
        }
        .aa-alert {
          margin-top: 16px;
          padding: 12px 14px;
          border-radius: 10px;
          font-size: 13px;
        }
        .aa-alert.err { background: #fef2f2; color: #b91c1c; border: 1px solid #fecaca; }
        .aa-alert.ok { background: #ecfdf5; color: #166534; border: 1px solid #a7f3d0; }
        .aa-grid {
          display: grid;
          gap: 20px;
          margin-top: 20px;
        }
        .aa-card {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.06);
          padding: 24px;
          border: 1px solid #eef2f7;
        }
        .aa-card-head {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 18px;
        }
        .aa-card-head h2 {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
        }
        .aa-card-head p {
          margin: 4px 0 0;
          font-size: 13px;
          color: #64748b;
        }
        .aa-badge {
          display: inline-flex;
          align-items: center;
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
          background: #e2e8f0;
          color: #475569;
          white-space: nowrap;
        }
        .aa-badge.ok { background: #dcfce7; color: #166534; }
        .aa-badge.warn { background: #fef3c7; color: #92400e; }
        .aa-badge.bad { background: #fee2e2; color: #991b1b; }
        .aa-badge.info { background: #dbeafe; color: #1e40af; }
        .aa-toggle {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 12px 14px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          font-weight: 600;
          font-size: 14px;
          margin-bottom: 18px;
        }
        .aa-fields {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px 16px;
        }
        .aa-field {
          display: flex;
          flex-direction: column;
          gap: 6px;
          font-size: 13px;
          font-weight: 600;
          color: #334155;
        }
        .aa-field.full { grid-column: 1 / -1; }
        .aa-input,
        .aa-select,
        .aa-textarea {
          width: 100%;
          box-sizing: border-box;
          padding: 10px 12px;
          border: 1px solid #cbd5e1;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 400;
          font-family: inherit;
          background: #fff;
          color: #0f172a;
        }
        .aa-input:focus,
        .aa-select:focus,
        .aa-textarea:focus {
          outline: none;
          border-color: #6366f1;
          box-shadow: 0 0 0 3px rgba(99,102,241,0.15);
        }
        .aa-input:disabled,
        .aa-select:disabled,
        .aa-textarea:disabled {
          background: #f1f5f9;
          color: #94a3b8;
        }
        .aa-textarea { min-height: 80px; resize: vertical; }
        .aa-days {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }
        .aa-day {
          border: 1px solid #cbd5e1;
          background: #fff;
          color: #475569;
          border-radius: 999px;
          padding: 7px 12px;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
        }
        .aa-day.on {
          background: #4f46e5;
          border-color: #4f46e5;
          color: #fff;
        }
        .aa-day:disabled { opacity: 0.5; cursor: not-allowed; }
        .aa-email-box {
          margin-top: 20px;
          padding: 16px;
          background: #f8fafc;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }
        .aa-email-box h3 {
          margin: 0;
          font-size: 15px;
          font-weight: 700;
          color: #0f172a;
        }
        .aa-email-box .hint {
          margin: 6px 0 12px;
          font-size: 13px;
          color: #64748b;
          font-weight: 400;
        }
        .aa-actions {
          margin-top: 20px;
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }
        .aa-btn {
          border: none;
          border-radius: 10px;
          padding: 10px 16px;
          font-size: 14px;
          font-weight: 600;
          cursor: pointer;
          font-family: inherit;
        }
        .aa-btn:disabled { opacity: 0.55; cursor: not-allowed; }
        .aa-btn.primary { background: #4f46e5; color: #fff; }
        .aa-btn.primary:hover:not(:disabled) { background: #4338ca; }
        .aa-btn.secondary {
          background: #fff;
          color: #334155;
          border: 1px solid #cbd5e1;
        }
        .aa-btn.secondary:hover:not(:disabled) { background: #f8fafc; }
        .aa-btn.danger {
          background: #fff;
          color: #b91c1c;
          border: 1px solid #fecaca;
          padding: 6px 10px;
          font-size: 12px;
        }
        .aa-btn.danger:hover:not(:disabled) { background: #fef2f2; }
        .aa-topic-form {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 18px;
        }
        .aa-table-wrap {
          overflow-x: auto;
          border: 1px solid #e2e8f0;
          border-radius: 12px;
        }
        .aa-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 13px;
        }
        .aa-table th {
          text-align: left;
          background: #f8fafc;
          color: #475569;
          font-weight: 700;
          padding: 12px 14px;
          border-bottom: 1px solid #e2e8f0;
        }
        .aa-table td {
          padding: 12px 14px;
          border-top: 1px solid #f1f5f9;
          vertical-align: top;
          color: #334155;
        }
        .aa-empty {
          padding: 28px 16px;
          text-align: center;
          color: #64748b;
          font-size: 14px;
        }
        @media (max-width: 768px) {
          .aa-page { padding: 16px; }
          .aa-card { padding: 16px; }
          .aa-fields,
          .aa-topic-form { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="aa-page">
        <div className="aa-inner">
          <Link href="/admin/blog" className="aa-back">
            ← Back to blog
          </Link>
          <h1 className="aa-title">Agent Automations</h1>
          <p className="aa-subtitle">
            Set schedule, sample email, and topics. Cron follows what you save here.
          </p>

          {isReadOnly("blog") && <ReadOnlyBanner moduleKey="blog" />}
          {error && <div className="aa-alert err">{error}</div>}
          {success && <div className="aa-alert ok">{success}</div>}

          <div className="aa-grid">
            <section className="aa-card">
              <div className="aa-card-head">
                <div>
                  <h2>Automation Settings</h2>
                  <p>{statusText}</p>
                </div>
                <span
                  className={`aa-badge ${settings.enabled ? "ok" : "warn"}`}
                >
                  {settings.enabled ? "Enabled" : "Disabled"}
                </span>
              </div>

              {loading ? (
                <p style={{ color: "#64748b" }}>Loading…</p>
              ) : (
                <>
                  <label className="aa-toggle">
                    <input
                      type="checkbox"
                      checked={settings.enabled}
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          enabled: e.target.checked,
                        }))
                      }
                      disabled={!canEditBlog}
                    />
                    Enable automation
                  </label>

                  <div className="aa-fields">
                    <label className="aa-field">
                      Start window
                      <input
                        className="aa-input"
                        type="datetime-local"
                        value={settings.window_start}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            window_start: e.target.value,
                          }))
                        }
                        disabled={!canEditBlog}
                      />
                    </label>
                    <label className="aa-field">
                      End window
                      <input
                        className="aa-input"
                        type="datetime-local"
                        value={settings.window_end}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            window_end: e.target.value,
                          }))
                        }
                        disabled={!canEditBlog}
                      />
                    </label>
                    <label className="aa-field">
                      Run time
                      <input
                        className="aa-input"
                        type="time"
                        value={settings.run_time}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            run_time: e.target.value,
                          }))
                        }
                        disabled={!canEditBlog}
                      />
                    </label>
                    <label className="aa-field">
                      Posts per run
                      <input
                        className="aa-input"
                        type="number"
                        min="1"
                        max="10"
                        value={settings.posts_per_run}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            posts_per_run: Number(e.target.value || 1),
                          }))
                        }
                        disabled={!canEditBlog}
                      />
                    </label>
                    <div className="aa-field full">
                      <span>Run days</span>
                      <div className="aa-days">
                        {DAYS.map((d) => (
                          <button
                            key={d.id}
                            type="button"
                            className={`aa-day ${settings.run_days.includes(d.id) ? "on" : ""}`}
                            onClick={() => toggleDay(d.id)}
                            disabled={!canEditBlog}
                          >
                            {d.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <label className="aa-field full">
                      Mode
                      <select
                        className="aa-select"
                        value={settings.mode}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            mode: e.target.value,
                          }))
                        }
                        disabled={!canEditBlog}
                      >
                        <option value="draft_only">Draft only</option>
                        <option value="pending_email">
                          Pending + email sample
                        </option>
                        <option value="auto_publish">
                          Auto publish + email sample
                        </option>
                      </select>
                    </label>
                  </div>

                  <div className="aa-email-box">
                    <h3>Sample blog email</h3>
                    <p className="hint">
                      When a blog is generated, the preview sample is sent here.
                      Use commas for multiple addresses.
                    </p>
                    <label className="aa-field">
                      Email address(es)
                      <input
                        className="aa-input"
                        type="text"
                        value={settings.approval_emails}
                        onChange={(e) =>
                          setSettings((prev) => ({
                            ...prev,
                            approval_emails: e.target.value,
                          }))
                        }
                        disabled={!canEditBlog}
                        placeholder="you@tech2globe.com, editor@tech2globe.com"
                      />
                    </label>
                    {settings.mode === "draft_only" && (
                      <p className="hint" style={{ marginTop: 8, marginBottom: 0 }}>
                        Draft-only mode does not send emails.
                      </p>
                    )}
                    <div className="aa-actions" style={{ marginTop: 12 }}>
                      <button
                        type="button"
                        className="aa-btn secondary"
                        onClick={testEmail}
                        disabled={!canEditBlog || testingEmail}
                      >
                        {testingEmail ? "Sending…" : "Send test email"}
                      </button>
                      {user?.email &&
                        !settings.approval_emails.includes(user.email) && (
                          <button
                            type="button"
                            className="aa-btn secondary"
                            disabled={!canEditBlog}
                            onClick={() =>
                              setSettings((prev) => ({
                                ...prev,
                                approval_emails: prev.approval_emails
                                  ? `${prev.approval_emails}, ${user.email}`
                                  : user.email,
                              }))
                            }
                          >
                            Use my email
                          </button>
                        )}
                    </div>
                  </div>

                  <div className="aa-actions">
                    <button
                      type="button"
                      className="aa-btn primary"
                      onClick={saveSettings}
                      disabled={!canEditBlog || saving}
                    >
                      {saving ? "Saving…" : "Save Settings"}
                    </button>
                    <button
                      type="button"
                      className="aa-btn secondary"
                      onClick={runNow}
                      disabled={!canEditBlog || runningNow}
                    >
                      {runningNow ? "Running…" : "Run Now"}
                    </button>
                  </div>
                </>
              )}
            </section>

            <section className="aa-card">
              <div className="aa-card-head">
                <div>
                  <h2>Topic Queue</h2>
                  <p>Add topics for the agent to write when the schedule runs.</p>
                </div>
                <span className="aa-badge info">{topics.length} topics</span>
              </div>

              <form className="aa-topic-form" onSubmit={addTopic}>
                <label className="aa-field full">
                  Topic
                  <input
                    className="aa-input"
                    placeholder="e.g. Amazon PPC best practices 2026"
                    value={topicForm.topic}
                    onChange={(e) =>
                      setTopicForm((p) => ({ ...p, topic: e.target.value }))
                    }
                    disabled={!canEditBlog}
                    required
                  />
                </label>
                <label className="aa-field">
                  Author
                  <input
                    className="aa-input"
                    value={topicForm.author_name}
                    onChange={(e) =>
                      setTopicForm((p) => ({
                        ...p,
                        author_name: e.target.value,
                      }))
                    }
                    disabled={!canEditBlog}
                  />
                </label>
                <label className="aa-field">
                  Tags
                  <input
                    className="aa-input"
                    placeholder="amazon, ppc, seo"
                    value={topicForm.tags}
                    onChange={(e) =>
                      setTopicForm((p) => ({ ...p, tags: e.target.value }))
                    }
                    disabled={!canEditBlog}
                  />
                </label>
                <label className="aa-field full">
                  Notes / instructions
                  <textarea
                    className="aa-textarea"
                    placeholder="Optional writing instructions"
                    value={topicForm.notes}
                    onChange={(e) =>
                      setTopicForm((p) => ({ ...p, notes: e.target.value }))
                    }
                    disabled={!canEditBlog}
                  />
                </label>
                <label className="aa-field">
                  Priority
                  <input
                    className="aa-input"
                    type="number"
                    value={topicForm.priority}
                    onChange={(e) =>
                      setTopicForm((p) => ({
                        ...p,
                        priority: Number(e.target.value || 0),
                      }))
                    }
                    disabled={!canEditBlog}
                  />
                </label>
                <label className="aa-field">
                  Schedule for (optional)
                  <input
                    className="aa-input"
                    type="datetime-local"
                    value={topicForm.scheduled_for}
                    onChange={(e) =>
                      setTopicForm((p) => ({
                        ...p,
                        scheduled_for: e.target.value,
                      }))
                    }
                    disabled={!canEditBlog}
                  />
                </label>
                <div className="aa-field full">
                  <button
                    type="submit"
                    className="aa-btn primary"
                    disabled={!canEditBlog}
                  >
                    Add Topic
                  </button>
                </div>
              </form>

              <div className="aa-table-wrap">
                <table className="aa-table">
                  <thead>
                    <tr>
                      <th>Topic</th>
                      <th>Status</th>
                      <th>Priority</th>
                      <th>Scheduled</th>
                      <th>Result</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topics.map((t) => (
                      <tr key={t.id}>
                        <td>
                          <strong>{t.topic}</strong>
                          {t.author_name ? (
                            <div style={{ color: "#64748b", marginTop: 2 }}>
                              {t.author_name}
                            </div>
                          ) : null}
                        </td>
                        <td>
                          <span className={statusBadgeClass(t.status)}>
                            {t.status}
                          </span>
                        </td>
                        <td>{t.priority}</td>
                        <td>
                          {t.scheduled_for
                            ? new Date(t.scheduled_for).toLocaleString()
                            : "—"}
                        </td>
                        <td>
                          {t.generated_post_id
                            ? `Post #${t.generated_post_id}${
                                t.generated_slug ? ` · ${t.generated_slug}` : ""
                              }`
                            : t.error_message || "—"}
                        </td>
                        <td>
                          <button
                            type="button"
                            className="aa-btn danger"
                            onClick={() => removeTopic(t.id)}
                            disabled={!canEditBlog}
                          >
                            Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                    {!topics.length && !loading && (
                      <tr>
                        <td colSpan="6">
                          <div className="aa-empty">
                            No topics yet. Add a topic above, then enable
                            automation and save.
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      </div>
    </>
  );
}
