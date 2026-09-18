"use client";

import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../context/AuthContext";
import "../blog-2.0.css";

export default function Blog20AutomationsPage() {
  const router = useRouter();
  const { loading: authLoading, canView } = useAuth();

  useEffect(() => {
    if (authLoading) return;
    if (!canView("blog_2_0")) router.replace("/admin");
  }, [authLoading, canView, router]);

  if (authLoading) {
    return <div className="b20-page"><p>Loading…</p></div>;
  }

  return (
    <div className="b20-page">
      <div className="b20-hero">
        <h1>Automations</h1>
        <p>Scheduled research, writing, website draft, and MailerLite newsletter — Phase 2.</p>
      </div>

      <div className="b20-card">
        <h2>Coming next</h2>
        <p style={{ lineHeight: 1.6, color: "#475569", margin: "0 0 1rem" }}>
          This page will run Blog-2.0 on a weekly/monthly schedule: pick topics → AI writes →
          save website draft → create MailerLite newsletter draft → email team for approval.
        </p>
        <p style={{ lineHeight: 1.6, color: "#475569", margin: "0 0 1rem" }}>
          <strong>First:</strong> complete the{" "}
          <Link href="/admin/blog-2.0/setup">setup checklist</Link> and{" "}
          <Link href="/admin/blog-2.0/mailerlite">MailerLite settings</Link>.
        </p>
        <div className="b20-phase">
          <span>Phase 1 — MailerLite connection</span>
          <span className="b20-badge active">In progress</span>
        </div>
        <div className="b20-phase">
          <span>Phase 2 — Newsletter draft on each post</span>
          <span className="b20-badge pending">Pending</span>
        </div>
        <div className="b20-phase">
          <span>Phase 3 — Scheduler + topic queue</span>
          <span className="b20-badge pending">Pending</span>
        </div>
      </div>
    </div>
  );
}
