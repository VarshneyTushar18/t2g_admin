"use client";

import { useEffect, useRef } from "react";
import * as api from "../services/blog20Service";
import { blog20SettingsEqual, draftListsEqual } from "../utils/draftListStable";

export const BLOG20_POLL_MS = 12_000;

export function botStatusEqual(a, b) {
  if (!a && !b) return true;
  if (!a || !b) return false;
  return (
    a.bot_busy === b.bot_busy &&
    a.waiting_otp === b.waiting_otp &&
    a.session_status === b.session_status &&
    a.session_message === b.session_message &&
    a.job?.phase === b.job?.phase &&
    a.job?.step === b.job?.step &&
    a.job?.draft_id === b.job?.draft_id &&
    a.job?.message === b.job?.message &&
    a.job?.percent === b.job?.percent
  );
}

/**
 * One timer, one paint: bot status + drafts + settings together (stops staggered UI flicker).
 */
export function useBlog20CombinedPoll(active, applySync) {
  const inFlight = useRef(false);
  const applyRef = useRef(applySync);
  applyRef.current = applySync;

  useEffect(() => {
    if (!active) return undefined;

    const poll = async () => {
      if (inFlight.current) return;
      inFlight.current = true;
      try {
        const [bot, list, settings] = await Promise.all([
          api.getMailerLiteBotStatus(),
          api.listDrafts(),
          api.getSettings(),
        ]);
        applyRef.current?.({ bot, drafts: list, settings });
      } catch {
        /* ignore background poll errors */
      } finally {
        inFlight.current = false;
      }
    };

    poll();
    const id = setInterval(poll, BLOG20_POLL_MS);
    return () => clearInterval(id);
  }, [active]);
}

export function mergeLiveSnapshot(prev, { bot, drafts, settings }) {
  if (!prev) {
    return { bot, drafts: drafts || [], settings };
  }
  const nextBot = botStatusEqual(prev.bot, bot) ? prev.bot : bot;
  const nextDrafts = draftListsEqual(prev.drafts, drafts) ? prev.drafts : drafts;
  const nextSettings = blog20SettingsEqual(prev.settings, settings)
    ? prev.settings
    : settings;
  if (
    nextBot === prev.bot &&
    nextDrafts === prev.drafts &&
    nextSettings === prev.settings
  ) {
    return prev;
  }
  return { bot: nextBot, drafts: nextDrafts, settings: nextSettings };
}
