"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import * as api from "../services/blog20Service";

export default function MailerLiteSessionAlert({
  settings,
  canEdit = false,
  onRefresh,
}) {
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [botStatus, setBotStatus] = useState(null);

  const status = settings?.mailerlite_session_status;
  const waitingOtp =
    status === "awaiting_otp" ||
    settings?.mailerlite_bot_waiting_otp ||
    botStatus?.waiting_otp;

  useEffect(() => {
    if (!waitingOtp) return undefined;
    const poll = async () => {
      try {
        const s = await api.getMailerLiteBotStatus();
        setBotStatus(s);
        if (s.session_status === "ok" && !s.waiting_otp && onRefresh) {
          onRefresh();
        }
      } catch {
        /* ignore poll errors */
      }
    };
    poll();
    const id = setInterval(poll, 4000);
    return () => clearInterval(id);
  }, [waitingOtp, onRefresh]);

  if ((!status || status === "ok") && !waitingOtp) return null;

  const isOtp = waitingOtp || status === "awaiting_otp";
  const title = isOtp
    ? "MailerLite verification code required"
    : "MailerLite session expired";

  const handleSubmitOtp = async (e) => {
    e.preventDefault();
    if (!canEdit || !otp.trim()) return;
    setSubmitting(true);
    setOtpError("");
    setOtpSuccess("");
    try {
      const res = await api.submitMailerLiteBotOtp(otp.trim());
      setOtpSuccess(res.message || "OTP submitted. Bot will continue automatically.");
      setOtp("");
      if (onRefresh) onRefresh();
    } catch (err) {
      setOtpError(err.message || "Failed to submit OTP");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="b20-alert err"
      style={{ borderLeft: "4px solid #f59e0b", marginBottom: "1rem" }}
      role="alert"
    >
      <strong>{title}</strong>
      {(settings?.mailerlite_session_message || botStatus?.session_message) && (
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.9rem" }}>
          {settings?.mailerlite_session_message || botStatus?.session_message}
        </p>
      )}

      {isOtp ? (
        <div style={{ marginTop: "0.75rem" }}>
          <p style={{ fontSize: "0.85rem", color: "#64748b", margin: "0 0 0.5rem" }}>
            Check the <strong>MailerLite bot login email</strong> for a verification code.
            Enter it below while a push is running — the bot will continue automatically.
          </p>
          {canEdit && (
            <form
              onSubmit={handleSubmitOtp}
              className="b20-actions"
              style={{ alignItems: "center", gap: "0.5rem", flexWrap: "wrap" }}
            >
              <input
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                placeholder="6-digit code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, "").slice(0, 8))}
                disabled={submitting}
                style={{ maxWidth: "160px", letterSpacing: "0.15em" }}
              />
              <button
                type="submit"
                className="b20-btn b20-btn-primary"
                disabled={submitting || otp.length < 4}
              >
                {submitting ? "Submitting…" : "Submit OTP"}
              </button>
            </form>
          )}
          {otpError && (
            <p style={{ color: "#b91c1c", fontSize: "0.85rem", margin: "0.5rem 0 0" }}>
              {otpError}
            </p>
          )}
          {otpSuccess && (
            <p style={{ color: "#15803d", fontSize: "0.85rem", margin: "0.5rem 0 0" }}>
              {otpSuccess}
            </p>
          )}
          {botStatus?.bot_busy && (
            <p style={{ fontSize: "0.8rem", color: "#64748b", margin: "0.5rem 0 0" }}>
              Bot is running and waiting for your code…
            </p>
          )}
        </div>
      ) : (
        <p style={{ margin: "0.75rem 0 0", fontSize: "0.85rem", color: "#64748b" }}>
          Save bot login email and password in MailerLite settings, then push again.
          If that fails, a developer can refresh the session with{" "}
          <code>npm run blog20:save-session</code> on Windows.
        </p>
      )}

      <p style={{ margin: "0.5rem 0 0", fontSize: "0.85rem" }}>
        <Link href="/admin/blog-2.0/mailerlite">MailerLite settings</Link>
        {settings?.mailerlite_session_needed_at
          ? ` · Since ${new Date(settings.mailerlite_session_needed_at).toLocaleString()}`
          : ""}
      </p>
    </div>
  );
}
