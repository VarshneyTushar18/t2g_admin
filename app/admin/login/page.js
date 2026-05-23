"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { api } from "@/lib/api";
import { getPostLoginPath } from "@/lib/adminModules";
import PasswordInput from "../components/PasswordInput";
import "../admin-mobile.css";


export default function LoginPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

 const handleSubmit = async (e) => {
  e.preventDefault();
  setError("");
  setLoading(true);

  try {
    const data = await api.post("/api/auth/login", { email, password });
    const user = data.user;
    const path = user ? getPostLoginPath(user) : "/admin";
    router.push(path);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

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

        .logo {
          margin-bottom: 20px;
        }

        h1 {
          color: #fff;
          margin-bottom: 6px;
        }

        .subtitle {
          color: #9ca3af;
          margin-bottom: 24px;
        }

        .input-group {
          position: relative;
          margin-bottom: 16px;
        }

        .input-group input {
          width: 100%;
          padding: 12px 14px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.05);
          color: #fff;
          font-size: 14px;
          transition: border 0.2s;
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
          transition: opacity 0.2s;
        }

        .btn:disabled {
          opacity: 0.6;
          cursor: not-allowed;
        }
        @media (max-width: 480px) {
          .container {
            padding: 16px;
            align-items: flex-start;
            padding-top: max(24px, env(safe-area-inset-top));
          }
          .card {
            padding: 24px 20px;
            border-radius: 14px;
            margin-top: 8px;
          }
          .logo img {
            max-width: 100%;
            height: auto;
          }
          h1 { font-size: 1.35rem; }
          .btn { min-height: 48px; font-size: 15px; }
        }
      `}</style>

      <div className="container">
        <div className="card">
          <div className="logo">
            <Image
              src="/tech2globe-logo-white.webp"
              alt="Logo"
              width={180}
              height={50}
              style={{ width: "100%", maxWidth: 180, height: "auto" }}
            />
          </div>

          <h1>Welcome back</h1>
          <p className="subtitle">Sign in to your admin dashboard</p>

          {error && <div className="error">{error}</div>}

          <form onSubmit={handleSubmit}>
            <div className="input-group">
              <input
                type="email"
                placeholder="admin@tech2globe.com"
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

            <button className="btn" disabled={loading}>
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </>
  );
}