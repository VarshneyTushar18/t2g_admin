"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function CategoryManageDropdown({
  categories = [],
  onDelete,
  canDelete = true,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name?.toLowerCase().includes(q));
  }, [categories, query]);

  useEffect(() => {
    if (!open) return;
    const onDocClick = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [open]);

  return (
    <>
      <style>{`
        .cmd { position: relative; }
        .cmd-trigger {
          width: 100%;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 9px 12px;
          border: 1.5px solid #e0e3e8;
          border-radius: 8px;
          background: #fff;
          font-size: 13px;
          color: #1a1a2e;
          cursor: pointer;
        }
        .cmd-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          z-index: 40;
          background: #fff;
          border: 1px solid #e0e3e8;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          overflow: hidden;
        }
        .cmd-search {
          width: 100%;
          border: none;
          border-bottom: 1px solid #eee;
          padding: 10px 12px;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
        }
        .cmd-list { max-height: 220px; overflow-y: auto; }
        .cmd-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 8px;
          padding: 8px 12px;
          font-size: 13px;
          border-bottom: 1px solid #f1f5f9;
        }
        .cmd-del {
          border: none;
          background: none;
          color: #e74c3c;
          cursor: pointer;
          font-size: 12px;
          flex-shrink: 0;
        }
        .cmd-del:disabled { opacity: 0.4; cursor: not-allowed; }
      `}</style>

      <div className="cmd" ref={rootRef}>
        <button
          type="button"
          className="cmd-trigger"
          onClick={() => setOpen((v) => !v)}
        >
          <span>Manage categories ({categories.length})</span>
          <span>{open ? "▲" : "▼"}</span>
        </button>

        {open && (
          <div className="cmd-menu">
            <input
              className="cmd-search"
              placeholder="Search categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className="cmd-list">
              {filtered.length ? (
                filtered.map((cat) => (
                  <div key={cat.id} className="cmd-row">
                    <span>{cat.name}</span>
                    <button
                      type="button"
                      className="cmd-del"
                      disabled={!canDelete}
                      onClick={() => onDelete?.(cat.id)}
                    >
                      Delete
                    </button>
                  </div>
                ))
              ) : (
                <div style={{ padding: 12, color: "#94a3b8", fontSize: 13 }}>
                  No categories found
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
