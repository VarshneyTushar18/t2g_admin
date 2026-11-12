"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import * as api from "../services/blog20Service";
import MailerLiteSessionAlert from "../components/MailerLiteSessionAlert";
import MailerLiteBotControls from "../components/MailerLiteBotControls";
import { useBlog20BotWatch } from "../hooks/useBlog20BotWatch";
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
  mailerlite_site_id: "196949098888169226",
  mailerlite_bot_enabled: false,
  mailerlite_bot_auto_push: false,
  mailerlite_allow_direct_publish: true,
  mailerlite_login_email: "",
  mailerlite_login_password: "",
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
  const [testingBot, setTestingBot] = useState(false);
  const [testingApproval, setTestingApproval] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [testGroups, setTestGroups] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const canEditModule = canEdit("blog_2_0") && !isReadOnly("blog_2_0");

  const watchBot =
    testingBot ||
    Boolean(meta?.mailerlite_bot_waiting_otp) ||
    (meta?.mailerlite_session_status &&
      meta.mailerlite_session_status !== "ok");
  const botStatus = useBlog20BotWatch(Boolean(watchBot));

  useEffect(() => {
    if (authLoading) return;
    if (!canView("blog_2_0")) {
      router.replace("/admin");
      return;
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authLoading, canView]);

  const applySettings = (s) => {
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
      mailerlite_site_id: s.mailerlite_site_id || EMPTY.mailerlite_site_id,
      mailerlite_bot_enabled: Boolean(s.mailerlite_bot_enabled),
      mailerlite_bot_auto_push: Boolean(s.mailerlite_bot_auto_push),
      mailerlite_allow_direct_publish: s.mailerlite_allow_direct_publish !== false,
      approval_emails: (s.approval_emails || []).join(", "),
      teams_webhook_url: s.teams_webhook_url || "",
      timezone: s.timezone || EMPTY.timezone,
      automation_frequency: s.automation_frequency || EMPTY.automation_frequency,
      automation_run_time: s.automation_run_time || EMPTY.automation_run_time,
      newsletter_send_timing: s.newsletter_send_timing || EMPTY.newsletter_send_timing,
      newsletter_send_time: s.newsletter_send_time || EMPTY.newsletter_send_time,
      notes: s.notes || "",
    });
  };

  const refreshQuiet = async () => {
    try {
      const s = await api.getSettings();
      applySettings(s);
    } catch {
      /* ignore */
    }
  };

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const s = await api.getSettings();
      applySettings(s);
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
        mailerlite_site_id: form.mailerlite_site_id,
        mailerlite_bot_enabled: form.mailerlite_bot_enabled,
        mailerlite_bot_auto_push: form.mailerlite_bot_auto_push,
        mailerlite_allow_direct_publish: form.mailerlite_allow_direct_publish,
        approval_emails: form.approval_emails,
        teams_webhook_url: form.teams_webhook_url,
        notes: form.notes,
      };
      if (form.mailerlite_api_key.trim()) {
        payload.mailerlite_api_key = form.mailerlite_api_key.trim();
      }
      const loginEmail = form.mailerlite_login_email.trim();
      if (loginEmail) {
        if (loginEmail.includes("://") || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(loginEmail)) {
          throw new Error(
            "Bot login email must be a MailerLite account email (e.g. user@company.com), not a website URL.",
          );
        }
        payload.mailerlite_login_email = loginEmail;
      }
      if (form.mailerlite_login_password.trim()) {
        payload.mailerlite_login_password = form.mailerlite_login_password.trim();
      }
      const next = await api.saveSettings(payload);
      setMeta(next);
      setForm((prev) => ({
        ...prev,
        mailerlite_api_key: "",
        mailerlite_login_email: "",
        mailerlite_login_password: "",
      }));
      setSuccess(
        next?.has_mailerlite_login
          ? `Saved. Bot login: ${next.mailerlite_login_email_hint || "configured"}.`
          : "Saved Blog-2.0 MailerLite settings.",
      );
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleTestBot = async () => {
    if (!canEditModule) return;
    setTestingBot(true);
    setError("");
    setSuccess("");
    try {
      await handleSave({ preventDefault: () => {} });
      const res = await api.testMailerLiteBot();
      if (!res?.ok) {
        throw new Error(res?.message || "Bot login test did not return ok:true");
      }
      setSuccess(res.message || "Bot logged in and opened MailerLite blog list.");
    } catch (err) {
      setError(err.message || "Bot test failed");
    } finally {
      setTestingBot(false);
    }
  };

  const handleTestApprovalEmail = async () => {
    if (!canEditModule) return;
    const emails = form.approval_emails
      .split(/[,;\n]/)
      .map((s) => s.trim())
      .filter(Boolean);
    if (!emails.length) {
      setError("Add at least one approval email above, then save or test.");
      return;
    }
    setTestingApproval(true);
    setError("");
    setSuccess("");
    try {
      await handleSave({ preventDefault: () => {} });
      const res = await api.testApprovalEmail({ emails: emails.join(", ") });
      const list = (res.recipients || emails).join(", ");
      setSuccess(
        res.note
          ? `Test approval email sent to ${list}. ${res.note}`
          : `Test approval email sent to ${list}. Check inbox for Preview / Yes / No buttons.`,
      );
    } catch (err) {
      setError(err.message || "Approval email test failed");
    } finally {
      setTestingApproval(false);
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
      <div className="b20-hero b20-hero-compact">
        <h1>Bright CRM setup</h1>
        <p>
          Who gets review emails, and how drafts reach MailerLite. Weekly schedule lives on{" "}
          <Link href="/admin/blog-2.0/automations" className="b20-hero-link">
            Automations
          </Link>
          .
        </p>
      </div>

      <MailerLiteSessionAlert
        settings={meta}
        canEdit={canEditModule}
        onRefresh={refreshQuiet}
        botStatus={botStatus}
      />

      <MailerLiteBotControls
        botStatus={botStatus}
        canEdit={canEditModule}
        onRefresh={refreshQuiet}
        onStartBot={async () => {
          if (!canEditModule) return;
          setTestingBot(true);
          setError("");
          try {
            return await api.testMailerLiteBot();
          } finally {
            setTestingBot(false);
          }
        }}
      />

      {error && <div className="b20-alert err">{error}</div>}
      {success && <div className="b20-alert ok">{success}</div>}

      <form className="b20-setup-stack" onSubmit={handleSave}>
        <section className="b20-card b20-form b20-setup-card">
          <h2>1. Who approves new blogs?</h2>
          <p className="b20-setup-hint">
            After AI writes a post, these inboxes get <strong>Preview</strong> and{" "}
            <strong>Save as draft</strong>. Yes runs the MailerLite bot.
          </p>
          <label>Manager email(s)</label>
          <input
            value={form.approval_emails}
            onChange={(e) => setForm({ ...form, approval_emails: e.target.value })}
            disabled={!canEditModule}
            placeholder="name@company.com, teammate@company.com"
          />
          <label className="b20-check-line">
            <input
              type="checkbox"
              checked={form.mailerlite_allow_direct_publish}
              onChange={(e) =>
                setForm({ ...form, mailerlite_allow_direct_publish: e.target.checked })
              }
              disabled={!canEditModule}
            />
            Also show <strong>Publish live</strong> in the email (optional)
          </label>
        </section>

        <section className="b20-card b20-form b20-setup-card">
          <h2>2. Send drafts to the Bright CRM website</h2>
          <p className="b20-setup-hint">
            Server bot logs into MailerLite (use a login with <strong>2FA off</strong>).
          </p>
          <label className="b20-check-line">
            <input
              type="checkbox"
              checked={form.mailerlite_bot_enabled}
              onChange={(e) => setForm({ ...form, mailerlite_bot_enabled: e.target.checked })}
              disabled={!canEditModule}
            />
            Enable MailerLite bot
          </label>
          <label className="b20-check-line">
            <input
              type="checkbox"
              checked={form.mailerlite_bot_auto_push}
              onChange={(e) => setForm({ ...form, mailerlite_bot_auto_push: e.target.checked })}
              disabled={!canEditModule}
            />
            Push immediately after AI save (skip approval email)
          </label>
          <div className="b20-setup-row">
            <label>
              Site ID
              <input
                value={form.mailerlite_site_id}
                onChange={(e) => setForm({ ...form, mailerlite_site_id: e.target.value })}
                disabled={!canEditModule}
              />
            </label>
            <label>
              Bot login email
              <input
                type="email"
                value={form.mailerlite_login_email}
                onChange={(e) => setForm({ ...form, mailerlite_login_email: e.target.value })}
                placeholder={meta?.mailerlite_login_email_hint || "bot@company.com"}
                autoComplete="off"
                disabled={!canEditModule}
              />
            </label>
          </div>
          <label>Bot password {meta?.has_mailerlite_login ? "(saved — leave blank to keep)" : ""}</label>
          <input
            type="password"
            value={form.mailerlite_login_password}
            onChange={(e) => setForm({ ...form, mailerlite_login_password: e.target.value })}
            autoComplete="new-password"
            disabled={!canEditModule}
          />
          <button
            type="button"
            className="b20-btn b20-btn-secondary b20-setup-inline-btn"
            onClick={handleTestBot}
            disabled={!canEditModule || testingBot}
          >
            {testingBot ? "Testing…" : "Test bot login"}
          </button>
        </section>

        <div className="b20-setup-bar">
          <button type="submit" className="b20-btn b20-btn-primary" disabled={!canEditModule || saving}>
            {saving ? "Saving…" : "Save"}
          </button>
          <button
            type="button"
            className="b20-btn b20-btn-secondary"
            onClick={handleTestApprovalEmail}
            disabled={!canEditModule || testingApproval}
          >
            {testingApproval ? "Sending…" : "Send test approval email"}
          </button>
        </div>

        <button
          type="button"
          className="b20-advanced-toggle"
          onClick={() => setShowAdvanced((v) => !v)}
        >
          {showAdvanced ? "Hide technical settings" : "Technical settings (URLs, newsletter API, notes)"}
        </button>

        {showAdvanced ? (
          <section className="b20-card b20-form b20-setup-card b20-setup-advanced">
            <h2>Client site (for AI tone)</h2>
            <label>Project name</label>
            <input
              value={form.project_name}
              onChange={(e) => setForm({ ...form, project_name: e.target.value })}
              disabled={!canEditModule}
            />
            <label>Bright CRM website URL</label>
            <input
              value={form.client_site_url}
              onChange={(e) => setForm({ ...form, client_site_url: e.target.value })}
              disabled={!canEditModule}
            />
            <label>Blog URL</label>
            <input
              value={form.client_blog_url}
              onChange={(e) => setForm({ ...form, client_blog_url: e.target.value })}
              disabled={!canEditModule}
            />
            <label>Internal notes</label>
            <textarea
              rows={2}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              disabled={!canEditModule}
            />

            <h2 style={{ marginTop: "1.25rem" }}>Newsletter (coming soon)</h2>
            <p className="b20-setup-hint">Monday campaigns — not required for blog drafts on the website.</p>
            {meta?.has_mailerlite_api_key ? (
              <p className="b20-setup-hint">API key saved ({meta.mailerlite_api_key_hint || "••••"}).</p>
            ) : null}
            <label>API token</label>
            <input
              type="password"
              value={form.mailerlite_api_key}
              onChange={(e) => setForm({ ...form, mailerlite_api_key: e.target.value })}
              placeholder="Paste only when changing"
              disabled={!canEditModule}
            />
            <div className="b20-setup-row">
              <label>
                From email
                <input
                  value={form.mailerlite_from_email}
                  onChange={(e) => setForm({ ...form, mailerlite_from_email: e.target.value })}
                  disabled={!canEditModule}
                />
              </label>
              <label>
                From name
                <input
                  value={form.mailerlite_from_name}
                  onChange={(e) => setForm({ ...form, mailerlite_from_name: e.target.value })}
                  disabled={!canEditModule}
                />
              </label>
            </div>
            <label>Subscriber group ID</label>
            <input
              value={form.mailerlite_group_id}
              onChange={(e) => setForm({ ...form, mailerlite_group_id: e.target.value })}
              disabled={!canEditModule}
            />
            <label>When to send newsletter</label>
            <select
              value={form.newsletter_send_timing}
              onChange={(e) => setForm({ ...form, newsletter_send_timing: e.target.value })}
              disabled={!canEditModule}
            >
              <option value="scheduled">Scheduled (Monday 12:00 IST)</option>
              <option value="on_approve">Right after approval</option>
            </select>
            <label>Email body style</label>
            <select
              value={form.newsletter_mode}
              onChange={(e) => setForm({ ...form, newsletter_mode: e.target.value })}
              disabled={!canEditModule}
            >
              <option value="full_html">Full article</option>
              <option value="excerpt_link">Excerpt + link</option>
            </select>
            <label>Website paste mode</label>
            <select
              value={form.website_mode}
              onChange={(e) => setForm({ ...form, website_mode: e.target.value })}
              disabled={!canEditModule}
            >
              <option value="mailerlite_manual">MailerLite site (bot)</option>
              <option value="cms_draft">CMS auto draft</option>
            </select>
            <label>Microsoft Teams webhook (optional)</label>
            <input
              value={form.teams_webhook_url}
              onChange={(e) => setForm({ ...form, teams_webhook_url: e.target.value })}
              placeholder="https://… (not the MailerLite site ID)"
              disabled={!canEditModule}
            />
            <button
              type="button"
              className="b20-btn b20-btn-secondary b20-setup-inline-btn"
              onClick={handleTest}
              disabled={!canEditModule || testing}
            >
              {testing ? "Testing…" : "Test newsletter API"}
            </button>
          </section>
        ) : null}
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
