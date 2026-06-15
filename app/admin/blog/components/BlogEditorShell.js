"use client";

import Link from "next/link";

export default function BlogEditorShell({
  title,
  subtitle,
  backHref = "/admin/blog",
  children,
}) {
  return (
    <>
      <style>{`
        .bes {
          min-height: 100vh;
          background: #f0f2f5;
          padding: 20px 24px 40px;
          font-family: system-ui, -apple-system, sans-serif;
        }
        .bes-inner {
          max-width: 1280px;
          margin: 0 auto;
        }
        .bes-back {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          color: #4f46e5;
          text-decoration: none;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
        }
        .bes-back:hover { text-decoration: underline; }
        .bes-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          gap: 16px;
          margin-bottom: 24px;
          flex-wrap: wrap;
        }
        .bes-title {
          margin: 0;
          font-size: 28px;
          font-weight: 800;
          color: #1a1a2e;
        }
        .bes-subtitle {
          margin: 6px 0 0;
          font-size: 14px;
          color: #64748b;
        }
        .bes-card {
          background: #fff;
          border-radius: 12px;
          box-shadow: 0 2px 16px rgba(0, 0, 0, 0.06);
          padding: 24px;
        }
        @media (max-width: 768px) {
          .bes { padding: 16px; }
          .bes-card { padding: 16px; }
        }
      `}</style>

      <div className="bes">
        <div className="bes-inner">
          <Link href={backHref} className="bes-back">
            ← Back to blog posts
          </Link>
          <header className="bes-header">
            <div>
              <h1 className="bes-title">{title}</h1>
              {subtitle && <p className="bes-subtitle">{subtitle}</p>}
            </div>
          </header>
          <div className="bes-card">{children}</div>
        </div>
      </div>
    </>
  );
}
