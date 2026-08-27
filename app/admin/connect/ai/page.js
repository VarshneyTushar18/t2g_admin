"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "../../context/AuthContext";
import {
  getAiSettings,
  saveAiSettings,
  testAiSettings,
} from "../services/aiIntegrationsService";
import "../../connect.css";

const EMPTY = {
  provider: "openrouter",
  api_key: "",
  base_url: "https://openrouter.ai/api/v1",
  default_model: "openai/gpt-4o-mini",
  image_model: "google/gemini-2.5-flash-image-preview",
  site_url: "https://manageadmin.tech2globe.tech",
  site_name: "Tech2Globe Agents",
  enabled: true,
};

export default function AiIntegrationsPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState(EMPTY);
  const [meta, setMeta] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [testing, setTesting] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (authLoading) return;
    if (user?.role !== "super_admin") {
      router.replace("/admin");
      return;
    }
    load();
  }, [authLoading, user, router]);

  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const s = await getAiSettings();
      setMeta(s);
      setForm({
        provider: s.provider || "openrouter",
        api_key: "",
        base_url: s.base_url || EMPTY.base_url,
        default_model: s.default_model || EMPTY.default_model,
        image_model: s.image_model || EMPTY.image_model,
        site_url: s.site_url || EMPTY.site_url,
        site_name: s.site_name || EMPTY.site_name,
        enabled: s.enabled !== false,
      });
    } catch (err) {
      setError(err.message || "Failed to load AI settings");
    } finally {
      setLoading(false);
    }
  };

  const onProviderChange = (provider) => {
    const providers = meta?.providers || {};
    const p = providers[provider];
    setForm((prev) => ({
      ...prev,
      provider,
      base_url: p?.defaultBaseUrl || prev.base_url,
      default_model: p?.defaultModel || prev.default_model,
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");
    try {
      const payload = {
        provider: form.provider,
        base_url: form.base_url,
        default_model: form.default_model,
        image_model: form.image_model,
        site_url: form.site_url,
        site_name: form.site_name,
        enabled: form.enabled,
      };
      if (form.api_key.trim()) payload.api_key = form.api_key.trim();
      const next = await saveAiSettings(payload);
      setMeta(next);
      setForm((prev) => ({ ...prev, api_key: "" }));
      setSuccess("Saved. Blog, Career, Image, and Automations agents will use this config.");
    } catch (err) {
      setError(err.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const handleClearKey = async () => {
    if (!confirm("Remove saved API key from database? Agents will fall back to .env if present.")) {
      return;
    }
    setSaving(true);
    setError("");
    try {
      const next = await saveAiSettings({
        ...form,
        api_key: "",
        clear_api_key: true,
      });
      setMeta(next);
      setSuccess("API key cleared from database");
    } catch (err) {
      setError(err.message || "Clear failed");
    } finally {
      setSaving(false);
    }
  };

  const handleTest = async () => {
    setTesting(true);
    setError("");
    setSuccess("");
    try {
      const result = await testAiSettings();
      setSuccess(result.message || "AI config looks ready");
    } catch (err) {
      setError(err.message || "Test failed");
    } finally {
      setTesting(false);
    }
  };

  if (authLoading || loading) {
    return <div className="connect-loading">Loading…</div>;
  }

  const providerList = Object.entries(meta?.providers || {
    openrouter: { label: "OpenRouter", hint: "" },
  });

  return (
    <div className="connect-saas">
      <header className="connect-saas-header">
        <div>
          <p style={{ margin: "0 0 8px" }}>
            <Link href="/admin/connect" style={{ color: "#4f46e5", fontWeight: 600 }}>
              ← Connect
            </Link>
          </p>
          <h1>AI Integrations</h1>
          <p>
            Set API keys and models for all agents (Blog, Career, Image, Automations).
            Keys are stored encrypted in the database — no need to edit server `.env` for day-to-day changes.
          </p>
        </div>
      </header>

      {error && <div className="connect-alert connect-alert-error">{error}</div>}
      {success && <div className="connect-alert connect-alert-success">{success}</div>}

      <div className="connect-grid">
        <section className="connect-card">
          <h2>Provider & key</h2>
          <p>
            Runtime:{" "}
            <strong>
              {meta?.runtime_configured ? "Configured" : "Not configured"}
            </strong>{" "}
            via <code>{meta?.runtime_source || "—"}</code>
            {meta?.api_key_hint ? (
              <> · saved key <code>{meta.api_key_hint}</code></>
            ) : null}
          </p>

          <form onSubmit={handleSave}>
            <div className="connect-field">
              <label>Provider</label>
              <select
                value={form.provider}
                onChange={(e) => onProviderChange(e.target.value)}
              >
                {providerList.map(([key, p]) => (
                  <option key={key} value={key}>
                    {p.label || key}
                  </option>
                ))}
              </select>
              <small style={{ color: "#64748b" }}>
                {meta?.providers?.[form.provider]?.hint ||
                  "OpenRouter is recommended — one key covers GPT / Claude / Gemini models."}
              </small>
            </div>

            <div className="connect-field">
              <label>API key</label>
              <input
                type="password"
                autoComplete="off"
                placeholder={
                  meta?.has_api_key
                    ? "Leave blank to keep current key"
                    : "Paste OpenRouter / OpenAI / Gemini key"
                }
                value={form.api_key}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, api_key: e.target.value }))
                }
              />
            </div>

            <div className="connect-field">
              <label>Base URL</label>
              <input
                type="text"
                value={form.base_url}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, base_url: e.target.value }))
                }
              />
            </div>

            <div className="connect-field">
              <label>Default chat model</label>
              <input
                type="text"
                value={form.default_model}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, default_model: e.target.value }))
                }
                placeholder="openai/gpt-4o-mini"
              />
              <small style={{ color: "#64748b" }}>
                Examples: openai/gpt-4o-mini · anthropic/claude-3.5-sonnet · google/gemini-2.0-flash
              </small>
            </div>

            <div className="connect-field">
              <label>Image model (optional)</label>
              <input
                type="text"
                value={form.image_model}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, image_model: e.target.value }))
                }
                placeholder="google/gemini-2.5-flash-image-preview"
              />
            </div>

            <div className="connect-field">
              <label>Site URL (OpenRouter headers)</label>
              <input
                type="text"
                value={form.site_url}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, site_url: e.target.value }))
                }
              />
            </div>

            <div className="connect-field">
              <label>App name</label>
              <input
                type="text"
                value={form.site_name}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, site_name: e.target.value }))
                }
              />
            </div>

            <label className="connect-readonly">
              <input
                type="checkbox"
                checked={form.enabled}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, enabled: e.target.checked }))
                }
              />
              Enable DB settings (if off, agents fall back to .env)
            </label>

            <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap" }}>
              <button
                type="submit"
                className="connect-btn connect-btn-primary"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save settings"}
              </button>
              <button
                type="button"
                className="connect-btn"
                onClick={handleTest}
                disabled={testing}
              >
                {testing ? "Testing…" : "Test config"}
              </button>
              {meta?.has_api_key && (
                <button
                  type="button"
                  className="connect-btn connect-btn-danger"
                  onClick={handleClearKey}
                  disabled={saving}
                >
                  Clear saved key
                </button>
              )}
            </div>
          </form>
        </section>

        <section className="connect-card">
          <h2>How it works</h2>
          <p>
            1. Paste your OpenRouter (or OpenAI) API key here and save.
          </p>
          <p>
            2. Pick a default model used by Blog Agent, Career Agent, Image Agent, and Automations.
          </p>
          <p>
            3. Agents read this config first; if no DB key is set, they still use{" "}
            <code>OPENROUTER_API_KEY</code> from server <code>.env</code>.
          </p>
          <p style={{ marginTop: 16, fontSize: 13, color: "var(--c-muted)" }}>
            Tip: OpenRouter is pay-per-use (not unlimited free). Cheap models like{" "}
            <code>openai/gpt-4o-mini</code> keep cost low.
          </p>
        </section>
      </div>
    </div>
  );
}
