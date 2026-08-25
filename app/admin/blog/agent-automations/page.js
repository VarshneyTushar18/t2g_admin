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
        approval_emails: Array.isArray(s.approval_emails) && s.approval_emails.length
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
    if (!settings.enabled) return "Disabled";
    const days = DAYS.filter((d) => settings.run_days.includes(d.id))
      .map((d) => d.label)
      .join(", ");
    return `Runs at ${settings.run_time} on ${days || "selected days"}`;
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
      setSuccess("Settings saved. Blog samples will go to: " + emails.join(", "));
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
    try {
      await api.runNow();
      await load();
    } catch (err) {
      setError(err.message || "Run now failed");
    } finally {
      setRunningNow(false);
    }
  };

  if (authLoading || !canView("blog")) {
    return <div style={{ padding: 24 }}>Loading...</div>;
  }

  return (
    <div style={{ minHeight: "100vh", background: "#f0f2f5", padding: 20 }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <Link href="/admin/blog" style={{ color: "#4f46e5", fontWeight: 600 }}>
          ← Back to blog
        </Link>
        <h1 style={{ marginTop: 12 }}>Agent Automations</h1>
        <p style={{ marginTop: 4, color: "#64748b" }}>
          Configure blog automation schedule, run window, and topic queue from admin.
        </p>

        {isReadOnly("blog") && <ReadOnlyBanner moduleKey="blog" />}
        {error && (
          <div style={{ background: "#fef2f2", color: "#b91c1c", padding: 10, borderRadius: 8, marginTop: 12 }}>
            {error}
          </div>
        )}
        {success && (
          <div style={{ background: "#ecfdf5", color: "#166534", padding: 10, borderRadius: 8, marginTop: 12 }}>
            {success}
          </div>
        )}

        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, marginTop: 16 }}>
          <section style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
            <h3>Automation Settings</h3>
            <p style={{ color: "#64748b", marginTop: 4 }}>{statusText}</p>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <>
                <label style={{ display: "flex", gap: 8, alignItems: "center", marginTop: 10 }}>
                  <input
                    type="checkbox"
                    checked={settings.enabled}
                    onChange={(e) =>
                      setSettings((prev) => ({ ...prev, enabled: e.target.checked }))
                    }
                    disabled={!canEditBlog}
                  />
                  Enable automation
                </label>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(180px, 1fr))", gap: 12, marginTop: 12 }}>
                  <label>
                    Start window
                    <input
                      type="datetime-local"
                      value={settings.window_start}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, window_start: e.target.value }))
                      }
                      disabled={!canEditBlog}
                      style={{ width: "100%" }}
                    />
                  </label>
                  <label>
                    End window
                    <input
                      type="datetime-local"
                      value={settings.window_end}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, window_end: e.target.value }))
                      }
                      disabled={!canEditBlog}
                      style={{ width: "100%" }}
                    />
                  </label>
                  <label>
                    Run time
                    <input
                      type="time"
                      value={settings.run_time}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, run_time: e.target.value }))
                      }
                      disabled={!canEditBlog}
                      style={{ width: "100%" }}
                    />
                  </label>
                  <label>
                    Posts per run
                    <input
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
                      style={{ width: "100%" }}
                    />
                  </label>
                </div>

                <div style={{ marginTop: 12 }}>
                  <p style={{ marginBottom: 6, fontWeight: 600 }}>Run days</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    {DAYS.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleDay(d.id)}
                        disabled={!canEditBlog}
                        style={{
                          border: "1px solid #cbd5e1",
                          background: settings.run_days.includes(d.id) ? "#dbeafe" : "#fff",
                          borderRadius: 999,
                          padding: "4px 10px",
                          cursor: "pointer",
                        }}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginTop: 12 }}>
                  <label>
                    Mode
                    <select
                      value={settings.mode}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, mode: e.target.value }))
                      }
                      disabled={!canEditBlog}
                      style={{ width: "100%" }}
                    >
                      <option value="draft_only">Draft only</option>
                      <option value="pending_email">Pending + email sample</option>
                      <option value="auto_publish">Auto publish + email sample</option>
                    </select>
                  </label>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    padding: 14,
                    background: "#f0f9ff",
                    border: "1px solid #bae6fd",
                    borderRadius: 10,
                  }}
                >
                  <p style={{ margin: 0, fontWeight: 700, color: "#0c4a6e" }}>
                    Sample blog email
                  </p>
                  <p style={{ margin: "6px 0 10px", fontSize: 13, color: "#0369a1" }}>
                    When automation generates a blog, the sample preview is sent to this email.
                    Add multiple emails separated by comma.
                  </p>
                  <label>
                    Email address(es)
                    <input
                      type="text"
                      value={settings.approval_emails}
                      onChange={(e) =>
                        setSettings((prev) => ({ ...prev, approval_emails: e.target.value }))
                      }
                      disabled={!canEditBlog}
                      placeholder="you@tech2globe.com, editor@tech2globe.com"
                      style={{ width: "100%", marginTop: 4, padding: "10px 12px" }}
                    />
                  </label>
                  {settings.mode === "draft_only" && (
                    <p style={{ margin: "8px 0 0", fontSize: 12, color: "#64748b" }}>
                      Draft-only mode does not send emails. Switch mode to enable sample emails.
                    </p>
                  )}
                  <div style={{ marginTop: 10, display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button
                      type="button"
                      onClick={testEmail}
                      disabled={!canEditBlog || testingEmail}
                    >
                      {testingEmail ? "Sending test..." : "Send test email"}
                    </button>
                    {user?.email && !settings.approval_emails.includes(user.email) && (
                      <button
                        type="button"
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
                        Use my email ({user.email})
                      </button>
                    )}
                  </div>
                </div>

                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <button onClick={saveSettings} disabled={!canEditBlog || saving}>
                    {saving ? "Saving..." : "Save Settings"}
                  </button>
                  <button onClick={runNow} disabled={!canEditBlog || runningNow}>
                    {runningNow ? "Running..." : "Run Now"}
                  </button>
                </div>
              </>
            )}
          </section>

          <section style={{ background: "#fff", borderRadius: 12, padding: 16 }}>
            <h3>Topic Queue</h3>
            <form onSubmit={addTopic} style={{ display: "grid", gap: 8, marginTop: 10 }}>
              <input
                placeholder="Topic (required)"
                value={topicForm.topic}
                onChange={(e) => setTopicForm((p) => ({ ...p, topic: e.target.value }))}
                disabled={!canEditBlog}
              />
              <input
                placeholder="Author name"
                value={topicForm.author_name}
                onChange={(e) => setTopicForm((p) => ({ ...p, author_name: e.target.value }))}
                disabled={!canEditBlog}
              />
              <textarea
                placeholder="Notes/instructions"
                value={topicForm.notes}
                onChange={(e) => setTopicForm((p) => ({ ...p, notes: e.target.value }))}
                disabled={!canEditBlog}
              />
              <input
                placeholder="Tags (comma separated)"
                value={topicForm.tags}
                onChange={(e) => setTopicForm((p) => ({ ...p, tags: e.target.value }))}
                disabled={!canEditBlog}
              />
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <input
                  type="number"
                  placeholder="Priority"
                  value={topicForm.priority}
                  onChange={(e) =>
                    setTopicForm((p) => ({ ...p, priority: Number(e.target.value || 0) }))
                  }
                  disabled={!canEditBlog}
                />
                <input
                  type="datetime-local"
                  value={topicForm.scheduled_for}
                  onChange={(e) =>
                    setTopicForm((p) => ({ ...p, scheduled_for: e.target.value }))
                  }
                  disabled={!canEditBlog}
                />
              </div>
              <button type="submit" disabled={!canEditBlog}>
                Add Topic
              </button>
            </form>

            <div style={{ marginTop: 14, overflowX: "auto" }}>
              <table width="100%" cellPadding="8" style={{ borderCollapse: "collapse" }}>
                <thead>
                  <tr style={{ background: "#f8fafc" }}>
                    <th align="left">Topic</th>
                    <th align="left">Status</th>
                    <th align="left">Priority</th>
                    <th align="left">Scheduled</th>
                    <th align="left">Result</th>
                    <th align="left">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {topics.map((t) => (
                    <tr key={t.id} style={{ borderTop: "1px solid #e2e8f0" }}>
                      <td>{t.topic}</td>
                      <td>{t.status}</td>
                      <td>{t.priority}</td>
                      <td>{t.scheduled_for ? new Date(t.scheduled_for).toLocaleString() : "-"}</td>
                      <td>
                        {t.generated_post_id
                          ? `Post #${t.generated_post_id}${t.generated_slug ? ` (${t.generated_slug})` : ""}`
                          : t.error_message || "-"}
                      </td>
                      <td>
                        <button
                          type="button"
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
                      <td colSpan="6" style={{ color: "#64748b" }}>
                        No topics yet. Add topics and enable automation.
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
  );
}
