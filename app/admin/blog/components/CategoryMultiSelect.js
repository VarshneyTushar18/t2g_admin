"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export default function CategoryMultiSelect({
  categories = [],
  selected = [],
  onChange,
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef(null);

  const selectedIds = useMemo(
    () => new Set((selected || []).map(Number).filter(Boolean)),
    [selected],
  );

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return categories;
    return categories.filter((c) => c.name?.toLowerCase().includes(q));
  }, [categories, query]);

  const selectedNames = categories
    .filter((c) => selectedIds.has(Number(c.id)))
    .map((c) => c.name);

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

  const toggle = (id) => {
    const num = Number(id);
    const next = selectedIds.has(num)
      ? [...selectedIds].filter((x) => x !== num)
      : [...selectedIds, num];
    onChange(next);
  };

  const label =
    selectedNames.length === 0
      ? "Select categories"
      : selectedNames.length === 1
        ? selectedNames[0]
        : `${selectedNames.length} categories selected`;

  return (
    <>
      <style>{`
        .cms { position: relative; }
        .cms-trigger {
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
          text-align: left;
        }
        .cms-trigger:hover { border-color: #4f8ef7; }
        .cms-trigger span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
        .cms-caret { color: #94a3b8; font-size: 11px; flex-shrink: 0; }
        .cms-menu {
          position: absolute;
          top: calc(100% + 4px);
          left: 0;
          right: 0;
          z-index: 50;
          background: #fff;
          border: 1px solid #e0e3e8;
          border-radius: 8px;
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
          overflow: hidden;
        }
        .cms-search {
          width: 100%;
          border: none;
          border-bottom: 1px solid #eee;
          padding: 10px 12px;
          font-size: 13px;
          outline: none;
          box-sizing: border-box;
        }
        .cms-list {
          max-height: 200px;
          overflow-y: auto;
          padding: 6px 0;
        }
        .cms-item {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 12px;
          font-size: 13px;
          cursor: pointer;
        }
        .cms-item:hover { background: #f8fafc; }
        .cms-item input { accent-color: #16a37f; }
        .cms-empty { padding: 12px; font-size: 13px; color: #94a3b8; text-align: center; }
        .cms-chips { display: flex; flex-wrap: wrap; gap: 6px; margin-top: 8px; }
        .cms-chip {
          font-size: 11px;
          background: #eef2f7;
          color: #475569;
          padding: 3px 8px;
          border-radius: 999px;
          max-width: 100%;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
      `}</style>

      <div className="cms" ref={rootRef}>
        <button
          type="button"
          className="cms-trigger"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
        >
          <span>{label}</span>
          <span className="cms-caret">{open ? "▲" : "▼"}</span>
        </button>

        {open && (
          <div className="cms-menu">
            <input
              className="cms-search"
              placeholder="Search categories..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
            <div className="cms-list">
              {filtered.length ? (
                filtered.map((cat) => (
                  <label key={cat.id} className="cms-item">
                    <input
                      type="checkbox"
                      checked={selectedIds.has(Number(cat.id))}
                      onChange={() => toggle(cat.id)}
                    />
                    <span>{cat.name}</span>
                  </label>
                ))
              ) : (
                <div className="cms-empty">No categories found</div>
              )}
            </div>
          </div>
        )}

        {selectedNames.length > 1 && (
          <div className="cms-chips">
            {selectedNames.slice(0, 4).map((name) => (
              <span key={name} className="cms-chip" title={name}>
                {name}
              </span>
            ))}
            {selectedNames.length > 4 && (
              <span className="cms-chip">+{selectedNames.length - 4} more</span>
            )}
          </div>
        )}
      </div>
    </>
  );
}
