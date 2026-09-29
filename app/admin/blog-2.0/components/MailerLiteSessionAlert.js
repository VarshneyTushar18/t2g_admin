"use client";

import Link from "next/link";

export default function MailerLiteSessionAlert({ settings }) {
  const status = settings?.mailerlite_session_status;
  if (!status || status === "ok") return null;

  const isOtp = status === "awaiting_otp";
  const title = isOtp
    ? "MailerLite OTP required — session refresh needed"
    : "MailerLite session expired — refresh needed";

  return (
    <div
      className="b20-alert err"
      style={{ borderLeft: "4px solid #f59e0b", marginBottom: "1rem" }}
      role="alert"
    >
      <strong>{title}</strong>
      {settings?.mailerlite_session_message && (
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem" }}>
          {settings.mailerlite_session_message}
        </p>
      )}
      <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>
        <strong>On Windows PC:</strong> run <code>npm run blog20:save-session</code>
        {isOtp ? " → enter the email OTP in Chrome" : ""} → wait for Create a post → copy{" "}
        <code>mailerlite-session.json</code> to the server.
      </p>
      <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem" }}>
        <Link href="/admin/blog-2.0/mailerlite">Open MailerLite settings</Link>
        {settings?.mailerlite_session_needed_at
          ? ` · Alert since ${new Date(settings.mailerlite_session_needed_at).toLocaleString()}`
          : ""}
      </p>
    </div>
  );
}
