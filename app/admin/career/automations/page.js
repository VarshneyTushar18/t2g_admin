"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import * as api from "../services/careerAutomationsService";

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
  enabled: true,
  schedule_enabled: false,
  schedule_frequency: "days",
  schedule_every_n: 7,
  schedule_weekday: 1,
  schedule_time_local: "10:00",
  schedule_gate_expiry_hours: 72,
  schedule_agent_prompt: "",
  schedule_run_days: [1],
  schedule_mode: "publish_email",
  approval_emails: "",
};

const MODES = [
  {
    id: "publish_email",
    title: "Publish approval email (recommended)",
    desc: "On schedule: AI drafts the job, then HR gets the full email — job description, Yes — Publish / No, and live jobs list (same as Career Agent).",
  },
  {
    id: "ask_before_draft",
    title: "Ask before drafting (two-step)",
    desc: "First a short check-in email; only if HR clicks Yes does AI draft and send the full publish email.",
  },
];

export default function CareerAutomationsPage() {
  const { loading: authLoading, canView, canEdit, isReadOnly } = useAuth();
  const [settings, setSettings] = useState(DEFAULTS);
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [running, setRunning] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [topicForm, setTopicForm] = useState({ title_hint: "", notes: "", priority: 0 });

  const canEditCareer = canEdit("career") && !isReadOnly("career");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getDashboard();
      const s = data.settings || {};
      setSettings({
        enabled: s.enabled !== false,
        schedule_enabled: Boolean(s.schedule_enabled),
        schedule_frequency: s.schedule_frequency || "days",
        schedule_every_n: Number(s.schedule_every_n) || 7,
        schedule_weekday: Number(s.schedule_weekday) || 1,
        schedule_time_local: s.schedule_time_local || "10:00",
        schedule_gate_expiry_hours: Number(s.schedule_gate_expiry_hours) || 72,
        schedule_agent_prompt: s.schedule_agent_prompt || "",
        schedule_run_days: Array.isArray(s.schedule_run_days) ? s.schedule_run_days : [1],
        schedule_mode: s.schedule_mode === "ask_before_draft" ? "ask_before_draft" : "publish_email",
        approval_emails: Array.isArray(s.approval_emails)
          ? s.approval_emails.join(", ")
          : "",
      });
      setTopics(data.topics || []);
    } catch (err) {
      setError(err.message || "Failed to load");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && canView("career")) load();
  }, [authLoading]);

  const toggleDay = (id) => {
    setSettings((p) => {
      const set = new Set(p.schedule_run_days || []);
      if (set.has(id)) set.delete(id);
      else set.add(id);
      return { ...p, schedule_run_days: [...set].sort((a, b) => a - b) };
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canEditCareer) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.saveSettings({
        ...settings,
        approval_emails: settings.approval_emails,
      });
      setSuccess("Automation schedule saved. Cron runs every ~15 minutes.");
      await load();
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleRunNow = async () => {
    if (!canEditCareer) return;
    setRunning(true);
    setError("");
    setSuccess("");
    try {
      const r = await api.runNow();
      if (r.error) {
        setError(r.error);
      } else {
        setSuccess(
          r.sent
            ? r.message ||
                `Done (${r.recipients?.join(", ") || "check Job Approvals HR inbox"}).`
            : `Skipped: ${r.reason || "unknown"}`,
        );
      }
    } catch (err) {
      setError(err.message || "Run failed");
    } finally {
      setRunning(false);
    }
  };

  const handleTest = async () => {
    if (!canEditCareer) return;
    setTesting(true);
    setError("");
    setSuccess("");
    try {
      const r = await api.sendTestScheduleEmail();
      setSuccess(
        r.note ||
          `Test sent to ${r.recipients?.join(", ") || "HR"} (${r.mode === "publish_email" ? "full publish email" : "check-in email"}). Check inbox and spam.`,
      );
    } catch (err) {
      setError(err.message || "Test failed");
    } finally {
      setTesting(false);
    }
  };

  const addTopic = async (e) => {
    e.preventDefault();
    if (!canEditCareer || !topicForm.title_hint.trim()) return;
    try {
      await api.createTopic(topicForm);
      setTopicForm({ title_hint: "", notes: "", priority: 0 });
      await load();
      setSuccess("Role queued for next automated draft (when HR clicks Yes).");
    } catch (err) {
      setError(err.message || "Could not add role");
    }
  };

  if (authLoading || loading) {
    return <div className="ca-wrap">Loading…</div>;
  }

  return (
    <>
      <style>{`
        .ca-wrap{max-width:980px;margin:0 auto;padding:20px 16px 48px;font-family:'Segoe UI',system-ui,sans-serif;color:#0f172a}
        .ca-grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-top:18px}
        @media (max-width:900px){.ca-grid{grid-template-columns:1fr}}
        .ca-card{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:18px;box-shadow:0 1px 2px rgba(15,23,42,.04)}
        .ca-card h2{margin:0 0 8px;font-size:18px}
        .ca-sub{margin:0 0 14px;color:#64748b;font-size:13px;line-height:1.5}
        .ca-field{margin-bottom:14px}
        .ca-field label{display:block;font-size:13px;font-weight:700;margin-bottom:6px}
        .ca-field input,.ca-field select,.ca-field textarea{width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #cbd5e1;border-radius:10px;font-size:14px}
        .ca-check{display:flex;align-items:flex-start;gap:10px;margin:10px 0;font-size:14px}
        .ca-btn{border:1px solid #cbd5e1;background:#fff;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer;font-size:13px;margin-right:8px;margin-top:8px}
        .ca-btn.primary{background:#1d4ed8;border-color:#1d4ed8;color:#fff}
        .ca-days{display:flex;flex-wrap:wrap;gap:8px}
        .ca-day{padding:6px 10px;border-radius:8px;border:1px solid #cbd5e1;cursor:pointer;font-size:12px;font-weight:700}
        .ca-day.on{background:#1d4ed8;color:#fff;border-color:#1d4ed8}
        .ca-alert{margin:12px 0;padding:12px;border-radius:10px;font-size:14px}
        .ca-alert.err{background:#fef2f2;color:#991b1b}
        .ca-alert.ok{background:#f0fdf4;color:#166534}
        .ca-flow{margin:0;padding-left:18px;font-size:13px;line-height:1.6;color:#334155}
      `}</style>

      <div className="ca-wrap">
        <h1 style={{ margin: "0 0 6px", fontSize: 28, fontWeight: 800 }}>Career Automations</h1>
        <p className="ca-sub">
          Two ways to start hiring posts: <strong>Career Agent</strong> (chat) or{" "}
          <strong>cron</strong> (this page). Both end with the same HR publish email (JD + Yes/No +
          live jobs list).
        </p>

        {error && <div className="ca-alert err">{error}</div>}
        {success && <div className="ca-alert ok">{success}</div>}

        <div className="ca-grid">
          <section className="ca-card">
            <h2>1 — Career Agent (manual)</h2>
            <ol className="ca-flow">
              <li>Open chat and paste a JD.</li>
              <li>Agent creates <code>pending_approval</code> and emails HR immediately.</li>
            </ol>
            <Link href="/admin/career/agent" className="ca-btn primary" style={{ display: "inline-block", textDecoration: "none" }}>
              Open Career Agent
            </Link>
          </section>

          <section className="ca-card">
            <h2>2 — Cron schedule (automatic)</h2>
            <ol className="ca-flow">
              <li>
                <strong>Default:</strong> AI drafts → HR gets full “Should we publish …?” email (JD + Yes/No + live jobs).
              </li>
              <li>Optional two-step mode: short check-in first, then full email only if HR says Yes.</li>
            </ol>
          </section>
        </div>

        <form onSubmit={handleSave} className="ca-card" style={{ marginTop: 16 }}>
          <h2>Cron settings</h2>
          <p className="ca-sub">
            Uses server cron every ~15 min (IST). HR emails also configured in{" "}
            <Link href="/admin/career/approvals">Job Approvals</Link>.
          </p>

          <label className="ca-check">
            <input
              type="checkbox"
              checked={settings.schedule_enabled}
              disabled={!canEditCareer}
              onChange={(e) =>
                setSettings((p) => ({ ...p, schedule_enabled: e.target.checked }))
              }
            />
            <span>Enable scheduled career automations (cron)</span>
          </label>

          <div className="ca-field">
            <label>Automation mode</label>
            {MODES.map((m) => (
              <label
                key={m.id}
                className="ca-check"
                style={{
                  border: settings.schedule_mode === m.id ? "2px solid #1d4ed8" : "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: 10,
                  marginBottom: 8,
                }}
              >
                <input
                  type="radio"
                  name="schedule_mode"
                  disabled={!canEditCareer}
                  checked={settings.schedule_mode === m.id}
                  onChange={() => setSettings((p) => ({ ...p, schedule_mode: m.id }))}
                />
                <span>
                  <strong>{m.title}</strong>
                  <br />
                  <span style={{ color: "#64748b", fontSize: 13 }}>{m.desc}</span>
                </span>
              </label>
            ))}
          </div>

          <div className="ca-field">
            <label>Run on days (IST, leave empty = any day)</label>
            <div className="ca-days">
              {DAYS.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  className={`ca-day ${(settings.schedule_run_days || []).includes(d.id) ? "on" : ""}`}
                  disabled={!canEditCareer}
                  onClick={() => toggleDay(d.id)}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <small style={{ color: "#64748b" }}>Tip: select Mon only for weekly Monday emails.</small>
          </div>

          <div className="ca-field">
            <label>Repeat</label>
            <select
              disabled={!canEditCareer}
              value={settings.schedule_frequency}
              onChange={(e) =>
                setSettings((p) => ({ ...p, schedule_frequency: e.target.value }))
              }
            >
              <option value="days">Every N days</option>
              <option value="weeks">Every N weeks</option>
              <option value="months">Every N months</option>
            </select>
          </div>

          <div className="ca-field">
            <label>Every N</label>
            <input
              type="number"
              min={1}
              disabled={!canEditCareer}
              value={settings.schedule_every_n}
              onChange={(e) =>
                setSettings((p) => ({
                  ...p,
                  schedule_every_n: Number(e.target.value) || 1,
                }))
              }
            />
            <small style={{ color: "#64748b" }}>e.g. 7 with “days” = at most once every 7 days.</small>
          </div>

          <div className="ca-field">
            <label>Send at (IST)</label>
            <input
              type="time"
              disabled={!canEditCareer}
              value={settings.schedule_time_local}
              onChange={(e) =>
                setSettings((p) => ({ ...p, schedule_time_local: e.target.value }))
              }
            />
          </div>

          <div className="ca-field">
            <label>Check-in link expiry (hours)</label>
            <input
              type="number"
              min={1}
              disabled={!canEditCareer}
              value={settings.schedule_gate_expiry_hours}
              onChange={(e) =>
                setSettings((p) => ({
                  ...p,
                  schedule_gate_expiry_hours: Number(e.target.value) || 72,
                }))
              }
            />
          </div>

          <div className="ca-field">
            <label>AI prompt when HR clicks Yes (optional)</label>
            <textarea
              rows={3}
              disabled={!canEditCareer}
              value={settings.schedule_agent_prompt}
              onChange={(e) =>
                setSettings((p) => ({ ...p, schedule_agent_prompt: e.target.value }))
              }
              placeholder="Default: draft one job from guidelines and email HR for approval."
            />
          </div>

          <button type="submit" className="ca-btn primary" disabled={!canEditCareer || saving}>
            {saving ? "Saving…" : "Save schedule"}
          </button>
          <button type="button" className="ca-btn" disabled={!canEditCareer || running} onClick={handleRunNow}>
            {running ? "Running…" : "Run AI draft now (live cron path)"}
          </button>
          <button type="button" className="ca-btn" disabled={!canEditCareer || testing} onClick={handleTest}>
            {testing ? "Sending…" : "Send test publish email (one email)"}
          </button>
          <p className="ca-sub" style={{ marginTop: 10 }}>
            <strong>Test publish email</strong> always sends the full HR template (like Job Approvals test).
            <strong> Run AI draft now</strong> uses OpenAI + Career Agent (needs AI keys and blog DB).
          </p>
        </form>

        <section className="ca-card" style={{ marginTop: 16 }}>
          <h2>Queued roles (optional)</h2>
          <p className="ca-sub">
            When HR clicks <strong>Yes</strong> on a check-in email, the next queued role is used as
            the draft focus (otherwise AI uses guidelines only).
          </p>
          <form onSubmit={addTopic} style={{ display: "flex", flexWrap: "wrap", gap: 10, marginBottom: 16 }}>
            <input
              placeholder="Role title hint e.g. PPC Specialist"
              value={topicForm.title_hint}
              disabled={!canEditCareer}
              onChange={(e) => setTopicForm((p) => ({ ...p, title_hint: e.target.value }))}
              style={{ flex: "1 1 200px", padding: 10, borderRadius: 10, border: "1px solid #cbd5e1" }}
            />
            <input
              placeholder="Notes (optional)"
              value={topicForm.notes}
              disabled={!canEditCareer}
              onChange={(e) => setTopicForm((p) => ({ ...p, notes: e.target.value }))}
              style={{ flex: "2 1 240px", padding: 10, borderRadius: 10, border: "1px solid #cbd5e1" }}
            />
            <button type="submit" className="ca-btn primary" disabled={!canEditCareer}>
              Add to queue
            </button>
          </form>
          {topics.length === 0 ? (
            <p className="ca-sub">No queued roles.</p>
          ) : (
            <ul style={{ margin: 0, paddingLeft: 18, fontSize: 14 }}>
              {topics.map((t) => (
                <li key={t.id} style={{ marginBottom: 8 }}>
                  <strong>{t.title_hint}</strong> — {t.status}
                  {canEditCareer && (
                    <button
                      type="button"
                      className="ca-btn"
                      style={{ marginLeft: 8, padding: "4px 8px" }}
                      onClick={() => api.deleteTopic(t.id).then(load)}
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>
    </>
  );
}
