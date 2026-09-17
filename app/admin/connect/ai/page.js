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
  image_api_key: "",
  image_base_url: "",
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
        image_api_key: "",
        image_base_url: s.image_base_url || "",
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
      image_model: p?.imageModel || prev.image_model,
    }));
  };

  const providerMeta = meta?.providers?.[form.provider] || {};
  const suggestedModels = providerMeta.suggestedModels || [];
  const providerList = Object.entries(meta?.providers || {
    openrouter: { label: "OpenRouter", hint: "" },
  }).filter(([key]) => !["anthropic", "google"].includes(key)); // hide legacy ids in dropdown

  // If saved provider is legacy, still show it selected
  const selectProviders =
    form.provider === "anthropic" || form.provider === "google"
      ? Object.entries(meta?.providers || {})
      : providerList;

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
        image_base_url: form.image_base_url,
        site_url: form.site_url,
        site_name: form.site_name,
        enabled: form.enabled,
      };
      if (form.api_key.trim()) payload.api_key = form.api_key.trim();
      if (form.image_api_key.trim()) payload.image_api_key = form.image_api_key.trim();
      const next = await saveAiSettings(payload);
      setMeta(next);
      setForm((prev) => ({
        ...prev,
        api_key: "",
        image_api_key: "",
        enabled: next.enabled !== false,
      }));
      if (!payload.enabled) {
        setSuccess(
          "Saved, but DB settings are OFF — agents still use .env. Enable DB settings and Save again.",
        );
      } else if (next.runtime_source === "database" && next.runtime_configured) {
        setSuccess("Saved. Blog, Career, Image, and Automations agents will use this config.");
      } else if (next.runtime_source === "decrypt_error") {
        setError(
          "Saved, but the key could not be decrypted. Paste the API key again and Save.",
        );
      } else {
        setSuccess(
          `Saved. Runtime: ${next.runtime_configured ? "configured" : "not configured"} via ${next.runtime_source || "—"}.`,
        );
      }
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
            Paste OpenAI, Claude, Gemini, or Perplexity keys from the admin panel.
            Keys are stored encrypted — no server <code>.env</code> edit needed for day-to-day changes.
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
          {!form.enabled && (
            <p className="connect-alert connect-alert-error" style={{ marginTop: 8 }}>
              DB settings are off — agents are ignoring the key above and using
              server <code>.env</code>. Check <strong>Enable DB settings</strong> and Save.
            </p>
          )}
          {meta?.runtime_source === "decrypt_error" && (
            <p className="connect-alert connect-alert-error" style={{ marginTop: 8 }}>
              Saved key could not be decrypted (server secret mismatch). Paste the
              API key again, Save, then click Test config.
            </p>
          )}

          <form onSubmit={handleSave}>
            <div className="connect-field">
              <label>Provider</label>
              <select
                value={form.provider}
                onChange={(e) => onProviderChange(e.target.value)}
              >
                {selectProviders.map(([key, p]) => (
                  <option key={key} value={key}>
                    {p.label || key}
                  </option>
                ))}
              </select>
              <small style={{ color: "#64748b" }}>
                {providerMeta.hint ||
                  "Pick OpenRouter, OpenAI, Claude, Gemini, or Perplexity, then paste that provider’s API key."}
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
                    : "Paste Claude / Gemini / Perplexity / OpenAI / OpenRouter key"
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
              <small style={{ color: "#64748b" }}>
                Auto-filled when you change Provider. Edit only if you use a custom gateway.
              </small>
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
                list="chat-model-suggestions"
              />
              <datalist id="chat-model-suggestions">
                {suggestedModels.map((m) => (
                  <option key={m} value={m} />
                ))}
              </datalist>
              {suggestedModels.length > 0 && (
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginTop: 8 }}>
                  {suggestedModels.map((m) => (
                    <button
                      key={m}
                      type="button"
                      className="connect-btn"
                      style={{
                        padding: "4px 10px",
                        fontSize: 12,
                        background: form.default_model === m ? "#eef2ff" : "#fff",
                        borderColor: form.default_model === m ? "#4f46e5" : "#cbd5e1",
                        color: form.default_model === m ? "#4f46e5" : "#475569",
                      }}
                      onClick={() =>
                        setForm((prev) => ({ ...prev, default_model: m }))
                      }
                    >
                      {m}
                    </button>
                  ))}
                </div>
              )}
              <small style={{ color: "#64748b", display: "block", marginTop: 6 }}>
                Used by Blog Agent & Career Agent. Click a preset or type any model id.
              </small>
            </div>

            <hr style={{ margin: "24px 0", border: 0, borderTop: "1px solid #e2e8f0" }} />
            <h3 style={{ margin: "0 0 8px", fontSize: 16 }}>Image generation (separate)</h3>
            <p style={{ margin: "0 0 16px", fontSize: 13, color: "#64748b" }}>
              Image Agent uses these settings. Text-only models (ChatGPT / Claude / Perplexity sonar) cannot generate images — set an image-capable model.
            </p>

            <div className="connect-field">
              <label>Image model (required for Image Agent)</label>
              <input
                type="text"
                value={form.image_model}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, image_model: e.target.value }))
                }
                placeholder="google/gemini-2.5-flash-image-preview"
              />
              <small style={{ color: "#64748b" }}>
                OpenRouter example: google/gemini-2.5-flash-image-preview
              </small>
            </div>

            <div className="connect-field">
              <label>Image API key (optional — separate from chat)</label>
              <input
                type="password"
                value={form.image_api_key}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, image_api_key: e.target.value }))
                }
                placeholder={
                  meta?.has_image_api_key
                    ? `Saved (${meta.image_api_key_hint || "••••"}) — paste to replace`
                    : "Leave blank to reuse the chat API key above"
                }
                autoComplete="new-password"
              />
            </div>

            <div className="connect-field">
              <label>Image API base URL (optional)</label>
              <input
                type="text"
                value={form.image_base_url}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, image_base_url: e.target.value }))
                }
                placeholder="https://openrouter.ai/api/v1"
              />
              <small style={{ color: "#64748b" }}>
                Leave blank to use the same Base URL as chat.
              </small>
            </div>

            {meta?.has_image_api_key && (
              <button
                type="button"
                className="connect-btn connect-btn-danger"
                style={{ marginBottom: 16 }}
                onClick={async () => {
                  if (!confirm("Clear the separate Image API key?")) return;
                  setSaving(true);
                  try {
                    const next = await saveAiSettings({ clear_image_api_key: true });
                    setMeta(next);
                    setSuccess("Image API key cleared. Image Agent will fall back to the chat API key.");
                  } catch (err) {
                    setError(err.message || "Could not clear image key");
                  } finally {
                    setSaving(false);
                  }
                }}
                disabled={saving}
              >
                Clear image API key
              </button>
            )}

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
          <h2>How to connect each provider</h2>
          <p>
            <strong>OpenRouter</strong> — one key for GPT + Claude + Gemini + images. Easiest option.
          </p>
          <p>
            <strong>OpenAI (ChatGPT)</strong> — paste <code>sk-…</code> key, pick <code>gpt-4o-mini</code> / <code>gpt-4o</code>.
          </p>
          <p>
            <strong>Claude</strong> — select Claude provider, paste an <strong>OpenRouter</strong> key, pick <code>anthropic/claude-3.5-sonnet</code> (or another Claude model).
          </p>
          <p>
            <strong>Gemini</strong> — paste Google AI Studio key, base URL auto-fills, pick <code>gemini-2.0-flash</code>.
          </p>
          <p>
            <strong>Perplexity</strong> — paste Perplexity key, pick <code>sonar</code> / <code>sonar-pro</code>.
          </p>
          <p style={{ marginTop: 16, fontSize: 13, color: "var(--c-muted)" }}>
            After Save, click <strong>Test config</strong>. Blog / Career agents use the chat model; Image Agent needs a separate image-capable model.
          </p>
        </section>
      </div>
    </div>
  );
}
