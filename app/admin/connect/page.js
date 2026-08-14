"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import { MODULE_CATALOG } from "@/lib/modulePermissions";
import {
  createApiKey,
  listApiKeys,
  revokeApiKey,
} from "./services/connectService";
import "../connect.css";

function formatDate(value) {
  if (!value) return "Never";
  return new Date(value).toLocaleString();
}

function moduleLabels(keys) {
  if (!Array.isArray(keys) || keys.length === 0) return "—";
  return keys
    .map((key) => MODULE_CATALOG.find((m) => m.key === key)?.label || key)
    .join(", ");
}

export default function ConnectPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [keys, setKeys] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [name, setName] = useState("");
  const [selectedModules, setSelectedModules] = useState([]);
  const [readOnly, setReadOnly] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newKey, setNewKey] = useState(null);
  const [revokingId, setRevokingId] = useState(null);

  const apiBaseUrl = useMemo(() => {
    if (typeof window === "undefined") return "https://your-backend-url.com";
    const direct = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
    if (direct) return direct.replace(/\/$/, "");
    return window.location.origin;
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (user?.role !== "super_admin") {
      router.replace("/admin");
      return;
    }
    loadKeys();
  }, [authLoading, user, router]);

  const loadKeys = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await listApiKeys();
      setKeys(data);
    } catch (err) {
      setError(err.message);
    }
    setLoading(false);
  };

  const toggleModule = (key) => {
    setSelectedModules((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setNewKey(null);
    if (!name.trim()) {
      setError("Enter a name for this key");
      return;
    }
    if (selectedModules.length === 0) {
      setError("Select at least one module");
      return;
    }
    setSaving(true);
    try {
      const res = await createApiKey({
        name: name.trim(),
        modules: selectedModules,
        readOnly,
      });
      setNewKey(res.data);
      setSuccess(res.message || "API key created");
      setName("");
      setSelectedModules([]);
      setReadOnly(true);
      loadKeys();
    } catch (err) {
      setError(err.message);
    }
    setSaving(false);
  };

  const handleRevoke = async (id) => {
    if (!confirm("Revoke this API key? Tools using it will stop working immediately.")) {
      return;
    }
    setRevokingId(id);
    try {
      await revokeApiKey(id);
      setSuccess("API key revoked");
      setKeys((prev) => prev.filter((k) => k.id !== id));
    } catch (err) {
      setError(err.message);
    }
    setRevokingId(null);
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setSuccess("Copied to clipboard");
    } catch {
      setError("Could not copy — select and copy manually");
    }
  };

  const envSnippet = newKey
    ? `TECH2GLOBE_API_KEY=${newKey.key}\nTECH2GLOBE_API_URL=${apiBaseUrl}`
    : `TECH2GLOBE_API_KEY=t2g_sk_your_key_here\nTECH2GLOBE_API_URL=${apiBaseUrl}`;

  if (authLoading || (user && user.role !== "super_admin" && loading)) {
    return <div className="connect-loading">Loading…</div>;
  }

  return (
    <div className="connect-saas">
      <header className="connect-saas-header">
        <div>
          <h1>Connect</h1>
          <p>
            Generate API keys to connect ChatGPT, scripts, or automations to your
            admin data. Paste the key in <code>.env</code> or your tool&apos;s
            settings.
          </p>
        </div>
      </header>

      {error && <div className="connect-alert connect-alert-error">{error}</div>}
      {success && !newKey && (
        <div className="connect-alert connect-alert-success">{success}</div>
      )}

      {newKey && (
        <div className="connect-key-reveal">
          <p>{success || "Save this key now — it won't be shown again."}</p>
          <code>{newKey.key}</code>
          <div className="connect-key-actions">
            <button type="button" onClick={() => copyText(newKey.key)}>
              Copy key
            </button>
            <button type="button" onClick={() => copyText(envSnippet)}>
              Copy .env snippet
            </button>
            <button type="button" onClick={() => setNewKey(null)}>
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="connect-grid">
        <section className="connect-card">
          <h2>Generate API key</h2>
          <p>Name your key and choose which modules it can access.</p>
          <form onSubmit={handleCreate}>
            <div className="connect-field">
              <label htmlFor="key-name">Key name</label>
              <input
                id="key-name"
                type="text"
                placeholder="e.g. ChatGPT Leads Bot"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="connect-field">
              <label>Modules</label>
              <div className="connect-modules">
                {MODULE_CATALOG.map((mod) => (
                  <label key={mod.key} className="connect-module-check">
                    <input
                      type="checkbox"
                      checked={selectedModules.includes(mod.key)}
                      onChange={() => toggleModule(mod.key)}
                    />
                    {mod.label}
                  </label>
                ))}
              </div>
            </div>
            <label className="connect-readonly">
              <input
                type="checkbox"
                checked={readOnly}
                onChange={(e) => setReadOnly(e.target.checked)}
              />
              Read-only (GET requests only — recommended)
            </label>
            <div style={{ marginTop: 20 }}>
              <button
                type="submit"
                className="connect-btn connect-btn-primary"
                disabled={saving}
              >
                {saving ? "Generating…" : "Generate API key"}
              </button>
            </div>
          </form>
        </section>

        <section className="connect-card">
          <h2>Active keys</h2>
          <p>Revoke keys you no longer use. Only the prefix is stored for display.</p>
          {loading ? (
            <div className="connect-loading">Loading keys…</div>
          ) : keys.length === 0 ? (
            <div className="connect-empty">No API keys yet. Generate one to get started.</div>
          ) : (
            <div className="connect-table-wrap">
              <table className="connect-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Key</th>
                    <th>Modules</th>
                    <th>Last used</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {keys.map((key) => (
                    <tr key={key.id}>
                      <td>{key.name}</td>
                      <td>
                        <code>{key.key_prefix}…</code>
                      </td>
                      <td>{moduleLabels(key.modules)}</td>
                      <td>
                        {key.read_only && (
                          <span className="connect-badge connect-badge-readonly">
                            Read-only
                          </span>
                        )}{" "}
                        {formatDate(key.last_used_at)}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="connect-btn connect-btn-danger"
                          disabled={revokingId === key.id}
                          onClick={() => handleRevoke(key.id)}
                        >
                          {revokingId === key.id ? "…" : "Revoke"}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      <section className="connect-card connect-setup">
        <h2>How to use your key</h2>
        <p>
          Add to <code>.env</code> for scripts, or in ChatGPT Custom GPT → Actions →
          Authentication → API Key → header name <code>x-api-key</code> (not Bearer).
        </p>
        <pre>{envSnippet}</pre>
        <p style={{ marginTop: 16, fontSize: 13, color: "var(--c-muted)" }}>
          Example request:{" "}
          <code>
            GET {apiBaseUrl}/api/leads — Header: x-api-key: YOUR_KEY
          </code>
        </p>
      </section>
    </div>
  );
}
