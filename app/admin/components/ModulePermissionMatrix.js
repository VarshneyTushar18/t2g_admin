"use client";

import {
  PERMISSION_ACTIONS,
  hasWrite,
  setRowEnabled,
  setRowViewOnly,
} from "@/lib/modulePermissions";

export default function ModulePermissionMatrix({
  matrix,
  onChange,
  disabled = false,
}) {
  const toggleEnabled = (key) => {
    onChange(
      matrix.map((row) =>
        row.key === key ? setRowEnabled(row, !row.enabled) : row,
      ),
    );
  };

  const setViewOnly = (key) => {
    onChange(matrix.map((row) => (row.key === key ? setRowViewOnly(row) : row)));
  };

  const isPermChecked = (row, permId) => {
    if (permId === "write") return hasWrite(row);
    return Boolean(row[permId]);
  };

  const togglePerm = (key, perm) => {
    onChange(
      matrix.map((row) => {
        if (row.key !== key) return row;
        let next;
        if (perm === "write") {
          const on = !hasWrite(row);
          next = { ...row, add: on, edit: on };
        } else {
          next = { ...row, [perm]: !row[perm] };
        }
        if (!next.view && !hasWrite(next) && !next.delete) {
          return { ...next, enabled: false };
        }
        return {
          ...next,
          enabled: true,
          view: next.view || hasWrite(next) || next.delete,
        };
      }),
    );
  };

  const setAllPerms = (key, on) => {
    onChange(
      matrix.map((row) =>
        row.key === key
          ? {
              ...row,
              enabled: on,
              view: on,
              add: on,
              edit: on,
              delete: on,
            }
          : row,
      ),
    );
  };

  return (
    <div className="perm-matrix">
      <div className="perm-matrix-head">
        <span className="perm-col-module">Access modules</span>
        {PERMISSION_ACTIONS.map((a) => (
          <span key={a.id} className="perm-col-action">
            {a.label}
          </span>
        ))}
        <span className="perm-col-quick">Quick</span>
      </div>

      {matrix.map((row) => (
        <div
          key={row.key}
          className={`perm-row${row.enabled ? " is-on" : ""}`}
        >
          <div className="perm-module">
            <label className="perm-enable">
              <input
                type="checkbox"
                checked={row.enabled}
                disabled={disabled}
                onChange={() => toggleEnabled(row.key)}
              />
              <span>{row.label}</span>
            </label>
          </div>

          {PERMISSION_ACTIONS.map((a) => (
            <div key={a.id} className="perm-cell">
              <input
                type="checkbox"
                checked={isPermChecked(row, a.id)}
                disabled={disabled || !row.enabled}
                onChange={() => togglePerm(row.key, a.id)}
                aria-label={`${row.label} ${a.label}`}
              />
            </div>
          ))}

          <div className="perm-quick">
            <button
              type="button"
              className="perm-quick-btn"
              disabled={disabled || !row.enabled}
              onClick={() => setAllPerms(row.key, true)}
            >
              All
            </button>
            <button
              type="button"
              className="perm-quick-btn view-only"
              disabled={disabled || !row.enabled}
              onClick={() => setViewOnly(row.key)}
            >
              View only
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
