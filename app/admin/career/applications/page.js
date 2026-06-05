"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/lib/api";
import ApplicationTable from "./components/ApplicationTable";
import ApplicationDetailModal from "./components/ApplicationDetailModal";

const STATUS_OPTIONS = ["pending", "shortlisted", "hired", "rejected"];
const PAGE_SIZE = 20;

function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  return [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
}

export default function JobApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [viewApp, setViewApp] = useState(null);

  const fetchApplications = useCallback(async () => {
    setError("");
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set("status", statusFilter);
      if (search) params.set("search", search);
      params.set("page", String(page));
      params.set("limit", String(PAGE_SIZE));

      const data = await api.get(`/api/career/admin/applications?${params}`);
      if (data.success) {
        setApplications(data.data || []);
        setTotal(data.total ?? data.data?.length ?? 0);
        const pages = Math.max(1, Math.ceil((data.total || 0) / PAGE_SIZE));
        setTotalPages(pages);
      }
    } catch (err) {
      setError(err.message || "Failed to load applications");
    }
    setLoading(false);
  }, [statusFilter, search, page]);

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  useEffect(() => {
    setPage(1);
  }, [statusFilter, search]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/career/admin/applications/${id}/status`, { status });
      fetchApplications();
      if (viewApp?.id === id) {
        setViewApp((prev) => (prev ? { ...prev, status } : prev));
      }
    } catch (err) {
      alert(err.message || "Update failed");
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearch(searchInput.trim());
  };

  const from = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
  const to = Math.min(page * PAGE_SIZE, total);

  return (
    <>
      <style>{`
        .ap-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 8px;
        }
        .ap-title { font-size: 24px; font-weight: 700; margin: 0; }
        .ap-subtitle { margin: 4px 0 0; color: #64748b; font-size: 14px; }
        .ap-toolbar {
          display: flex;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 16px;
          align-items: center;
        }
        .ap-search {
          display: flex;
          gap: 8px;
          flex: 1;
          min-width: 220px;
        }
        .ap-search input,
        .ap-filter {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
          font-size: 14px;
        }
        .ap-search input { flex: 1; min-width: 0; }
        .ap-search-btn {
          padding: 8px 14px;
          border-radius: 8px;
          border: none;
          background: #0f172a;
          color: #fff;
          font-size: 14px;
          cursor: pointer;
        }
        .ap-card {
          background: #fff;
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 1px 3px rgba(0,0,0,0.08);
        }
        .ap-table { width: 100%; border-collapse: collapse; font-size: 14px; }
        .ap-table th, .ap-table td {
          padding: 12px;
          text-align: left;
          border-bottom: 1px solid #e2e8f0;
          vertical-align: top;
        }
        .ap-table th {
          background: #f8fafc;
          font-size: 12px;
          text-transform: uppercase;
          color: #64748b;
        }
        .ap-table td strong { display: block; }
        .ap-cell-muted {
          display: block;
          font-size: 12px;
          color: #64748b;
          margin-top: 2px;
        }
        .ap-link { color: #2563eb; text-decoration: none; }
        .ap-link:hover { text-decoration: underline; }
        .ap-resume-btn {
          display: inline-block;
          max-width: 160px;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          color: #2563eb;
          font-size: 13px;
          text-decoration: none;
        }
        .ap-resume-btn:hover { text-decoration: underline; }
        .status-select {
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          font-size: 13px;
        }
        .ap-view-btn {
          padding: 6px 10px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #fff;
          font-size: 13px;
          cursor: pointer;
        }
        .ap-view-btn:hover { background: #f8fafc; }
        .ap-error { color: #dc2626; margin-bottom: 12px; }
        .ap-empty { padding: 40px; text-align: center; color: #64748b; }
        .ap-pagination {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          padding: 14px 16px;
          border-top: 1px solid #e2e8f0;
          font-size: 13px;
          color: #64748b;
        }
        .ap-page-btns { display: flex; gap: 6px; flex-wrap: wrap; }
        .ap-page-btn {
          min-width: 32px;
          height: 32px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          background: #fff;
          cursor: pointer;
          font-size: 13px;
        }
        .ap-page-btn.active {
          background: #0f172a;
          color: #fff;
          border-color: #0f172a;
        }
        .ap-page-btn:disabled { opacity: 0.5; cursor: not-allowed; }
        .ap-modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.45);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 16px;
        }
        .ap-modal {
          background: #fff;
          border-radius: 12px;
          width: min(640px, 100%);
          max-height: 90vh;
          overflow: auto;
          box-shadow: 0 20px 40px rgba(0,0,0,0.15);
        }
        .ap-modal-head {
          display: flex;
          justify-content: space-between;
          gap: 12px;
          padding: 20px 20px 0;
        }
        .ap-modal-head h2 { margin: 0; font-size: 20px; }
        .ap-modal-sub { margin: 4px 0 0; color: #64748b; font-size: 14px; }
        .ap-modal-close {
          border: none;
          background: transparent;
          font-size: 24px;
          line-height: 1;
          cursor: pointer;
          color: #64748b;
        }
        .ap-modal-body { padding: 16px 20px; }
        .ap-detail-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px 20px;
          margin: 0;
        }
        .ap-detail-grid dt {
          font-size: 11px;
          text-transform: uppercase;
          color: #64748b;
          margin-bottom: 4px;
        }
        .ap-detail-grid dd { margin: 0; font-size: 14px; word-break: break-word; }
        .ap-detail-full { grid-column: 1 / -1; }
        .ap-comments-box {
          background: #f8fafc;
          border-radius: 8px;
          padding: 10px 12px;
          white-space: pre-wrap;
        }
        .ap-resume-link { color: #2563eb; text-decoration: none; }
        .ap-resume-link:hover { text-decoration: underline; }
        .ap-status-pill {
          display: inline-block;
          padding: 2px 8px;
          border-radius: 999px;
          font-size: 12px;
          text-transform: capitalize;
          background: #e2e8f0;
        }
        .ap-status-shortlisted { background: #dbeafe; color: #1d4ed8; }
        .ap-status-hired { background: #dcfce7; color: #15803d; }
        .ap-status-rejected { background: #fee2e2; color: #b91c1c; }
        .ap-status-pending { background: #fef3c7; color: #b45309; }
        .ap-modal-foot {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
          padding: 12px 20px 20px;
          border-top: 1px solid #e2e8f0;
        }
        .ap-btn {
          padding: 8px 14px;
          border-radius: 8px;
          font-size: 14px;
          cursor: pointer;
          text-decoration: none;
        }
        .ap-btn-ghost {
          border: 1px solid #e2e8f0;
          background: #fff;
          color: #0f172a;
        }
        .ap-btn-primary {
          border: none;
          background: #2563eb;
          color: #fff;
        }
        @media (max-width: 768px) {
          .ap-detail-grid { grid-template-columns: 1fr; }
          .ap-header { flex-direction: column; }
          .ap-toolbar { flex-direction: column; align-items: stretch; }
          .ap-search { width: 100%; }
          .ap-filter, .status-select { min-height: 44px; }
        }
      `}</style>

      <div>
        <div className="ap-header admin-page-header">
          <div>
            <h1 className="ap-title">Job Applications ({total})</h1>
            <p className="ap-subtitle">
              All career form submissions with resumes and candidate details
            </p>
          </div>
        </div>

        <div className="ap-toolbar">
          <form className="ap-search" onSubmit={handleSearchSubmit}>
            <input
              type="search"
              placeholder="Search name, email, or job title…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button type="submit" className="ap-search-btn">
              Search
            </button>
          </form>
          <select
            className="ap-filter"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="">All statuses</option>
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {error && <p className="ap-error">{error}</p>}

        <div className="ap-card admin-table-scroll">
          <ApplicationTable
            applications={applications}
            loading={loading}
            onView={setViewApp}
            onStatusChange={updateStatus}
            statusOptions={STATUS_OPTIONS}
          />

          {!loading && total > 0 ? (
            <div className="ap-pagination">
              <span>
                Showing {from}–{to} of {total}
              </span>
              <div className="ap-page-btns">
                <button
                  type="button"
                  className="ap-page-btn"
                  disabled={page <= 1}
                  onClick={() => setPage((p) => p - 1)}
                >
                  ‹
                </button>
                {pageNumbers(page, totalPages).map((p, i, arr) => {
                  const prev = arr[i - 1];
                  const gap = prev && p - prev > 1;
                  return (
                    <span key={p} style={{ display: "contents" }}>
                      {gap ? <span style={{ padding: "0 4px" }}>…</span> : null}
                      <button
                        type="button"
                        className={`ap-page-btn${p === page ? " active" : ""}`}
                        onClick={() => setPage(p)}
                      >
                        {p}
                      </button>
                    </span>
                  );
                })}
                <button
                  type="button"
                  className="ap-page-btn"
                  disabled={page >= totalPages}
                  onClick={() => setPage((p) => p + 1)}
                >
                  ›
                </button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <ApplicationDetailModal application={viewApp} onClose={() => setViewApp(null)} />
    </>
  );
}
