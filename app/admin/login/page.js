"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import Script from "next/script";


export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cfToken, setCfToken] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [shake, setShake] = useState(false);
  const [focused, setFocused] = useState("");
  const [scriptReady, setScriptReady] = useState(false);

  const turnstileRef = useRef(null);
  const widgetIdRef = useRef(null);

  // ── Poll for window.turnstile instead of relying on onLoad ────
  useEffect(() => {
    const interval = setInterval(() => {
      if (window.turnstile) {
        clearInterval(interval);
        setScriptReady(true);
      }
    }, 200);
    return () => clearInterval(interval);
  }, []);

  // ── Render Turnstile widget once script is ready ───────────────
  const renderTurnstile = useCallback(() => {
    const siteKey = process.env.NEXT_PUBLIC_CF_TURNSTILE_SITE_KEY;

    if (!window.turnstile || !turnstileRef.current || !siteKey) {
      console.error("Turnstile error → missing sitekey", { siteKey });
      return;
    }

    if (widgetIdRef.current !== null) return;

    widgetIdRef.current = window.turnstile.render(turnstileRef.current, {
      sitekey: siteKey,
      theme: "dark",
      callback: (token) => setCfToken(token),
      "expired-callback": () => setCfToken(""),
      "error-callback": () => setCfToken(""),
    });
  }, []);

  useEffect(() => {
    if (scriptReady) renderTurnstile();
  }, [scriptReady, renderTurnstile]);

  // ── Reset Turnstile after failed attempt ───────────────────────
  const resetTurnstile = useCallback(() => {
    if (window.turnstile && widgetIdRef.current !== null) {
      window.turnstile.reset(widgetIdRef.current);
      setCfToken("");
    }
  }, []);

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 600);
  };

  // ── Submit ─────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!cfToken) {
      setError("Please complete the security check.");
      triggerShake();
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/auth/login`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json", // ✅ bypass ngrok challenge page
          },
          credentials: "include", // ✅ fixed: uncommented so httpOnly cookie is received
          body: JSON.stringify({ email, password, cfToken }),
        },
      );

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Invalid email or password.");
      }

      router.push("/admin/leads");
    } catch (err) {
      setError(err.message);
      resetTurnstile();
      triggerShake();
      setLoading(false);
    }
  };

  return (
    <>
      <Script
        src="https://challenges.cloudflare.com/turnstile/v0/api.js"
        strategy="afterInteractive"
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        body {
          background: #07080d;
          min-height: 100vh;
          font-family: 'DM Sans', sans-serif;
        }

        .scene {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
          position: relative;
          overflow: hidden;
          background: radial-gradient(ellipse 80% 60% at 50% -10%, #1a1060 0%, #07080d 60%);
        }

        .scene::before {
          content: '';
          position: absolute; inset: 0;
          background-image:
            linear-gradient(rgba(255,255,255,.03) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,255,255,.03) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 0%, black 20%, transparent 80%);
        }

        .orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(90px);
          opacity: .35;
          pointer-events: none;
        }
        .orb-1 { width: 500px; height: 500px; background: #4f35d6; top: -180px; left: -120px; }
        .orb-2 { width: 350px; height: 350px; background: #d63578; bottom: -100px; right: -80px; }
        .orb-3 { width: 200px; height: 200px; background: #35b8d6; top: 40%; left: 60%; }

        .card {
          position: relative;
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,.04);
          border: 1px solid rgba(255,255,255,.10);
          border-radius: 20px;
          padding: 44px 40px 40px;
          backdrop-filter: blur(24px);
          box-shadow: 0 32px 80px rgba(0,0,0,.5), inset 0 1px 0 rgba(255,255,255,.08);
          opacity: 0;
          transform: translateY(28px);
          animation: cardIn .7s cubic-bezier(.22,1,.36,1) .1s forwards;
        }

        @keyframes cardIn {
          to { opacity: 1; transform: translateY(0); }
        }

        .card.shake {
          animation: cardIn 0s forwards, shakeIt .5s ease;
        }
        @keyframes shakeIt {
          0%,100% { transform: translateX(0); }
          20%      { transform: translateX(-8px); }
          40%      { transform: translateX(8px); }
          60%      { transform: translateX(-5px); }
          80%      { transform: translateX(5px); }
        }

        .logo-wrap {
          display: flex; align-items: center; gap: 10px;
          margin-bottom: 30px;
        }
        .logo-icon {
          width: 38px; height: 38px;
          background: linear-gradient(135deg, #6b52f5, #d63578);
          border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px;
          box-shadow: 0 4px 20px rgba(107,82,245,.4);
        }
        .logo-text {
          font-family: 'Syne', sans-serif;
          font-size: 17px; font-weight: 700;
          color: #fff; letter-spacing: .4px;
        }
        .logo-text span { color: #9b8aff; }

        h1 {
          font-family: 'Syne', sans-serif;
          font-size: 26px; font-weight: 800;
          color: #fff; line-height: 1.2;
          margin-bottom: 6px;
        }
        .subtitle {
          font-size: 13.5px; color: rgba(255,255,255,.45);
          margin-bottom: 32px; font-weight: 300;
        }

        .field { margin-bottom: 18px; }
        .field label {
          display: block;
          font-size: 12px; font-weight: 500;
          color: rgba(255,255,255,.5);
          letter-spacing: .6px; text-transform: uppercase;
          margin-bottom: 8px;
          transition: color .2s;
        }
        .field.active label { color: #9b8aff; }

        .input-wrap {
          position: relative;
          display: flex; align-items: center;
        }
        .input-wrap .icon {
          position: absolute; left: 14px;
          color: rgba(255,255,255,.25);
          width: 16px; height: 16px;
          transition: color .2s;
        }
        .field.active .input-wrap .icon { color: #9b8aff; }

        input[type="email"],
        input[type="password"],
        input[type="text"] {
          width: 100%;
          background: rgba(255,255,255,.05);
          border: 1px solid rgba(255,255,255,.10);
          border-radius: 10px;
          padding: 12px 14px 12px 40px;
          font-size: 14px; font-family: 'DM Sans', sans-serif;
          color: #fff;
          outline: none;
          transition: border-color .2s, background .2s, box-shadow .2s;
        }
        input::placeholder { color: rgba(255,255,255,.25); }
        input:focus {
          border-color: rgba(155,138,255,.6);
          background: rgba(155,138,255,.07);
          box-shadow: 0 0 0 3px rgba(155,138,255,.12);
        }

        .eye-btn {
          position: absolute; right: 12px;
          background: none; border: none; cursor: pointer;
          color: rgba(255,255,255,.3); padding: 4px;
          display: flex; align-items: center;
          transition: color .2s;
        }
        .eye-btn:hover { color: rgba(255,255,255,.7); }

        .cf-wrap { margin-bottom: 22px; }
        .cf-label {
          display: block;
          font-size: 12px; font-weight: 500;
          color: rgba(255,255,255,.5);
          letter-spacing: .6px; text-transform: uppercase;
          margin-bottom: 10px;
        }
        .cf-widget-container {
          border-radius: 10px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,.10);
          background: rgba(255,255,255,.03);
        }
        .cf-widget-container iframe { width: 100% !important; }

        .cf-pending {
          height: 65px;
          display: flex; align-items: center; justify-content: center; gap: 8px;
          font-size: 12.5px; color: rgba(255,255,255,.3);
          border-radius: 10px;
          border: 1px dashed rgba(255,255,255,.10);
          background: rgba(255,255,255,.02);
        }
        .cf-pending-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #f5a623;
          animation: blink 1.2s ease-in-out infinite;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }

        .cf-verified {
          display: flex; align-items: center; gap: 6px;
          font-size: 12px; color: #4ade80;
          margin-top: 8px; padding-left: 2px;
        }

        .error-msg {
          background: rgba(214,53,80,.12);
          border: 1px solid rgba(214,53,80,.3);
          border-radius: 8px;
          padding: 10px 14px;
          font-size: 13px; color: #f87398;
          margin-bottom: 20px;
          display: flex; align-items: center; gap: 8px;
          animation: fadeIn .3s ease;
        }
        @keyframes fadeIn { from { opacity:0; transform: translateY(-4px); } to { opacity:1; transform: translateY(0); } }

        .submit-btn {
          width: 100%;
          background: linear-gradient(135deg, #6b52f5 0%, #9b52d4 100%);
          border: none; border-radius: 10px;
          padding: 14px;
          font-family: 'Syne', sans-serif;
          font-size: 14px; font-weight: 700;
          color: #fff; letter-spacing: .5px;
          cursor: pointer;
          transition: opacity .2s, transform .15s, box-shadow .2s;
          box-shadow: 0 8px 32px rgba(107,82,245,.4);
          display: flex; align-items: center; justify-content: center; gap: 8px;
        }
        .submit-btn:hover:not(:disabled) {
          opacity: .9; transform: translateY(-1px);
          box-shadow: 0 12px 40px rgba(107,82,245,.55);
        }
        .submit-btn:active:not(:disabled) { transform: translateY(1px); }
        .submit-btn:disabled { opacity: .6; cursor: not-allowed; }

        .spinner {
          width: 16px; height: 16px;
          border: 2px solid rgba(255,255,255,.3);
          border-top-color: #fff;
          border-radius: 50%;
          animation: spin .6s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }

        .token-strip {
          margin-top: 22px;
          padding: 10px 14px;
          background: rgba(255,255,255,.03);
          border: 1px solid rgba(255,255,255,.07);
          border-radius: 8px;
          display: flex; align-items: center; gap: 8px;
          font-size: 11.5px; color: rgba(255,255,255,.3);
        }
        .token-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #35d678; flex: 0 0 auto;
          box-shadow: 0 0 6px #35d678;
          animation: pulse 2s ease-in-out infinite;
        }
        @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.4} }

        .divider {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,.08), transparent);
          margin: 28px 0 22px;
        }
      `}</style>

      <div className="scene">
        <div className="orb orb-1" />
        <div className="orb orb-2" />
        <div className="orb orb-3" />

        <div className={`card${shake ? " shake" : ""}`}>
          <div className="logo-wrap">
            <div className="logo-icon">⚡</div>
            <div className="logo-text">
              Tech2<span>Globe</span>
            </div>
          </div>

          <h1>Welcome back</h1>
          <p className="subtitle">Sign in to your admin dashboard</p>

          {error && (
            <div className="error-msg">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
              >
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate>
            <div className={`field${focused === "email" ? " active" : ""}`}>
              <label>Email address</label>
              <div className="input-wrap">
                <svg
                  className="icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m2 7 10 7 10-7" />
                </svg>
                <input
                  type="email"
                  placeholder="admin@tech2globe.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  onFocus={() => setFocused("email")}
                  onBlur={() => setFocused("")}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className={`field${focused === "password" ? " active" : ""}`}>
              <label>Password</label>
              <div className="input-wrap">
                <svg
                  className="icon"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <rect x="3" y="11" width="18" height="11" rx="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
                <input
                  type={showPass ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onFocus={() => setFocused("password")}
                  onBlur={() => setFocused("")}
                  required
                  autoComplete="current-password"
                  style={{ paddingRight: "40px" }}
                />
                <button
                  type="button"
                  className="eye-btn"
                  onClick={() => setShowPass((v) => !v)}
                  tabIndex={-1}
                >
                  {showPass ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            <div className="divider" />

            <div className="cf-wrap">
              <span className="cf-label">Security Verification</span>

              {!scriptReady ? (
                <div className="cf-pending">
                  <div className="cf-pending-dot" />
                  Loading security check…
                </div>
              ) : (
                <div className="cf-widget-container">
                  <div ref={turnstileRef} />
                </div>
              )}

              {cfToken && (
                <div className="cf-verified">
                  <svg
                    width="13"
                    height="13"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M20 6 9 17l-5-5" />
                  </svg>
                  Verified by Cloudflare
                </div>
              )}
            </div>

            <button
              type="submit"
              className="submit-btn"
              disabled={loading || !cfToken}
            >
              {loading ? (
                <>
                  <div className="spinner" /> Authenticating…
                </>
              ) : (
                <>
                  Sign in
                  <svg
                    width="15"
                    height="15"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2.5"
                  >
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="token-strip">
            <div className="token-dot" />
            Session token managed securely by server
          </div>
        </div>
      </div>
    </>
  );
}