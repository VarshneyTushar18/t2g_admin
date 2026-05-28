"use client";

import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useLeads } from "./hooks/useLeads";
import LeadTable, { FORM_TYPES } from "./components/LeadTable";
import LeadDetailModal from "./components/LeadDetailModal";
import { exportLeadsCsv } from "./services/leadService";
import ReadOnlyBanner from "../components/ReadOnlyBanner";
import "./leads.css";

const SOURCE_SITE_FILTERS = [
  { value: "", label: "All sources" },
  { value: "t2gca", label: "T2G CA" },
  { value: "t2g", label: "T2G Original" },
];

function SearchIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="11" cy="11" r="7" />
      <path d="M20 20l-3-3" strokeLinecap="round" />
    </svg>
  );
}

function ExportIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 3v12M8 11l4 4 4-4M5 21h14" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  return [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
}

export default function LeadsPage() {
  const { canDelete } = useAuth();
  const [viewLead, setViewLead] = useState(null);
  const [exporting, setExporting] = useState(false);

  const {
    leads,
    loading,
    error,
    search,
    setSearch,
    formType,
    changeFormType,
    sourceSite,
    changeSourceSite,
    dateFrom,
    dateTo,
    changeDateRange,
    page,
    limit,
    pagination,
    goToPage,
    changeLimit,
    handleDelete,
  } = useLeads();

  const { total = 0, totalPages = 1 } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportLeadsCsv({
        search,
        form_type: formType,
        source_site: sourceSite,
        date_from: dateFrom,
        date_to: dateTo,
      });
    } catch (err) {
      alert(err.message);
    }
    setExporting(false);
  };

  return (
    <div className="leads-page">
      <ReadOnlyBanner moduleKey="leads" />

      <header className="leads-page-header">
        <div>
          <h1>Leads</h1>
          <p>Manage inbound enquiries from your website forms</p>
        </div>
      </header>

      <div className="leads-toolbar">
        <div className="leads-search-wrap">
          <SearchIcon />
          <input
            type="search"
            className="leads-search"
            placeholder="Search name, email, phone, message…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            aria-label="Search leads"
          />
        </div>

        <select
          className="leads-select"
          value={formType}
          onChange={(e) => changeFormType(e.target.value)}
          aria-label="Filter by form type"
        >
          {FORM_TYPES.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <select
          className="leads-select"
          value={sourceSite}
          onChange={(e) => changeSourceSite(e.target.value)}
          aria-label="Filter by source site"
        >
          {SOURCE_SITE_FILTERS.map((opt) => (
            <option key={opt.value || "all-source"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="leads-date-range">
          <label htmlFor="date-from">From</label>
          <input
            id="date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => changeDateRange(e.target.value, dateTo)}
          />
          <label htmlFor="date-to">To</label>
          <input
            id="date-to"
            type="date"
            value={dateTo}
            onChange={(e) => changeDateRange(dateFrom, e.target.value)}
          />
          {(dateFrom || dateTo) && (
            <button
              type="button"
              className="leads-btn leads-btn-ghost leads-btn-sm"
              onClick={() => changeDateRange("", "")}
            >
              Clear dates
            </button>
          )}
        </div>

        <button
          type="button"
          className="leads-btn leads-btn-primary"
          onClick={handleExport}
          disabled={exporting || loading}
        >
          <ExportIcon />
          {exporting ? "Exporting…" : "Export CSV"}
        </button>
      </div>

      {error && <div className="leads-alert-error">{error}</div>}

      <div className="leads-panel">
        <LeadTable
          leads={leads}
          loading={loading}
          onView={setViewLead}
          onDelete={handleDelete}
          canDelete={canDelete("leads")}
        />

        {!loading && total > 0 && (
          <footer className="leads-footer">
            <div className="leads-footer-meta">
              Showing <strong>{from}</strong> to <strong>{to}</strong> of{" "}
              <strong>{total}</strong> leads
            </div>

            <div className="leads-per-page">
              <span>Per page</span>
              <select
                value={limit}
                onChange={(e) => changeLimit(Number(e.target.value))}
                aria-label="Rows per page"
              >
                {[10, 25, 50, 100].map((n) => (
                  <option key={n} value={n}>
                    {n}
                  </option>
                ))}
              </select>
            </div>

            <nav className="leads-pagination" aria-label="Pagination">
              <button
                type="button"
                className="leads-page-btn"
                disabled={page <= 1}
                onClick={() => goToPage(page - 1)}
              >
                Prev
              </button>
              {pageNumbers(page, totalPages).map((p, i, arr) => (
                <span key={p} style={{ display: "contents" }}>
                  {i > 0 && arr[i - 1] !== p - 1 && (
                    <span style={{ padding: "0 4px", color: "#94a3b8" }}>…</span>
                  )}
                  <button
                    type="button"
                    className={`leads-page-btn${p === page ? " active" : ""}`}
                    onClick={() => goToPage(p)}
                  >
                    {p}
                  </button>
                </span>
              ))}
              <button
                type="button"
                className="leads-page-btn"
                disabled={page >= totalPages}
                onClick={() => goToPage(page + 1)}
              >
                Next
              </button>
            </nav>
          </footer>
        )}
      </div>

      <LeadDetailModal lead={viewLead} onClose={() => setViewLead(null)} />
    </div>
  );
}
