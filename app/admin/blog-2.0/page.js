"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import * as api from "./services/blog20Service";
import "./blog-2.0.css";

export default function Blog20OverviewPage() {
  const router = useRouter();
  const { loading: authLoading, canView } = useAuth();
  const [data, setData] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

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
      const res = await api.getOverview();
      setData(res);
    } catch (err) {
      setError(err.message || "Failed to load Blog-2.0");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="b20-page">
        <p>Loading Blog-2.0…</p>
      </div>
    );
  }

  if (!canView("blog_2_0")) return null;

  const checklist = data?.checklist;
  const pct = checklist?.ready_percent ?? 0;

  return (
    <div className="b20-page">
      <div className="b20-hero">
        <h1>Blog-2.0</h1>
        <p>
          Bright CRM project — AI blog writing, website drafts, and MailerLite newsletter
          automation. Isolated from the main Tech2Globe Blog module.
        </p>
      </div>

      {error && <div className="b20-alert err">{error}</div>}

      <div className="b20-grid">
        <div className="b20-card">
          <h2>Setup progress</h2>
          <div className="b20-progress">
            <span style={{ width: `${pct}%` }} />
          </div>
          <p style={{ margin: "0 0 1rem", color: "#64748b", fontSize: "0.9rem" }}>
            {pct}% of required MailerLite + team settings configured
          </p>
          <Link href="/admin/blog-2.0/setup" className="b20-btn b20-btn-primary">
            Open setup checklist
          </Link>
        </div>

        <div className="b20-card">
          <h2>Quick links</h2>
          <div className="b20-actions">
            <Link href="/admin/blog-2.0/mailerlite" className="b20-btn b20-btn-secondary">
              MailerLite settings
            </Link>
            <Link href="/admin/blog-2.0/agent" className="b20-btn b20-btn-secondary">
              Blog Agent
            </Link>
            <Link href="/admin/blog-2.0/automations" className="b20-btn b20-btn-secondary">
              Automations
            </Link>
          </div>
        </div>

        <div className="b20-card">
          <h2>Build phases</h2>
          {(data?.phases || []).map((p) => (
            <div key={p.id} className="b20-phase">
              <span>{p.label}</span>
              <span className={`b20-badge ${p.status}`}>{p.status}</span>
            </div>
          ))}
        </div>

        <div className="b20-card">
          <h2>Project</h2>
          <p style={{ margin: 0, fontSize: "0.92rem", lineHeight: 1.6, color: "#475569" }}>
            <strong>Name:</strong> {data?.settings?.project_name || "Bright CRM"}
            <br />
            <strong>Site:</strong>{" "}
            <a href={data?.settings?.client_site_url} target="_blank" rel="noreferrer">
              Bright CRM
            </a>
            <br />
            <strong>Blog:</strong> MailerLite site (manual publish pack)
            <br />
            <strong>Schedule:</strong> Weekly Monday 12:00 IST
            <br />
            <strong>Newsletter send:</strong>{" "}
            {data?.settings?.newsletter_send_timing === "on_approve"
              ? "On approve"
              : "Monday 12:00 IST"}
            <br />
            <strong>Newsletter format:</strong>{" "}
            {data?.settings?.newsletter_mode === "excerpt_link"
              ? "Excerpt + link"
              : "Full article (default — confirm with client)"}
            <br />
            <strong>Public API:</strong>{" "}
            {data?.public_api_configured ? "Configured" : "Set BACKEND_PUBLIC_URL on server"}
          </p>
        </div>
      </div>
    </div>
  );
}
