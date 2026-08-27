"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import * as api from "../services/careerApprovalService";

const DEFAULTS = {
  enabled: true,
  require_hr_approval: true,
  approval_emails: "",
  reminder_hours: 24,
  max_reminders: 2,
  expiry_hours: 168,
};

export default function CareerJobApprovalsPage() {
  const { loading: authLoading, canView, canEdit, isReadOnly, user } = useAuth();
  const [settings, setSettings] = useState(DEFAULTS);
  const [recent, setRecent] = useState([]);
  const [publicApiConfigured, setPublicApiConfigured] = useState(false);
  const [publicApiBase, setPublicApiBase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const canEditCareer = canEdit("career") && !isReadOnly("career");

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await api.getApprovalDashboard();
      const s = data.settings || {};
      setSettings({
        enabled: s.enabled !== false,
        require_hr_approval: s.require_hr_approval !== false,
        approval_emails: Array.isArray(s.approval_emails)
          ? s.approval_emails.join(", ")
          : user?.email || "",
        reminder_hours: Number(s.reminder_hours) || 24,
        max_reminders: Number(s.max_reminders) || 2,
        expiry_hours: Number(s.expiry_hours) || 168,
      });
      setRecent(data.recent || []);
      setPublicApiConfigured(Boolean(data.publicApiConfigured));
      setPublicApiBase(data.publicApiBase || null);
    } catch (err) {
      setError(err.message || "Failed to load approval settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && canView("career")) load();
  }, [authLoading, user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canEditCareer) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      await api.saveApprovalSettings({
        ...settings,
        approval_emails: settings.approval_emails,
      });
      setSuccess("Saved. Career Agent will email HR for Yes/No publish decisions.");
      await load();
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!canEditCareer) return;
    setTesting(true);
    setError("");
    setSuccess("");
    try {
      const result = await api.sendTestApprovalEmail(settings.approval_emails);
      setSuccess(
        `Test email sent to ${result.recipients?.join(", ") || "HR"}. ${result.note || ""}`,
      );
    } catch (err) {
      setError(err.message || "Test email failed");
    } finally {
      setTesting(false);
    }
  };

  const handleResend = async (jobId) => {
    if (!canEditCareer) return;
    setError("");
    setSuccess("");
    try {
      const result = await api.resendJobApproval(jobId);
      setSuccess(
        result.skipped
          ? `Skipped: ${result.reason}`
          : `Resent approval for job #${jobId} → ${result.recipients?.join(", ")}`,
      );
      await load();
    } catch (err) {
      setError(err.message || "Resend failed");
    }
  };

  if (authLoading || loading) {
    return <div className="ca-wrap">Loading…</div>;
  }

  return (
    <>
      <style>{`
        .ca-wrap{max-width:980px;margin:0 auto;padding:20px 16px 48px;font-family:'Segoe UI',system-ui,sans-serif;color:#0f172a}
        .ca-head h1{margin:0 0 6px;font-size:28px;font-weight:800}
        .ca-head p{margin:0;color:#64748b;line-height:1.5;max-width:720px}
        .ca-alert{margin:16px 0;padding:12px 14px;border-radius:10px;font-size:14px}
        .ca-alert.err{background:#fef2f2;color:#991b1b;border:1px solid #fecaca}
        .ca-alert.ok{background:#f0fdf4;color:#166534;border:1px solid #bbf7d0}
        .ca-grid{display:grid;grid-template-columns:1.2fr 1fr;gap:16px;margin-top:18px}
        @media (max-width:900px){.ca-grid{grid-template-columns:1fr}}
        .ca-card{background:#fff;border:1px solid #e2e8f0;border-radius:14px;padding:18px 18px 20px;box-shadow:0 1px 2px rgba(15,23,42,.04)}
        .ca-card h2{margin:0 0 8px;font-size:18px}
        .ca-card .sub{margin:0 0 16px;color:#64748b;font-size:13px;line-height:1.5}
        .ca-field{margin-bottom:14px}
        .ca-field label{display:block;font-size:13px;font-weight:700;margin-bottom:6px}
        .ca-field input[type=text],.ca-field input[type=number],.ca-field textarea{
          width:100%;box-sizing:border-box;padding:10px 12px;border:1px solid #cbd5e1;border-radius:10px;font-size:14px
        }
        .ca-field small{display:block;margin-top:5px;color:#64748b;font-size:12px}
        .ca-check{display:flex;align-items:flex-start;gap:10px;margin:10px 0;font-size:14px}
        .ca-btn{border:1px solid #cbd5e1;background:#fff;border-radius:10px;padding:10px 14px;font-weight:700;cursor:pointer;font-size:13px}
        .ca-btn.primary{background:#1d4ed8;border-color:#1d4ed8;color:#fff}
        .ca-btn:disabled{opacity:.6;cursor:not-allowed}
        .ca-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:8px}
        .ca-badge{display:inline-block;padding:3px 8px;border-radius:999px;font-size:11px;font-weight:700;text-transform:uppercase}
        .ca-badge.pending{background:#fff7ed;color:#c2410c}
        .ca-badge.approved{background:#f0fdf4;color:#15803d}
        .ca-badge.rejected,.ca-badge.expired{background:#fef2f2;color:#b91c1c}
        .ca-table{width:100%;border-collapse:collapse;font-size:13px}
        .ca-table th,.ca-table td{padding:10px 8px;border-bottom:1px solid #e2e8f0;text-align:left;vertical-align:top}
        .ca-table th{color:#64748b;font-size:11px;text-transform:uppercase;letter-spacing:.04em}
        .ca-warn{background:#fffbeb;border:1px solid #fde68a;color:#92400e;padding:10px 12px;border-radius:10px;font-size:13px;margin-bottom:14px}
        .ca-flow{font-size:13px;line-height:1.6;color:#334155;margin:0;padding-left:18px}
      `}</style>

      <div className="ca-wrap">
        <div className="ca-head">
          <p style={{ marginBottom: 8 }}>
            <Link href="/admin/career/agent" style={{ color: "#1d4ed8", fontWeight: 700 }}>
              ← Career Agent
            </Link>
          </p>
          <h1>Job Approvals</h1>
          <p>
            Assistant flow: AI drafts a job → emails HR “Do you want to publish?” →
            <strong> Yes</strong> publishes, <strong>No</strong> rejects,{" "}
            <strong>no reply</strong> gets reminders then expires.
          </p>
        </div>

        {error && <div className="ca-alert err">{error}</div>}
        {success && <div className="ca-alert ok">{success}</div>}

        {!publicApiConfigured && (
          <div className="ca-warn">
            Set <code>BACKEND_PUBLIC_URL</code> on the API server (public backend URL,
            e.g. https://api.yourdomain.com) so Approve/Reject links in emails work.
            {publicApiBase ? ` Current: ${publicApiBase}` : ""}
          </div>
        )}

        <div className="ca-grid">
          <section className="ca-card">
            <h2>HR email settings</h2>
            <p className="sub">
              Nodemailer sends the ask. Secure signed links record Yes/No — no inbox
              parsing required for decisions.
            </p>

            <form onSubmit={handleSave}>
              <label className="ca-check">
                <input
                  type="checkbox"
                  checked={settings.enabled}
                  disabled={!canEditCareer}
                  onChange={(e) =>
                    setSettings((p) => ({ ...p, enabled: e.target.checked }))
                  }
                />
                <span>Enable approval system</span>
              </label>

              <label className="ca-check">
                <input
                  type="checkbox"
                  checked={settings.require_hr_approval}
                  disabled={!canEditCareer}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      require_hr_approval: e.target.checked,
                    }))
                  }
                />
                <span>
                  Require HR Yes/No before publish (Career Agent creates{" "}
                  <code>pending_approval</code>)
                </span>
              </label>

              <div className="ca-field">
                <label>HR approval emails</label>
                <textarea
                  rows={3}
                  disabled={!canEditCareer}
                  value={settings.approval_emails}
                  onChange={(e) =>
                    setSettings((p) => ({ ...p, approval_emails: e.target.value }))
                  }
                  placeholder="hr@tech2globe.com, manager@tech2globe.com"
                />
                <small>Comma-separated. Falls back to OWNER_EMAILS if empty.</small>
              </div>

              <div className="ca-field">
                <label>Reminder after (hours)</label>
                <input
                  type="number"
                  min={1}
                  disabled={!canEditCareer}
                  value={settings.reminder_hours}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      reminder_hours: Number(e.target.value) || 24,
                    }))
                  }
                />
              </div>

              <div className="ca-field">
                <label>Max reminders</label>
                <input
                  type="number"
                  min={0}
                  disabled={!canEditCareer}
                  value={settings.max_reminders}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      max_reminders: Number(e.target.value) || 0,
                    }))
                  }
                />
              </div>

              <div className="ca-field">
                <label>Link expiry (hours)</label>
                <input
                  type="number"
                  min={1}
                  disabled={!canEditCareer}
                  value={settings.expiry_hours}
                  onChange={(e) =>
                    setSettings((p) => ({
                      ...p,
                      expiry_hours: Number(e.target.value) || 168,
                    }))
                  }
                />
                <small>Default 168 = 7 days. After expiry, pending jobs become rejected.</small>
              </div>

              <div className="ca-actions">
                <button
                  type="submit"
                  className="ca-btn primary"
                  disabled={!canEditCareer || saving}
                >
                  {saving ? "Saving…" : "Save settings"}
                </button>
                <button
                  type="button"
                  className="ca-btn"
                  disabled={!canEditCareer || testing}
                  onClick={handleTest}
                >
                  {testing ? "Sending…" : "Send test email"}
                </button>
              </div>
            </form>
          </section>

          <section className="ca-card">
            <h2>How the assistant behaves</h2>
            <ol className="ca-flow">
              <li>Career Agent drafts the job from chat.</li>
              <li>Job saved as <strong>pending_approval</strong> (not public).</li>
              <li>HR gets a polished email: job summary + <strong>Yes — Publish</strong> / <strong>No</strong>.</li>
              <li>
                <strong>Yes</strong> → status <code>active</code> (live on careers page) + confirmation email.
              </li>
              <li>
                <strong>No</strong> → status <code>rejected</code> + confirmation email.
              </li>
              <li>
                <strong>No reply</strong> → reminder emails, then expiry.
              </li>
            </ol>
            <p className="sub" style={{ marginTop: 16 }}>
              Configure AI keys in{" "}
              <Link href="/admin/connect/ai" style={{ color: "#1d4ed8" }}>
                Connect → AI Integrations
              </Link>
              . SMTP uses existing server mail settings.
            </p>
          </section>
        </div>

        <section className="ca-card" style={{ marginTop: 16 }}>
          <h2>Recent approval requests</h2>
          <p className="sub">Track pending / approved / rejected decisions from email links.</p>
          {recent.length === 0 ? (
            <p className="sub">No approval requests yet. Create a job via Career Agent.</p>
          ) : (
            <table className="ca-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Decision</th>
                  <th>HR</th>
                  <th>Reminders</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {recent.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <strong>#{row.job_id}</strong> {row.title}
                      <div style={{ color: "#64748b", fontSize: 12 }}>
                        job status: {row.job_status}
                      </div>
                    </td>
                    <td>
                      <span className={`ca-badge ${row.decision}`}>{row.decision}</span>
                    </td>
                    <td style={{ fontSize: 12 }}>
                      {(row.hr_emails || []).join(", ") || "—"}
                    </td>
                    <td>{row.reminder_count || 0}</td>
                    <td>
                      {row.decision === "pending" && canEditCareer && (
                        <button
                          type="button"
                          className="ca-btn"
                          onClick={() => handleResend(row.job_id)}
                        >
                          Resend
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </section>
      </div>
    </>
  );
}
