"use client";

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

/**
 * @param {object} props
 * @param {boolean} props.active
 * @param {object|null} [props.botStatus] — from useBlog20BotWatch (parent polls once)
 */
export default function BotPushProgress({
  active,
  onComplete,
  canEdit = false,
  botStatus: status = null,
}) {
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
          Bot paused for verification — submit the OTP from the <strong>bot login email</strong>{" "}
          in the yellow banner above.
        </p>
      )}

      {canEdit && (waitingOtp || busy) && (
        <button
          type="button"
          className="b20-btn b20-btn-secondary"
          style={{ marginTop: "0.75rem" }}
          onClick={async () => {
            if (!confirm("Cancel this push and unlock the bot?")) return;
            try {
              await api.cancelMailerLiteBot();
              if (onComplete) onComplete({ bot_busy: false });
            } catch {
              /* ignore */
            }
          }}
        >
          Cancel stuck push
        </button>
      )}

      {job?.phase === "done" && (
        <p style={{ margin: "0.5rem 0 0", fontSize: "0.82rem", color: "#15803d" }}>
          Draft saved on MailerLite. Open MailerLite and click Publish when ready.
        </p>
      )}
    </div>
  );
}
