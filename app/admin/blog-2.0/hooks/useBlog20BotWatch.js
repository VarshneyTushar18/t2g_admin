"use client";

import { useEffect, useRef, useState } from "react";
import * as api from "../services/blog20Service";

import { botStatusEqual } from "./useBlog20CombinedPoll";

const POLL_MS = 12_000;

/**
 * Single poller for MailerLite bot status (avoids duplicate /mailerlite/bot/status storms).
 */
export function useBlog20BotWatch(active, { onTick } = {}) {
  const [status, setStatus] = useState(null);
  const inFlight = useRef(false);
  const lastStatusRef = useRef(null);
  const onTickRef = useRef(onTick);
  onTickRef.current = onTick;

  useEffect(() => {
    if (!active) {
      return undefined;
    }

    const poll = async () => {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        const s = await api.getMailerLiteBotStatus();
        const prev = lastStatusRef.current;
        const changed = !botStatusEqual(prev, s);
        lastStatusRef.current = s;
        setStatus((p) => (botStatusEqual(p, s) ? p : s));
        const needsDraftSync =
          changed || s.bot_busy || s.waiting_otp || s.job?.phase === "running";
        if (needsDraftSync) {
          await onTickRef.current?.(s);
        }
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
