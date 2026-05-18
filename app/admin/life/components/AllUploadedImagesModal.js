"use client";

import { useMemo, useState } from "react";

export default function AllUploadedImagesModal({ urls, loading, error, onClose }) {
  const [filter, setFilter] = useState("");

  const filtered = useMemo(() => {
    if (!filter.trim()) return urls;
    const q = filter.trim().toLowerCase();
    return urls.filter((u) => String(u).toLowerCase().includes(q));
  }, [urls, filter]);

  const copy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      window.prompt("Copy URL:", text);
    }
  };

  return (
    <div className="modal" style={{ zIndex: 1100 }}>
      <div
        className="modal-box"
        style={{
          width: "min(960px, 96vw)",
          maxHeight: "92vh",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <h3 style={{ marginBottom: "8px" }}>All Life uploads</h3>
        <p style={{ fontSize: "13px", color: "#666", marginBottom: "12px" }}>
          Every banner and gallery image stored in Life (all items, including inactive). Use search to find a URL.
        </p>

        <input
          type="search"
          placeholder="Filter by filename or URL…"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            width: "100%",
            padding: "10px 12px",
            border: "1px solid #ddd",
            borderRadius: "8px",
            marginBottom: "12px",
            boxSizing: "border-box",
          }}
        />

        {loading && <p style={{ color: "#666" }}>Loading…</p>}
        {error && <p style={{ color: "#c0392b" }}>{error}</p>}

        {!loading && !error && (
          <>
            <p style={{ fontSize: "12px", color: "#888", marginBottom: "8px" }}>
              Showing {filtered.length} of {urls.length} image{urls.length !== 1 ? "s" : ""}
            </p>
            <div
              style={{
                flex: 1,
                overflowY: "auto",
                border: "1px solid #eee",
                borderRadius: "8px",
                padding: "10px",
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))",
                gap: "10px",
                background: "#fafafa",
              }}
            >
              {filtered.map((url, i) => (
                <div
                  key={`${url}-${i}`}
                  style={{
                    background: "#fff",
                    borderRadius: "8px",
                    overflow: "hidden",
                    border: "1px solid #eee",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <a href={url} target="_blank" rel="noopener noreferrer">
                    <img
                      src={url}
                      alt=""
                      loading="lazy"
                      style={{
                        width: "100%",
                        height: "90px",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </a>
                  <button
                    type="button"
                    className="btn btn-edit"
                    onClick={() => copy(url)}
                    style={{
                      fontSize: "11px",
                      padding: "6px",
                      borderRadius: 0,
                      width: "100%",
                    }}
                  >
                    Copy URL
                  </button>
                </div>
              ))}
            </div>
            {filtered.length === 0 && (
              <p style={{ color: "#888", marginTop: "12px" }}>No images match your filter.</p>
            )}
          </>
        )}

        <div style={{ marginTop: "16px", display: "flex", justifyContent: "flex-end" }}>
          <button type="button" className="btn btn-delete" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
