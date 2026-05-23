"use client";

import { useAuth } from "../context/AuthContext";

/** Shown when user has view-only access to the active module */
export default function ReadOnlyBanner({ moduleKey }) {
  const { isReadOnly } = useAuth();
  if (!moduleKey || !isReadOnly?.(moduleKey)) return null;

  return (
    <div
      style={{
        padding: "12px 16px",
        marginBottom: 20,
        borderRadius: 10,
        background: "#fffbeb",
        border: "1px solid #fde68a",
        color: "#92400e",
        fontSize: 14,
      }}
    >
      <strong>View only</strong> — you can browse this module but cannot add, edit,
      or delete.
    </div>
  );
}
