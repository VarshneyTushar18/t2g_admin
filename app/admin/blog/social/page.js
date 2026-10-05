"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import ReadOnlyBanner from "../../components/ReadOnlyBanner";
import {
  connectSocialAccount,
  disconnectSocialAccount,
  getSocialPlatforms,
} from "../services/blogService";
import "../blog-admin.css";

const PLATFORM_ICONS = {
  x: "𝕏",
  facebook: "f",
  linkedin: "in",
  instagram: "📷",
};

const ENV_HINTS = {
  x: ["X_API_KEY", "TWITTER_API_KEY"],
  facebook: ["META_PAGE_ACCESS_TOKEN", "FACEBOOK_PAGE_ACCESS_TOKEN"],
  linkedin: ["LINKEDIN_ACCESS_TOKEN"],
  instagram: ["INSTAGRAM_ACCESS_TOKEN", "META_PAGE_ACCESS_TOKEN"],
};

export default function BlogSocialSettingsPage() {
  const router = useRouter();
  const { loading: authLoading, canView, canEdit, isReadOnly } = useAuth();
  const [platforms, setPlatforms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState("");

  const readOnly = isReadOnly("blog");
  const canManage = canEdit("blog") && !readOnly;

  const load = useCallback(async () => {
    setError("");
    try {
      setLoading(true);
      const list = await getSocialPlatforms();
      setPlatforms(list);
    } catch (err) {
      setError(err.message || "Failed to load social platforms");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!canView("blog")) {
      router.replace("/admin");
      return;
    }
    load();
  }, [authLoading, canView, router, load]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 4000);
    return () => clearTimeout(t);
  }, [success]);

  const handleConnect = async (platform) => {
    if (!canManage) return;
    const label = window.prompt(
      `Label for ${platform.label} (e.g. @Tech2Globe or Page name):`,
      platform.account_label || "",
    );
    if (label === null) return;
    setBusy(`connect-${platform.id}`);
    try {
      await connectSocialAccount(platform.id, { account_label: label.trim() });
      setSuccess(`${platform.label} marked as connected.`);
      await load();
    } catch (err) {
      alert(err.message || "Failed to connect");
    } finally {
      setBusy("");
    }
  };

  const handleDisconnect = async (platform) => {
    if (!canManage) return;
    if (!window.confirm(`Disconnect ${platform.label}?`)) return;
    setBusy(`disconnect-${platform.id}`);
    try {
      await disconnectSocialAccount(platform.id);
      setSuccess(`${platform.label} disconnected.`);
      await load();
    } catch (err) {
      alert(err.message || "Failed to disconnect");
    } finally {
      setBusy("");
    }
  };

  if (authLoading || !canView("blog")) {
    return (
      <div className="blog-admin-page">
        <div className="blog-loading">Loading…</div>
      </div>
    );
  }

  const connectedCount = platforms.filter((p) => p.connected).length;

  return (
    <div className="blog-admin-page">
      <div className="blog-admin-inner">
        <Link href="/admin/blog" className="blog-admin-back">
          ← Blog posts
        </Link>

        <section className="blog-admin-hero">
          <div className="blog-admin-hero-row">
            <div>
              <h1>Social media</h1>
              <p>
                Connect platforms here once. Per-post sharing is configured when you edit each blog
                (Social tab).
              </p>
              <div className="blog-admin-stats">
                <div className="blog-admin-stat">
                  <strong>{connectedCount}</strong>
                  <span>Connected</span>
                </div>
                <div className="blog-admin-stat">
                  <strong>{platforms.length}</strong>
                  <span>Platforms</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {readOnly && <ReadOnlyBanner moduleKey="blog" />}
        {success && <div className="blog-alert-success">{success}</div>}
        {error && <div className="blog-alert-error">{error}</div>}

        <div className="blog-card" style={{ marginBottom: 16 }}>
          <div className="blog-card-body">
            <p style={{ margin: 0, fontSize: 14, color: "#475569", lineHeight: 1.6 }}>
              <strong>How it works:</strong> connect accounts below → open any post →{" "}
              <strong>Social</strong> tab → enable platforms for that post → on publish, the server
              attempts to share (API keys must be set in backend <code>.env</code>).
            </p>
          </div>
        </div>

        {loading ? (
          <div className="blog-loading">Loading platforms…</div>
        ) : (
          <div className="bss-grid">
            {platforms.map((platform) => (
              <article key={platform.id} className="bss-platform-card">
                <div className="bss-platform-head">
                  <span className={`bss-icon bss-icon-${platform.id}`}>
                    {PLATFORM_ICONS[platform.id] || "•"}
                  </span>
                  <div>
                    <h2>{platform.label}</h2>
                    <p>{platform.notes}</p>
                  </div>
                </div>

                <div className="bss-status-row">
                  {platform.connected ? (
                    <span className="bss-badge bss-badge-ok">
                      Connected
                      {platform.account_label ? ` · ${platform.account_label}` : ""}
                    </span>
                  ) : (
                    <span className="bss-badge bss-badge-warn">Not connected</span>
                  )}
                </div>

                <ul className="bss-meta">
                  <li>Max length: {platform.maxLength?.toLocaleString()} chars</li>
                  {platform.requiresImage && <li>Image required</li>}
                  <li>
                    Server env: {(ENV_HINTS[platform.id] || []).join(" or ")}
                  </li>
                </ul>

                <div className="bss-actions">
                  {platform.connected ? (
                    <button
                      type="button"
                      className="blog-btn blog-btn-secondary"
                      disabled={!canManage || busy === `disconnect-${platform.id}`}
                      onClick={() => handleDisconnect(platform)}
                    >
                      {busy === `disconnect-${platform.id}` ? "Disconnecting…" : "Disconnect"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      className="blog-btn blog-btn-accent"
                      disabled={!canManage || busy === `connect-${platform.id}`}
                      onClick={() => handleConnect(platform)}
                    >
                      {busy === `connect-${platform.id}` ? "Connecting…" : "Connect account"}
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}

        <div className="blog-card" style={{ marginTop: 20 }}>
          <div className="blog-card-head">Coming next</div>
          <div className="blog-card-body">
            <ul className="bss-roadmap">
              <li>OAuth login per platform (instead of manual connect)</li>
              <li>Scheduled social posts after AI automations publish</li>
              <li>Browser bot option for platforms without API access</li>
            </ul>
          </div>
        </div>
      </div>

      <style>{`
        .bss-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 16px;
        }
        .bss-platform-card {
          background: #fff;
          border: 1px solid #e2e8f0;
          border-radius: 14px;
          padding: 18px;
          display: flex;
          flex-direction: column;
          gap: 12px;
          box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
        }
        .bss-platform-head {
          display: flex;
          gap: 12px;
          align-items: flex-start;
        }
        .bss-platform-head h2 {
          margin: 0 0 4px;
          font-size: 16px;
          color: #0f172a;
        }
        .bss-platform-head p {
          margin: 0;
          font-size: 12px;
          color: #64748b;
          line-height: 1.45;
        }
        .bss-icon {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 18px;
          flex-shrink: 0;
        }
        .bss-icon-x { background: #0f172a; color: #fff; }
        .bss-icon-facebook { background: #1877f2; color: #fff; }
        .bss-icon-linkedin { background: #0a66c2; color: #fff; font-size: 14px; }
        .bss-icon-instagram {
          background: linear-gradient(135deg, #f58529, #dd2a7b, #8134af);
          color: #fff;
        }
        .bss-status-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .bss-badge {
          font-size: 11px;
          font-weight: 700;
          padding: 4px 10px;
          border-radius: 999px;
        }
        .bss-badge-ok { background: #d1fae5; color: #065f46; }
        .bss-badge-warn { background: #fef3c7; color: #92400e; }
        .bss-meta {
          margin: 0;
          padding-left: 18px;
          font-size: 12px;
          color: #64748b;
          line-height: 1.5;
        }
        .bss-meta code {
          font-size: 11px;
          background: #f1f5f9;
          padding: 1px 4px;
          border-radius: 4px;
        }
        .bss-actions { margin-top: auto; }
        .bss-roadmap {
          margin: 0;
          padding-left: 20px;
          color: #475569;
          font-size: 14px;
          line-height: 1.7;
        }
      `}</style>
    </div>
  );
}
