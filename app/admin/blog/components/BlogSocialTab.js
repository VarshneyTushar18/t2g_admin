"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import "../blog-admin.css";
import {
  getPostSocial,
  getSocialPlatforms,
  retryPostSocialShare,
} from "../services/blogService";

const PLATFORM_SUBTABS = [
  { id: "preview", label: "Link preview" },
  { id: "x", label: "X" },
  { id: "facebook", label: "Facebook" },
  { id: "linkedin", label: "LinkedIn" },
  { id: "instagram", label: "Instagram" },
];

function ShareStatusBadge({ share }) {
  if (!share) return <span className="bst-badge bst-badge-muted">Not shared yet</span>;
  if (share.status === "success") {
    return <span className="bst-badge bst-badge-success">Shared</span>;
  }
  if (share.status === "failed") {
    return <span className="bst-badge bst-badge-error">Failed</span>;
  }
  return <span className="bst-badge bst-badge-muted">{share.status}</span>;
}

export default function BlogSocialTab({
  form,
  seo,
  handleSeoChange,
  previewImage,
  editingId,
  onSocialShareChange,
}) {
  const [subTab, setSubTab] = useState("preview");
  const [platforms, setPlatforms] = useState([]);
  const [shares, setShares] = useState({});
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState("");
  const [loadError, setLoadError] = useState("");

  const socialShare = form.social_share || {};

  const refreshSocial = useCallback(async () => {
    setLoadError("");
    try {
      const platformList = await getSocialPlatforms();
      setPlatforms(platformList);
      if (editingId) {
        const postSocial = await getPostSocial(editingId);
        setShares(postSocial.shares || {});
      }
    } catch (err) {
      setLoadError(err.message || "Failed to load social settings");
    } finally {
      setLoading(false);
    }
  }, [editingId]);

  useEffect(() => {
    refreshSocial();
  }, [refreshSocial]);

  const platformMeta = platforms.find((p) => p.id === subTab);
  const platformCfg = socialShare[subTab] || { enabled: false, message: "" };
  const platformShare = shares[subTab];

  const updatePlatformCfg = (patch) => {
    onSocialShareChange(subTab, { ...platformCfg, ...patch });
  };

  const handleRetry = async () => {
    if (!editingId) return;
    setActionBusy(`retry-${subTab}`);
    try {
      await retryPostSocialShare(editingId);
      await refreshSocial();
      alert("Social share retry finished. Check status below.");
    } catch (err) {
      alert(err.message || "Retry failed");
    } finally {
      setActionBusy("");
    }
  };

  const previewMessage =
    platformCfg.message ||
    [seo.og_title || form.title, seo.og_description || form.excerpt]
      .filter(Boolean)
      .join("\n\n");

  return (
    <div className="bst-root">
      <style>{`
        .bst-root { display: flex; flex-direction: column; gap: 16px; }
        .bst-subtabs {
          display: flex; flex-wrap: wrap; gap: 6px;
        }
        .bst-subtab {
          padding: 8px 14px; border-radius: 999px; border: 1.5px solid #e2e8f0;
          background: #fff; font-size: 12px; font-weight: 700; color: #64748b; cursor: pointer;
          transition: border-color 0.15s, background 0.15s;
        }
        .bst-subtab:hover { border-color: #cbd5e1; color: #334155; }
        .bst-subtab.active {
          border-color: #16a37f; color: #065f46; background: #ecfdf5;
        }
        .bst-card {
          border: 1px solid #e2e8f0; border-radius: 12px; padding: 18px; background: #f8fafc;
        }
        .bst-row { display: flex; flex-wrap: wrap; align-items: center; gap: 10px; margin-bottom: 12px; }
        .bst-badge {
          font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px;
        }
        .bst-badge-success { background: #d1fae5; color: #065f46; }
        .bst-badge-error { background: #fee2e2; color: #991b1b; }
        .bst-badge-muted { background: #f1f5f9; color: #64748b; }
        .bst-badge-warn { background: #fef3c7; color: #92400e; }
        .bst-actions { display: flex; flex-wrap: wrap; gap: 8px; margin-top: 8px; }
        .bst-btn {
          padding: 8px 12px; border-radius: 8px; font-size: 12px; font-weight: 700;
          border: 1.5px solid #cbd5e1; background: #fff; color: #334155; cursor: pointer;
        }
        .bst-btn:disabled { opacity: 0.6; cursor: not-allowed; }
        .bst-btn-primary { background: #16a37f; color: #fff; border-color: #16a37f; }
        .bst-btn-primary:hover:not(:disabled) { background: #0d9488; }
        .bst-preview-box {
          border: 1px dashed #cbd5e1; border-radius: 8px; padding: 12px;
          font-size: 13px; color: #334155; white-space: pre-wrap; background: #f8fafc;
        }
        .bst-error { color: #dc2626; font-size: 13px; margin: 0; }
      `}</style>

      <p className="bf-hint" style={{ margin: 0 }}>
        <strong>Link preview</strong> sets OG/Twitter meta tags. Platform tabs choose what to share when this
        post is <strong>published</strong>. Connect accounts in{" "}
        <Link href="/admin/blog/social" style={{ color: "#0d9488", fontWeight: 700 }}>
          Blog → Social media
        </Link>
        .
      </p>

      <div className="bst-subtabs">
        {PLATFORM_SUBTABS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`bst-subtab${subTab === t.id ? " active" : ""}`}
            onClick={() => setSubTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loadError && <p className="bst-error">{loadError}</p>}

      {subTab === "preview" && (
        <div className="bf-grid">
          <div className="bf-group bf-full">
            <label className="bf-label">Open Graph title</label>
            <input
              className="bf-input"
              value={seo.og_title || ""}
              onChange={(e) => handleSeoChange("og_title", e.target.value)}
            />
          </div>

          <div className="bf-group bf-full">
            <label className="bf-label">Open Graph description</label>
            <textarea
              className="bf-textarea"
              value={seo.og_description || ""}
              onChange={(e) => handleSeoChange("og_description", e.target.value)}
            />
          </div>

          <div className="bf-group bf-full">
            <label className="bf-label">Open Graph image URL</label>
            <input
              className="bf-input"
              placeholder="Leave blank to use featured image"
              value={seo.og_image || ""}
              onChange={(e) => handleSeoChange("og_image", e.target.value)}
            />
            {previewImage && (
              <img src={previewImage} alt="Social preview" className="bf-preview" />
            )}
          </div>

          <div className="bf-group bf-full">
            <label className="bf-label">Twitter / X title</label>
            <input
              className="bf-input"
              value={seo.twitter_title || ""}
              onChange={(e) => handleSeoChange("twitter_title", e.target.value)}
            />
          </div>

          <div className="bf-group bf-full">
            <label className="bf-label">Twitter / X description</label>
            <textarea
              className="bf-textarea"
              value={seo.twitter_description || ""}
              onChange={(e) => handleSeoChange("twitter_description", e.target.value)}
            />
          </div>

          <div className="bf-group bf-full">
            <label className="bf-label">Twitter / X image URL</label>
            <input
              className="bf-input"
              placeholder="Leave blank to use OG image"
              value={seo.twitter_image || ""}
              onChange={(e) => handleSeoChange("twitter_image", e.target.value)}
            />
          </div>
        </div>
      )}

      {subTab !== "preview" && (
        <div className="bst-card">
          {loading ? (
            <p className="bf-hint" style={{ margin: 0 }}>Loading platform status…</p>
          ) : (
            <>
              <div className="bst-row">
                <strong>{platformMeta?.label || subTab}</strong>
                {platformMeta?.connected ? (
                  <span className="bst-badge bst-badge-success">
                    Connected{platformMeta.account_label ? ` · ${platformMeta.account_label}` : ""}
                  </span>
                ) : (
                  <span className="bst-badge bst-badge-warn">Not connected</span>
                )}
                {editingId && <ShareStatusBadge share={platformShare} />}
              </div>

              {!platformMeta?.connected && (
                <p className="bst-error" style={{ margin: "0 0 12px" }}>
                  Not connected —{" "}
                  <Link href="/admin/blog/social" style={{ color: "#0d9488", fontWeight: 700 }}>
                    connect in Social media settings
                  </Link>
                  .
                </p>
              )}

              {editingId && form.status === "publish" && platformCfg.enabled && (
                <div className="bst-actions">
                  <button
                    type="button"
                    className="bst-btn"
                    disabled={Boolean(actionBusy)}
                    onClick={handleRetry}
                  >
                    {actionBusy === `retry-${subTab}` ? "Retrying…" : "Retry share"}
                  </button>
                </div>
              )}

              {platformShare?.error_message && (
                <p className="bst-error" style={{ marginTop: 12 }}>
                  Last error: {platformShare.error_message}
                </p>
              )}

              <div className="bf-group bf-full" style={{ marginTop: 16 }}>
                <label className="bf-check-row">
                  <input
                    type="checkbox"
                    checked={!!platformCfg.enabled}
                    onChange={(e) => updatePlatformCfg({ enabled: e.target.checked })}
                  />
                  <span>Share to {platformMeta?.shortLabel || subTab} when published</span>
                </label>
              </div>

              <div className="bf-group bf-full">
                <label className="bf-label">
                  Custom message
                  <span className="bf-hint"> (optional — uses SEO title/description + link if blank)</span>
                </label>
                <textarea
                  className="bf-textarea"
                  placeholder={`Message for ${platformMeta?.label || subTab}…`}
                  value={platformCfg.message || ""}
                  onChange={(e) => updatePlatformCfg({ message: e.target.value })}
                  maxLength={platformMeta?.maxLength || 5000}
                />
                {platformMeta?.maxLength && (
                  <div className="bf-char">
                    {(platformCfg.message || "").length} / {platformMeta.maxLength}
                  </div>
                )}
              </div>

              <div className="bf-group bf-full">
                <label className="bf-label">Preview</label>
                <div className="bst-preview-box">{previewMessage || "Add a title or custom message."}</div>
              </div>

              {platformMeta?.requiresImage && !previewImage && (
                <p className="bst-error" style={{ marginTop: 8 }}>
                  This platform requires a featured or OG image before sharing.
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
