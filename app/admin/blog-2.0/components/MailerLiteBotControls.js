"use client";

import { useState } from "react";
import * as api from "../services/blog20Service";

/**
 * Stop / retry controls for the server MailerLite Playwright bot.
 *
 * @param {object|null} props.botStatus
 * @param {object|null} props.processingDraft — draft with mailerlite_push_status === "processing"
 * @param {object|null} [props.retryDraft] — failed draft to offer retry (e.g. last cancelled)
 */
export default function MailerLiteBotControls({
  botStatus,
  processingDraft = null,
  retryDraft = null,
  canEdit = false,
  onRefresh,
  onStartPush,
  /** When no draft to push — e.g. test login from MailerLite settings */
  onStartBot,
}) {
  const [stopping, setStopping] = useState(false);
  const [starting, setStarting] = useState(false);
  const [message, setMessage] = useState("");
  const [err, setErr] = useState("");

  const busy = Boolean(botStatus?.bot_busy);
  const waitingOtp = Boolean(botStatus?.waiting_otp);
  const job = botStatus?.job;
  const ghostPush =
    Boolean(processingDraft) && !busy && !waitingOtp && job?.phase !== "done";

  let stateLabel = "Idle";
  let stateClass = "idle";
  if (waitingOtp) {
    stateLabel = "Waiting for OTP";
    stateClass = "otp";
  } else if (busy || job?.phase === "running") {
    stateLabel = "Running";
    stateClass = "run";
  } else if (ghostPush) {
    stateLabel = "Stuck — draft still marked as pushing";
    stateClass = "stuck";
  } else if (processingDraft) {
    stateLabel = "Pushing…";
    stateClass = "run";
  }

  const showStop = canEdit && (busy || waitingOtp || ghostPush || Boolean(processingDraft));

  const pushTarget = processingDraft || retryDraft;
  const showStartPush =
    canEdit &&
    pushTarget &&
    !busy &&
    !waitingOtp &&
    (ghostPush || retryDraft?.mailerlite_push_status === "failed");

  const showStartBot =
    canEdit && !busy && !waitingOtp && !pushTarget && typeof onStartBot === "function";

  const handleStop = async () => {
    if (
      !confirm(
        "Stop the MailerLite bot? The current push will be cancelled and you can start again after entering OTP if needed.",
      )
    ) {
      return;
    }
    setStopping(true);
    setErr("");
    setMessage("");
    try {
      const res = await api.cancelMailerLiteBot();
      setMessage(res.message || "Bot stopped.");
      if (onRefresh) await onRefresh();
    } catch (e) {
      setErr(e.message || "Failed to stop bot");
    } finally {
      setStopping(false);
    }
  };

  const handleStart = async () => {
    setStarting(true);
    setErr("");
    setMessage("");
    try {
      if (showStartPush && pushTarget && onStartPush) {
        await onStartPush(pushTarget.id, false);
        setMessage(`Push started for draft #${pushTarget.id}.`);
      } else if (showStartBot) {
        const res = await onStartBot();
        setMessage(
          (typeof res === "string" ? res : res?.message) ||
            "Bot started — check status above if MailerLite asks for OTP.",
        );
      }
    } catch (e) {
      setErr(e.message || "Failed to start bot");
    } finally {
      setStarting(false);
    }
  };

  if (!canEdit) return null;

  return (
    <div
      className="b20-card b20-bot-controls"
      style={{
        marginBottom: "1rem",
        borderColor: ghostPush || waitingOtp ? "#f59e0b" : "#e2e8f0",
        background: ghostPush ? "#fffbeb" : "#f8fafc",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          alignItems: "center",
          gap: "0.75rem",
          justifyContent: "space-between",
        }}
      >
        <div>
          <strong style={{ fontSize: "0.95rem" }}>MailerLite bot</strong>
          <div style={{ fontSize: "0.85rem", color: "#64748b", marginTop: "0.2rem" }}>
            <span className={`b20-bot-state b20-bot-state-${stateClass}`}>{stateLabel}</span>
            {pushTarget && (
              <>
                {" "}
                · #{pushTarget.id}
                {pushTarget.title ? ` — ${pushTarget.title}` : ""}
              </>
            )}
            {job?.message && busy && (
              <span style={{ display: "block", marginTop: "0.25rem", color: "#475569" }}>
                {job.message}
              </span>
            )}
          </div>
        </div>
        <div className="b20-actions" style={{ margin: 0 }}>
          {showStop && (
            <button
              type="button"
              className="b20-btn b20-btn-secondary b20-btn-danger"
              disabled={stopping || starting}
              onClick={handleStop}
            >
              {stopping ? "Stopping…" : "Stop bot"}
            </button>
          )}
          {(showStartPush || showStartBot) && (
            <button
              type="button"
              className="b20-btn b20-btn-primary"
              disabled={starting || stopping}
              onClick={handleStart}
            >
              {starting
                ? "Starting…"
                : showStartPush
                  ? ghostPush
                    ? "Retry push"
                    : "Start push"
                  : "Start bot"}
            </button>
          )}
        </div>
      </div>
      {ghostPush && (
        <p style={{ margin: "0.75rem 0 0", fontSize: "0.82rem", color: "#b45309" }}>
          The server lost track of this push. Click <strong>Stop bot</strong>, then{" "}
          <strong>Retry push</strong> and submit OTP when the yellow banner appears.
        </p>
      )}
      {err && (
        <p style={{ color: "#b91c1c", fontSize: "0.85rem", margin: "0.5rem 0 0" }}>{err}</p>
      )}
      {message && (
        <p style={{ color: "#15803d", fontSize: "0.85rem", margin: "0.5rem 0 0" }}>{message}</p>
      )}
    </div>
  );
}
