"use client";

import Link from "next/link";
import "../blog-admin.css";

export default function BlogEditorShell({
  title,
  subtitle,
  backHref = "/admin/blog",
  children,
}) {
  return (
    <div className="blog-editor-shell">
      <div className="blog-editor-inner">
        <Link href={backHref} className="blog-admin-back">
          ← Back to blog posts
        </Link>
        <header className="blog-editor-header">
          <h1 className="blog-editor-title">{title}</h1>
          {subtitle && <p className="blog-editor-subtitle">{subtitle}</p>}
        </header>
        <div className="blog-editor-card">{children}</div>
      </div>
    </div>
  );
}
