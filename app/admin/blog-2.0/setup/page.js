"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import * as api from "../services/blog20Service";
import "../blog-2.0.css";

export default function Blog20SetupPage() {
  const router = useRouter();
  const { loading: authLoading, canView } = useAuth();
  const [checklist, setChecklist] = useState(null);
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
    try {
      const res = await api.getChecklist();
      setChecklist(res.checklist);
    } catch (err) {
      setError(err.message || "Failed to load checklist");
    } finally {
      setLoading(false);
    }
  };

  if (authLoading || loading) {
    return <div className="b20-page"><p>Loading…</p></div>;
  }

  return (
    <div className="b20-page">
      <div className="b20-hero">
        <h1>Setup checklist</h1>
        <p>What we need from you and the client before Blog-2.0 goes live.</p>
      </div>

      {error && <div className="b20-alert err">{error}</div>}

      <div className="b20-card">
        <h2>
          Required items ({checklist?.ready_percent ?? 0}% done in admin)
        </h2>
        <ul className="b20-checklist">
          {(checklist?.items || []).map((item) => (
            <li key={item.id}>
              <span
                className={`b20-dot ${
                  item.done === true ? "done" : item.done === false ? "pending" : "optional"
                }`}
              />
              <div>
                <strong>
                  {item.label}
                  {item.required ? "" : " (optional)"}
                </strong>
                <div style={{ color: "#64748b", fontSize: "0.85rem", marginTop: "0.2rem" }}>
                  {item.hint}
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <div className="b20-card" style={{ marginTop: "1rem" }}>
        <h2>What to send us</h2>
        <ol style={{ margin: 0, paddingLeft: "1.25rem", lineHeight: 1.7, color: "#475569" }}>
          <li>MailerLite API token (Integrations → MailerLite API)</li>
          <li>Verified sender email + display name for newsletters</li>
          <li>Subscriber group ID for campaign audience</li>
          <li>Team emails for draft approval</li>
          <li>Client site URL (Bright CRM / MailerLite preview)</li>
          <li>AI keys — super admin sets in Connect → AI Integrations</li>
          <li>Microsoft Teams webhook URL (optional)</li>
          <li>Confirm: full article in email vs excerpt + link</li>
          <li>Confirm: weekly or monthly schedule + timezone</li>
        </ol>
        <div className="b20-actions" style={{ marginTop: "1rem" }}>
          <Link href="/admin/blog-2.0/mailerlite" className="b20-btn b20-btn-primary">
            Configure MailerLite
          </Link>
          <Link href="/admin/blog-2.0" className="b20-btn b20-btn-secondary">
            Back to overview
          </Link>
        </div>
      </div>
    </div>
  );
}
