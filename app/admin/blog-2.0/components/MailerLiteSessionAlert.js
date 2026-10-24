"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as api from "../services/blog20Service";

/**
 * @param {object} props
 * @param {object|null} props.settings
 * @param {object|null} [props.botStatus] — when set, parent owns polling (no internal API calls)
 */
export default function MailerLiteSessionAlert({
  settings,
  canEdit = false,
  onRefresh,
  botStatus: botStatusProp = undefined,
}) {
  const [otp, setOtp] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [otpError, setOtpError] = useState("");
  const [otpSuccess, setOtpSuccess] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [bannerOpen, setBannerOpen] = useState(false);
  const onRefreshRef = useRef(onRefresh);
  onRefreshRef.current = onRefresh;

  const status = settings?.mailerlite_session_status;
  const settingsWantOtp =
    status === "awaiting_otp" || Boolean(settings?.mailerlite_bot_waiting_otp);
  const botStatus = botStatusProp ?? null;
  const sessionFromBot = botStatus?.session_status;
  const effectiveStatus =
    sessionFromBot && sessionFromBot !== "ok" ? sessionFromBot : status;
  const waitingOtp =
    Boolean(botStatus?.waiting_otp) ||
    settingsWantOtp;

  const wantsBanner =
    waitingOtp ||
    (effectiveStatus && effectiveStatus !== "ok");

  useEffect(() => {
    if (wantsBanner) {
      setBannerOpen(true);
      return undefined;
    }
    if (!bannerOpen) return undefined;
    const t = setTimeout(() => setBannerOpen(false), 2000);
    return () => clearTimeout(t);
  }, [wantsBanner, bannerOpen]);

  if (!bannerOpen) return null;

  const isOtp = waitingOtp || effectiveStatus === "awaiting_otp";
  const title = isOtp
    ? "MailerLite verification code required"
    : "MailerLite session expired";

  const loginHint =
    botStatus?.login_email_hint ||
    settings?.mailerlite_login_email_hint ||
    null;

  const handleCancelStuck = async () => {
    if (!canEdit) return;
    if (
      !confirm(
        "Cancel the stuck MailerLite push? You can push again after entering OTP from the bot login email.",
      )
    ) {
      return;
    }
    setCancelling(true);
    setOtpError("");
    try {
      const res = await api.cancelMailerLiteBot();
      setOtpSuccess(res.message || "Push cancelled. Try again with a fresh OTP.");
      if (onRefresh) onRefresh();
    } catch (err) {
      setOtpError(err.message || "Cancel failed");
    } finally {
      setCancelling(false);
    }
  };

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
            The bot on the <strong>server</strong> is not the same as MailerLite open in your
            browser. Check the inbox for{" "}
            <strong>{loginHint || "the bot login email saved in MailerLite settings"}</strong>{" "}
            for a verification code, enter it below while the push is running.
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
              Bot is running and waiting for your code… (waits up to ~15 minutes)
            </p>
          )}
          {canEdit && (waitingOtp || botStatus?.bot_busy) && (
            <button
              type="button"
              className="b20-btn b20-btn-secondary"
              style={{ marginTop: "0.75rem" }}
              disabled={cancelling}
              onClick={handleCancelStuck}
            >
              {cancelling ? "Stopping…" : "Stop bot"}
            </button>
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
