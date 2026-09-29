"use client";

import { useEffect, useState } from "react";
import * as api from "../services/blog20Service";

const PHASES = [
  "Starting",
  "Checking session",
  "Opening blog",
  "Creating post",
  "Opening editor",
  "Filling content",
  "Saving draft",
];

export default function BotPushProgress({ active, onComplete }) {
  const [status, setStatus] = useState(null);

  useEffect(() => {
    if (!active) {
      setStatus(null);
      return undefined;
    }

    let doneNotified = false;

    const poll = async () => {
      try {
        const s = await api.getMailerLiteBotStatus();
        setStatus(s);
        const job = s.job;
        const finished =
          !s.bot_busy &&
          (job?.phase === "done" || job?.phase === "failed" || !job);
        if (finished && !doneNotified) {
          doneNotified = true;
          if (onComplete) onComplete(s);
        }
      } catch {
        /* ignore poll errors */
      }
    };

    poll();
    const id = setInterval(poll, 2000);
    return () => clearInterval(id);
  }, [active, onComplete]);

  if (!active) return null;

  const job = status?.job;
  const busy = status?.bot_busy;
  const waitingOtp = status?.waiting_otp;
  const percent = job?.percent ?? (busy ? 8 : 0);
  const step = job?.step ?? (busy ? 1 : 0);
  const total = job?.total_steps ?? PHASES.length;
  const message =
    job?.message ||
    (waitingOtp
      ? "Waiting for MailerLite OTP — enter code in the banner above"
      : busy
        ? "MailerLite bot is starting…"
        : "Checking bot status…");

  const phaseLabel = job?.label || PHASES[Math.max(0, step - 1)] || "Working";

  if (!busy && !job && !waitingOtp) return null;

  return (
    <div
      className="b20-card"
      style={{
        marginBottom: "1rem",
        borderColor: waitingOtp ? "#f59e0b" : "#c4b5fd",
        background: waitingOtp ? "#fffbeb" : "#faf5ff",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: "1rem",
          flexWrap: "wrap",
        }}
      >
        <div>
          <strong style={{ color: "#5b21b6" }}>
            {job?.phase === "done"
              ? "Push complete"
              : job?.phase === "failed"
                ? "Push failed"
                : "MailerLite bot running"}
          </strong>
          {job?.draft_title && (
            <div style={{ fontSize: "0.9rem", color: "#475569", marginTop: "0.25rem" }}>
              {job.draft_title}
              {job.draft_id ? ` · #${job.draft_id}` : ""}
            </div>
          )}
        </div>
        <div style={{ fontSize: "0.85rem", color: "#64748b", fontWeight: 600 }}>
          Step {step}/{total} · {phaseLabel}
        </div>
      </div>

      <div className="b20-progress" style={{ marginTop: "0.75rem" }}>
        <span style={{ width: `${Math.max(percent, busy ? 5 : 0)}%` }} />
      </div>

      <p style={{ margin: "0.5rem 0 0", fontSize: "0.88rem", color: "#334155", lineHeight: 1.5 }}>
        {message}
      </p>

      {waitingOtp && (
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.82rem", color: "#b45309" }}>
          Bot paused for verification — submit the OTP code in the yellow banner above.
        </p>
      )}

      {job?.phase === "done" && (
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.82rem", color: "#15803d" }}>
          Draft saved on MailerLite. Open MailerLite and click Publish when ready.
        </p>
      )}
    </div>
  );
}
