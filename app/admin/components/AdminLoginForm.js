"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Turnstile } from "@marsidev/react-turnstile";
import { api } from "@/lib/api";
import { getPostLoginPath } from "@/lib/adminModules";
import { ADMIN_LOGIN_PATH, TEAM_LOGIN_PATH } from "@/lib/authUrls";
import PasswordInput from "./PasswordInput";
import "../admin-mobile.css";

const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY || "";

const COPY = {
  admin: {
    title: "Admin sign in",
    subtitle: "Super administrator access only",
    placeholder: "admin@tech2globe.com",
    wrongPortal:
      "This page is for super administrators. Use the team login link your manager shared.",
  },
  team: {
    title: "Welcome back",
    subtitle: "Sign in to your workspace",
    placeholder: "you@company.com",
    wrongPortal:
      "Super administrators must sign in at the admin login page.",
  },
};

/**
 * @param {"admin" | "team"} portal
 */
export default function AdminLoginForm({ portal }) {
  const router = useRouter();
  const turnstileRef = useRef(null);
  const copy = COPY[portal];

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [cfToken, setCfToken] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const captchaRequired = Boolean(TURNSTILE_SITE_KEY);
  const canSubmit = !loading && (!captchaRequired || cfToken);

  const resetCaptcha = () => {
    setCfToken("");
    turnstileRef.current?.reset();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (captchaRequired && !cfToken) {
      setError("Please complete the security check.");
      return;
    }

    setLoading(true);

    try {
      const data = await api.post("/api/auth/login", {
        email,
        password,
        cfToken: cfToken || undefined,
      });
      const user = data.user;

      if (!user) {
        router.push("/admin");
        return;
      }

      const isSuper = user.role === "super_admin";

      if (portal === "admin" && !isSuper) {
        setError(copy.wrongPortal);
        try {
          await api.post("/api/auth/logout", {});
        } catch {
          /* ignore */
        }
        resetCaptcha();
        return;
      }

      if (portal === "team" && isSuper) {
        setError(copy.wrongPortal);
        try {
          await api.post("/api/auth/logout", {});
        } catch {
          /* ignore */
        }
        resetCaptcha();
        return;
      }

      router.push(getPostLoginPath(user));
    } catch (err) {
      setError(err.message);
      resetCaptcha();
    } finally {
      setLoading(false);
    }
  };

  const otherPath = portal === "admin" ? TEAM_LOGIN_PATH : ADMIN_LOGIN_PATH;
  const otherLabel =
    portal === "admin" ? "Team member? Use team login" : "Super admin? Admin login";

  return (
    <>
      <style>{`
        body {
          margin: 0;
          background: #07080d;
          font-family: system-ui, -apple-system, sans-serif;
        }

        .container {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: radial-gradient(circle at top, #1a1060, #07080d 70%);
        }

        .card {
          width: 100%;
          max-width: 420px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 16px;
          padding: 36px;
          backdrop-filter: blur(20px);
        }

        .logo { margin-bottom: 20px; }

        h1 { color: #fff; margin-bottom: 6px; }

        .subtitle {
          color: #9ca3af;
          margin-bottom: 24px;
        }

        .input-group { margin-bottom: 16px; }

        .input-group input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          color: #fff;
          font-size: 14px;
          box-sizing: border-box;
        }

        .input-group input:focus {
          outline: none;
          border-color: #6b52f5;
        }

        .error {
          color: #f87171;
          font-size: 13px;
          margin-bottom: 12px;
        }

        .btn {
          width: 100%;
          padding: 14px;
          border-radius: 10px;
          border: none;
          background: linear-gradient(135deg, #6b52f5, #9b52d4);
          color: white;
          font-weight: 500;
          cursor: pointer;
        }

        .btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .turnstile-wrap {
          display: flex;
          justify-content: center;
          margin-bottom: 16px;
          min-height: 65px;
        }

        .portal-link {
          display: block;
          margin-top: 20px;
          text-align: center;
          color: #a5b4fc;
          font-size: 13px;
          text-decoration: none;
        }

        .portal-link:hover { text-decoration: underline; }

        @media (max-width: 480px) {
          .container {
            padding: 16px;
            align-items: flex-start;
            padding-top: max(24px, env(safe-area-inset-top));
          }
          .card { padding: 24px 20px; }
          .btn { min-height: 48px; }
        }
      `}</style>

      <div className="container">
        <div className="card">
          <div className="logo">
            <Image
              src="/tech2globe-logo-white.webp"
              alt="Tech2Globe"
              width={180}
              height={50}
              style={{ width: "100%", maxWidth: 180, height: "auto" }}
            />
          </div>

          <h1>{copy.title}</h1>
          <p className="subtitle">{copy.subtitle}</p>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="email"
                placeholder={copy.placeholder}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="input-group">
              <PasswordInput
                variant="dark"
                placeholder="Password"
                value={password}
                onChange={setPassword}
                required
              />
            </div>

            {captchaRequired ? (
              <div className="turnstile-wrap">
                <Turnstile
                  ref={turnstileRef}
                  siteKey={TURNSTILE_SITE_KEY}
                  onSuccess={setCfToken}
                  onExpire={() => setCfToken("")}
                  onError={() => {
                    setCfToken("");
                    setError(
                      "Security check failed. Add this domain in Cloudflare Turnstile (Admin Login widget).",
                    );
                  }}
                  options={{
                    theme: "dark",
                    size: "normal",
                  }}
                />
              </div>
            ) : null}

            <button type="submit" className="btn" disabled={!canSubmit}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>

          <a href={otherPath} className="portal-link">
            {otherLabel}
          </a>
        </div>
      </div>
    </>
  );
}
