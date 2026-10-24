"use client";

import { useEffect, useRef, useState } from "react";
import * as api from "../services/blog20Service";

const POLL_MS = 12_000;

function botStatusEqual(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return (
    a.bot_busy === b.bot_busy &&
    a.waiting_otp === b.waiting_otp &&
    a.session_status === b.session_status &&
    a.session_message === b.session_message &&
    a.job?.phase === b.job?.phase &&
    a.job?.step === b.job?.step &&
    a.job?.draft_id === b.job?.draft_id
  );
}

/**
 * Single poller for MailerLite bot status (avoids duplicate /mailerlite/bot/status storms).
 */
export function useBlog20BotWatch(active, { onTick } = {}) {
  const [status, setStatus] = useState(null);
  const inFlight = useRef(false);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (!active) {
      setStatus(null);
      return undefined;
    }

    const poll = async () => {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        const s = await api.getMailerLiteBotStatus();
        setStatus((prev) => (botStatusEqual(prev, s) ? prev : s));
        await onTickRef.current?.(s);
      } catch {
        /* ignore */
      } finally {
        inFlight.current = false;
      }
    };

    poll();
    const id = setInterval(poll, POLL_MS);
    return () => clearInterval(id);
  }, [active]);

  return status;
}
