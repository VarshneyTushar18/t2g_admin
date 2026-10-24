/** Fields that affect Drafts list UI — ignore noisy timestamps on poll. */
export function draftRowKey(d) {
  if (!d) return "";
  return [
    d.id,
    d.title,
    d.mailerlite_push_status,
    d.mailerlite_push_step,
    d.mailerlite_push_error,
  ].join("\0");
}

export function draftListsEqual(a, b) {
  if (a === b) return true;
  if (!a || !b || a.length !== b.length) return false;
  for (let i = 0; i < a.length; i += 1) {
    if (draftRowKey(a[i]) !== draftRowKey(b[i])) return false;
  }
  return true;
}

const SETTINGS_UI_KEYS = [
  "mailerlite_session_status",
  "mailerlite_session_message",
  "mailerlite_bot_waiting_otp",
  "mailerlite_login_email_hint",
  "mailerlite_session_needed_at",
  "mailerlite_allow_direct_publish",
];

export function blog20SettingsEqual(a, b) {
  if (a === b) return true;
  if (!a || !b) return false;
  for (const k of SETTINGS_UI_KEYS) {
    if (a[k] !== b[k]) return false;
  }
  return true;
}
