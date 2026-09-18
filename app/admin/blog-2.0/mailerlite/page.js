"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import * as api from "../services/blog20Service";
import "../blog-2.0.css";

const EMPTY = {
  project_name: "Bright CRM",
  client_site_url:
    "https://preview.mailerlite.io/preview/2583138/sites/196949098888169226/",
  client_blog_url:
    "https://preview.mailerlite.io/preview/2583138/sites/196949098888169226/blog",
  website_mode: "mailerlite_manual",
  newsletter_mode: "full_html",
  mailerlite_enabled: true,
  mailerlite_api_key: "",
  mailerlite_from_email: "",
  mailerlite_from_name: "Bright CRM",
  mailerlite_group_id: "",
  approval_emails: "",
  teams_webhook_url: "",
  timezone: "Asia/Kolkata",
  automation_frequency: "weekly",
  automation_run_time: "12:00",
  newsletter_send_timing: "scheduled",
  newsletter_send_time: "12:00",
  notes: "",
};

export default function Blog20MailerLitePage() {
  const router = useRouter();
  const { loading: authLoading, canView, canEdit, isReadOnly } = useAuth();
  const [form, setForm] = useState(EMPTY);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [testGroups, setTestGroups] = useState([]);

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
    setError("");
    try {
      const s = await api.getSettings();
      setMeta(s);
      setForm({
        ...EMPTY,
        project_name: s.project_name || EMPTY.project_name,
        client_site_url: s.client_site_url || EMPTY.client_site_url,
        client_blog_url: s.client_blog_url || EMPTY.client_blog_url,
        website_mode: s.website_mode || EMPTY.website_mode,
        newsletter_mode: s.newsletter_mode || EMPTY.newsletter_mode,
        mailerlite_enabled: s.mailerlite_enabled !== false,
        mailerlite_from_email: s.mailerlite_from_email || "",
        mailerlite_from_name: s.mailerlite_from_name || EMPTY.mailerlite_from_name,
        mailerlite_group_id: s.mailerlite_group_id || "",
        approval_emails: (s.approval_emails || []).join(", "),
        teams_webhook_url: s.teams_webhook_url || "",
        timezone: s.timezone || EMPTY.timezone,
        automation_frequency: s.automation_frequency || EMPTY.automation_frequency,
        automation_run_time: s.automation_run_time || EMPTY.automation_run_time,
        newsletter_send_timing: s.newsletter_send_timing || EMPTY.newsletter_send_timing,
        newsletter_send_time: s.newsletter_send_time || EMPTY.newsletter_send_time,
        notes: s.notes || "",
      });
    } catch (err) {
      setError(err.message || "Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!canEditModule) return;
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        project_name: form.project_name,
        client_site_url: form.client_site_url,
        client_blog_url: form.client_blog_url,
        website_mode: form.website_mode,
        newsletter_mode: form.newsletter_mode,
        timezone: form.timezone,
        automation_frequency: form.automation_frequency,
        automation_run_days: [1],
        automation_run_time: form.automation_run_time,
        newsletter_send_timing: form.newsletter_send_timing,
        newsletter_send_time: form.newsletter_send_time,
        mailerlite_enabled: form.mailerlite_enabled,
        mailerlite_from_email: form.mailerlite_from_email,
        mailerlite_from_name: form.mailerlite_from_name,
        mailerlite_group_id: form.mailerlite_group_id,
        approval_emails: form.approval_emails,
        teams_webhook_url: form.teams_webhook_url,
        notes: form.notes,
      };
      if (form.mailerlite_api_key.trim()) {
        payload.mailerlite_api_key = form.mailerlite_api_key.trim();
      }
      const next = await api.saveSettings(payload);
      setMeta(next);
      setForm((prev) => ({ ...prev, mailerlite_api_key: "" }));
      setSuccess("Saved Blog-2.0 MailerLite settings.");
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    if (!canEditModule) return;
    setTesting(true);
    setError("");
    setSuccess("");
    setTestGroups([]);
    try {
      const res = await api.testMailerLite(
        form.mailerlite_api_key.trim()
          ? { mailerlite_api_key: form.mailerlite_api_key.trim() }
          : {},
      );
      setTestGroups(res.groups || []);
      setSuccess(
        `Connected. Found ${res.group_count ?? res.groups?.length ?? 0} group(s).`,
      );
    } catch (err) {
      setError(err.message || "Connection test failed");
    } finally {
      setTesting(false);
    }
  };

  if (authLoading || loading) {
    return <div className="b20-page"><p>Loading…</p></div>;
  }

  return (
    <div className="b20-page">
      <div className="b20-hero">
        <h1>MailerLite</h1>
        <p>Newsletter campaigns for Blog-2.0 — separate from the main Tech2Globe blog.</p>
      </div>

      {error && <div className="b20-alert err">{error}</div>}
      {success && <div className="b20-alert ok">{success}</div>}

      <form className="b20-card b20-form" onSubmit={handleSave}>
        <h2>Project</h2>
        <label>Project name</label>
        <input
          value={form.project_name}
          onChange={(e) => setForm({ ...form, project_name: e.target.value })}
          disabled={!canEditModule}
        />
        <label>Client website URL</label>
        <input
          value={form.client_site_url}
          onChange={(e) => setForm({ ...form, client_site_url: e.target.value })}
          placeholder="https://preview.mailerlite.io/..."
          disabled={!canEditModule}
        />
        <label>Client blog URL</label>
        <input
          value={form.client_blog_url}
          onChange={(e) => setForm({ ...form, client_blog_url: e.target.value })}
          disabled={!canEditModule}
        />
        <label>Website draft mode</label>
        <select
          value={form.website_mode}
          onChange={(e) => setForm({ ...form, website_mode: e.target.value })}
          disabled={!canEditModule}
        >
          <option value="cms_draft">Our CMS — auto draft (recommended)</option>
          <option value="mailerlite_manual">MailerLite site — manual paste pack</option>
        </select>
        <label>Newsletter content</label>
        <select
          value={form.newsletter_mode}
          onChange={(e) => setForm({ ...form, newsletter_mode: e.target.value })}
          disabled={!canEditModule}
        >
          <option value="full_html">Full article in email</option>
          <option value="excerpt_link">Excerpt + Read more link</option>
        </select>

        <h2 style={{ marginTop: "1rem" }}>MailerLite API</h2>
        {meta?.has_mailerlite_api_key && (
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 0.75rem" }}>
            Saved key: {meta.mailerlite_api_key_hint || "••••"} — leave blank to keep
          </p>
        )}
        <label>API token</label>
        <input
          type="password"
          value={form.mailerlite_api_key}
          onChange={(e) => setForm({ ...form, mailerlite_api_key: e.target.value })}
          placeholder="Paste MailerLite API token"
          disabled={!canEditModule}
        />
        <label>From email (verified in MailerLite)</label>
        <input
          value={form.mailerlite_from_email}
          onChange={(e) => setForm({ ...form, mailerlite_from_email: e.target.value })}
          disabled={!canEditModule}
        />
        <label>From name</label>
        <input
          value={form.mailerlite_from_name}
          onChange={(e) => setForm({ ...form, mailerlite_from_name: e.target.value })}
          disabled={!canEditModule}
        />
        <label>Subscriber group ID</label>
        <input
          value={form.mailerlite_group_id}
          onChange={(e) => setForm({ ...form, mailerlite_group_id: e.target.value })}
          disabled={!canEditModule}
        />

        <h2 style={{ marginTop: "1rem" }}>Schedule (confirmed)</h2>
        <label>Timezone</label>
        <input value={form.timezone} disabled />
        <label>AI writes new post</label>
        <input
          value={`${form.automation_frequency} — Monday ${form.automation_run_time} IST`}
          disabled
        />
        <label>Newsletter send</label>
        <select
          value={form.newsletter_send_timing}
          onChange={(e) => setForm({ ...form, newsletter_send_timing: e.target.value })}
          disabled={!canEditModule}
        >
          <option value="scheduled">Scheduled (Monday 12:00 IST)</option>
          <option value="on_approve">Immediately after approval</option>
        </select>
        <label>Newsletter format</label>
        <select
          value={form.newsletter_mode}
          onChange={(e) => setForm({ ...form, newsletter_mode: e.target.value })}
          disabled={!canEditModule}
        >
          <option value="full_html">Full article in email</option>
          <option value="excerpt_link">Excerpt + Read more link</option>
        </select>

        <h2 style={{ marginTop: "1rem" }}>Review &amp; notify</h2>
        <label>Approval emails (comma-separated)</label>
        <input
          value={form.approval_emails}
          onChange={(e) => setForm({ ...form, approval_emails: e.target.value })}
          disabled={!canEditModule}
        />
        <label>Teams webhook URL (optional)</label>
        <input
          value={form.teams_webhook_url}
          onChange={(e) => setForm({ ...form, teams_webhook_url: e.target.value })}
          disabled={!canEditModule}
        />
        <label>Notes</label>
        <textarea
          rows={3}
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          disabled={!canEditModule}
        />

        <div className="b20-actions">
          <button type="submit" className="b20-btn b20-btn-primary" disabled={!canEditModule || saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            className="b20-btn b20-btn-secondary"
            onClick={handleTest}
            disabled={!canEditModule || testing}
          >
            {testing ? "Testing…" : "Test connection"}
          </button>
        </div>
      </form>

      {testGroups.length > 0 && (
        <div className="b20-card" style={{ marginTop: "1rem" }}>
          <h2>Groups from MailerLite</h2>
          <ul className="b20-checklist">
            {testGroups.map((g) => (
              <li key={g.id}>
                <span className="b20-dot done" />
                <div>
                  <strong>{g.name}</strong>
                  <div style={{ fontSize: "0.85rem", color: "#64748b" }}>
                    ID: {g.id} · {g.active_count ?? "—"} subscribers
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
