"use client";

import { useEffect, useState } from "react";
import { api } from "@/lib/api";

const STATUS_OPTIONS = ["pending", "shortlisted", "hired", "rejected"];

export default function JobApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  const fetchApplications = async () => {
    setError("");
    try {
      const qs = statusFilter ? `?status=${statusFilter}` : "";
      const data = await api.get(`/api/career/admin/applications${qs}`);
      if (data.success) {
        setApplications(data.data || []);
        setTotal(data.total ?? data.data?.length ?? 0);
      }
    } catch (err) {
      setError(err.message || "Failed to load applications");
    }
    setLoading(false);
  };

  useEffect(() => {
    setLoading(true);
    fetchApplications();
  }, [statusFilter]);

  const updateStatus = async (id, status) => {
    try {
      await api.patch(`/api/career/admin/applications/${id}/status`, { status });
      fetchApplications();
    } catch (err) {
      alert(err.message || "Update failed");
    }
  };

  return (
    <>
      <style>{`
        .ap-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 20px;
        }
        .ap-title { font-size: 24px; font-weight: 700; margin: 0; }
        .ap-filter {
          padding: 8px 12px;
          border-radius: 8px;
          border: 1px solid #e2e8f0;
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
        }
        .ap-table th {
          background: #f8fafc;
          font-size: 12px;
          text-transform: uppercase;
          color: #64748b;
        }
        .status-select {
          padding: 4px 8px;
          border-radius: 6px;
          border: 1px solid #e2e8f0;
          font-size: 13px;
        }
        .ap-error { color: #dc2626; margin-bottom: 12px; }
        .ap-empty { padding: 40px; text-align: center; color: #64748b; }
        @media (max-width: 768px) {
          .ap-header {
            flex-direction: column;
            align-items: stretch;
          }
          .ap-title { font-size: 1.25rem; }
          .ap-filter {
            width: 100%;
            min-height: 44px;
            font-size: 16px;
          }
          .status-select {
            min-height: 40px;
            width: 100%;
            max-width: 140px;
          }
        }
      `}</style>

      <div>
        <div className="ap-header admin-page-header">
          <h1 className="ap-title">Job Applications ({total})</h1>
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
          {loading ? (
            <p className="ap-empty">Loading...</p>
          ) : applications.length === 0 ? (
            <p className="ap-empty">No applications found.</p>
          ) : (
            <table className="ap-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Job</th>
                  <th>Applied</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.id}>
                    <td>
                      {app.first_name} {app.last_name}
                    </td>
                    <td>{app.email}</td>
                    <td>{app.job_title}</td>
                    <td>
                      {app.applied_at
                        ? new Date(app.applied_at).toLocaleDateString()
                        : "—"}
                    </td>
                    <td>
                      <select
                        className="status-select"
                        value={app.status}
                        onChange={(e) => updateStatus(app.id, e.target.value)}
                      >
                        {STATUS_OPTIONS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </>
  );
}
