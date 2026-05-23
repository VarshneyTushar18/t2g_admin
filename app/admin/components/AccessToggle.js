"use client";

/**
 * Toggle for temporary access (active / suspended).
 */
export default function AccessToggle({ active, disabled, onChange, id }) {
  return (
    <>
      <style>{`
        .access-toggle {
          display: inline-flex;
          align-items: center;
          gap: 10px;
          cursor: ${disabled ? "not-allowed" : "pointer"};
          opacity: ${disabled ? 0.5 : 1};
        }
        .access-toggle input {
          position: absolute;
          opacity: 0;
          width: 0;
          height: 0;
        }
        .access-track {
          width: 44px;
          height: 24px;
          border-radius: 999px;
          background: #cbd5e1;
          position: relative;
          transition: background 0.2s;
          flex-shrink: 0;
        }
        .access-toggle input:checked + .access-track {
          background: #22c55e;
        }
        .access-toggle input:focus-visible + .access-track {
          outline: 2px solid #2563eb;
          outline-offset: 2px;
        }
        .access-thumb {
          position: absolute;
          top: 3px;
          left: 3px;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #fff;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
          transition: transform 0.2s;
        }
        .access-toggle input:checked + .access-track .access-thumb {
          transform: translateX(20px);
        }
        .access-label {
          font-size: 13px;
          font-weight: 500;
          color: #334155;
          user-select: none;
        }
        .access-label.off {
          color: #94a3b8;
        }
      `}</style>
      <label className="access-toggle" htmlFor={id}>
        <input
          id={id}
          type="checkbox"
          checked={active}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
        />
        <span className="access-track" aria-hidden>
          <span className="access-thumb" />
        </span>
        <span className={`access-label ${active ? "" : "off"}`}>
          {active ? "Active" : "Suspended"}
        </span>
      </label>
    </>
  );
}
