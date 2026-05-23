"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";

/**
 * @param {{ value: string, onChange: (v: string) => void, placeholder?: string, required?: boolean, minLength?: number, variant?: 'dark' | 'light', id?: string }} props
 */
export default function PasswordInput({
  value,
  onChange,
  placeholder = "Password",
  required = false,
  minLength,
  variant = "light",
  id,
}) {
  const [visible, setVisible] = useState(false);
  const isDark = variant === "dark";

  return (
    <>
      <style>{`
        .pw-wrap {
          position: relative;
          width: 100%;
        }
        .pw-wrap input {
          width: 100%;
          box-sizing: border-box;
          padding: 12px 44px 12px 14px;
          border-radius: 10px;
          font-size: 14px;
          transition: border 0.2s;
        }
        .pw-wrap.dark input {
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }
        .pw-wrap.dark input:focus {
          outline: none;
          border-color: #6b52f5;
        }
        .pw-wrap.light input {
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #0f172a;
        }
        .pw-wrap.light input:focus {
          outline: none;
          border-color: #2563eb;
        }
        .pw-eye {
          position: absolute;
          right: 10px;
          top: 50%;
          transform: translateY(-50%);
          display: flex;
          align-items: center;
          justify-content: center;
          width: 32px;
          height: 32px;
          padding: 0;
          border: none;
          background: transparent;
          cursor: pointer;
          border-radius: 6px;
          color: ${isDark ? "#9ca3af" : "#64748b"};
        }
        .pw-eye:hover {
          color: ${isDark ? "#fff" : "#0f172a"};
          background: ${isDark ? "rgba(255,255,255,0.08)" : "#f1f5f9"};
        }
        .pw-eye:focus-visible {
          outline: 2px solid ${isDark ? "#6b52f5" : "#2563eb"};
          outline-offset: 2px;
        }
      `}</style>
      <div className={`pw-wrap ${isDark ? "dark" : "light"}`}>
        <input
          id={id}
          type={visible ? "text" : "password"}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          minLength={minLength}
          autoComplete={isDark ? "current-password" : "new-password"}
        />
        <button
          type="button"
          className="pw-eye"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
          tabIndex={0}
        >
          {visible ? <EyeOff size={18} strokeWidth={2} /> : <Eye size={18} strokeWidth={2} />}
        </button>
      </div>
    </>
  );
}
