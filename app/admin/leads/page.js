"use client";

import { useEffect, useState } from "react";

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch leads");
        return res.json();
      })
      .then((data) => {
        // Fix 1: Handle both { data: [...] } and plain array responses
        setLeads(Array.isArray(data) ? data : (data.data ?? []));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Fix 2: Added !leads check to guard against undefined
    if (loading || !leads || leads.length === 0) return;

    let table = null;

    async function initTable() {
      const $ = (await import("jquery")).default;
      window.jQuery = $;

      await import("datatables.net-dt");
      await import("datatables.net-responsive");
      await import("datatables.net-dt/css/dataTables.dataTables.css");
      await import("datatables.net-responsive-dt/css/responsive.dataTables.css");

      if ($.fn.dataTable.isDataTable("#leadTable")) {
        $("#leadTable").DataTable().destroy();
      }

      table = $("#leadTable").DataTable({
        responsive: true,
        pageLength: 10,
        lengthMenu: [10, 25, 50, 100],
        order: [[0, "desc"]],
        columnDefs: [
          { targets: [5, 6, 7], orderable: false },
          { responsivePriority: 1, targets: 0 }, // ID
          { responsivePriority: 2, targets: 1 }, // Name
          { responsivePriority: 3, targets: 2 }, // Email
          { responsivePriority: 4, targets: 4 }, // Phone
          { responsivePriority: 5, targets: 3 }, // Country
          { responsivePriority: 6, targets: 6 }, // Form Type
          { responsivePriority: 7, targets: 7 }, // Source Page
          { responsivePriority: 8, targets: 5 }, // Message (collapse first)
        ],
        language: {
          search: "",
          searchPlaceholder: "Search leads...",
          emptyTable: "No leads found",
          zeroRecords: "No matching leads",
          lengthMenu: "_MENU_ per page",
          info: "Showing _START_–_END_ of _TOTAL_",
          paginate: { previous: "←", next: "→" },
        },
      });
    }

    initTable();

    return () => {
      if (table) table.destroy();
    };
  }, [loading, leads]);

  function getBadgeStyle(formType) {
    if (formType === "contact_page")
      return { background: "#e8f0fe", color: "#4f8ef7" };
    if (formType === "service_form")
      return { background: "#e6faf4", color: "#16a37f" };
    return { background: "#f1f3f5", color: "#666" };
  }

  return (
    <>
      <style>{`
        *, *::before, *::after { box-sizing: border-box; }

        .lp {
          min-height: 100vh;
          background: #f0f2f5;
          padding: 20px 16px;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        /* ── Header ── */
        .lp-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          flex-wrap: wrap;
          gap: 10px;
          margin-bottom: 20px;
        }
        .lp-title {
          font-size: clamp(18px, 5vw, 26px);
          font-weight: 800;
          color: #1a1a2e;
          margin: 0;
        }
        .lp-badge {
          background: #4f8ef7;
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 20px;
          white-space: nowrap;
        }

        /* ── Card ── */
        .lp-card {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 2px 16px rgba(0,0,0,0.07);
          overflow: hidden;
        }
        .lp-card-head {
          padding: 16px 20px;
          border-bottom: 1px solid #eee;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .lp-card-head h2 {
          margin: 0;
          font-size: 14px;
          font-weight: 700;
          color: #333;
        }
        .live-dot {
          width: 8px; height: 8px;
          background: #2dd4a0;
          border-radius: 50%;
          box-shadow: 0 0 6px #2dd4a0;
          animation: blink 2s ease-in-out infinite;
          flex-shrink: 0;
        }
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.3} }

        /* ── DataTables wrapper ── */
        .lp-body { padding: 16px 16px 20px; }

        /* Controls row */
        .dataTables_wrapper .dataTables_length,
        .dataTables_wrapper .dataTables_filter {
          margin-bottom: 14px;
        }
        .dataTables_wrapper .dataTables_length label,
        .dataTables_wrapper .dataTables_filter label {
          font-size: 13px;
          color: #555;
          display: flex;
          align-items: center;
          gap: 6px;
          flex-wrap: wrap;
        }
        .dataTables_wrapper .dataTables_filter input {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 7px 12px;
          font-size: 13px;
          outline: none;
          width: 100%;
          max-width: 280px;
          transition: border-color .2s;
        }
        .dataTables_wrapper .dataTables_filter input:focus {
          border-color: #4f8ef7;
          box-shadow: 0 0 0 3px rgba(79,142,247,.12);
        }
        .dataTables_wrapper .dataTables_length select {
          border: 1px solid #ddd;
          border-radius: 8px;
          padding: 6px 10px;
          font-size: 13px;
          outline: none;
        }

        /* Table */
        #leadTable {
          width: 100% !important;
          border-collapse: collapse;
          font-size: 13.5px;
          color: #333;
        }
        #leadTable thead th {
          background: #f8f9fb;
          color: #666;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: .8px;
          padding: 12px 14px;
          border-bottom: 2px solid #eee;
          white-space: nowrap;
        }
        #leadTable tbody tr {
          border-bottom: 1px solid #f3f3f3;
          transition: background .15s;
        }
        #leadTable tbody tr:hover { background: #f7f9ff; }
        #leadTable tbody td {
          padding: 12px 14px;
          vertical-align: middle;
        }

        /* Responsive child row (expanded details on mobile) */
        #leadTable tbody tr.child td {
          padding: 8px 14px;
          background: #fafbff;
        }
        .dtr-details {
          width: 100%;
        }
        .dtr-details li {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-start;
          gap: 6px;
          padding: 7px 0;
          border-bottom: 1px solid #eef0f5;
          list-style: none;
          font-size: 13px;
        }
        .dtr-details li:last-child { border-bottom: none; }
        .dtr-title {
          font-weight: 700;
          color: #555;
          font-size: 11px;
          text-transform: uppercase;
          letter-spacing: .5px;
          min-width: 90px;
          padding-top: 1px;
        }
        .dtr-data { color: #333; word-break: break-word; flex: 1; }

        /* Expand toggle button (the + icon DataTables adds) */
        td.dtr-control {
          cursor: pointer;
          padding-left: 14px !important;
        }
        td.dtr-control::before {
          background-color: #4f8ef7 !important;
          box-shadow: 0 0 0 2px #fff, 0 0 0 3px #4f8ef7 !important;
        }

        /* Info + pagination */
        .dataTables_wrapper .dataTables_info {
          font-size: 12px;
          color: #aaa;
          padding-top: 10px;
        }
        .dataTables_wrapper .dataTables_paginate {
          padding-top: 10px;
        }
        .dataTables_wrapper .dataTables_paginate .paginate_button {
          border-radius: 7px !important;
          font-size: 13px !important;
          padding: 5px 11px !important;
          margin: 0 2px !important;
          border: 1px solid transparent !important;
          cursor: pointer;
        }
        .dataTables_wrapper .dataTables_paginate .paginate_button.current,
        .dataTables_wrapper .dataTables_paginate .paginate_button.current:hover {
          background: #4f8ef7 !important;
          border-color: #4f8ef7 !important;
          color: #fff !important;
        }
        .dataTables_wrapper .dataTables_paginate .paginate_button:hover {
          background: #e8f0fe !important;
          border-color: #e8f0fe !important;
          color: #4f8ef7 !important;
        }
        .dataTables_wrapper .dataTables_paginate .paginate_button.disabled,
        .dataTables_wrapper .dataTables_paginate .paginate_button.disabled:hover {
          color: #ccc !important;
          background: transparent !important;
          cursor: default;
        }

        /* ── Cell styles ── */
        .cell-name { font-weight: 600; color: #1a1a2e; }
        .cell-email {
          color: #4f8ef7;
          text-decoration: none;
          word-break: break-all;
        }
        .cell-email:hover { text-decoration: underline; }
        .cell-phone { color: #333; text-decoration: none; white-space: nowrap; }
        .cell-phone:hover { color: #4f8ef7; }
        .cell-message {
          max-width: 200px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          color: #666;
          font-size: 12.5px;
        }
        .cell-source { font-size: 12px; color: #aaa; font-style: italic; }

        .chip {
          display: inline-block;
          padding: 3px 10px;
          border-radius: 20px;
          font-size: 11px;
          font-weight: 700;
          white-space: nowrap;
        }

        /* ── Loading / Error states ── */
        .state-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 60px 20px;
          gap: 14px;
          color: #aaa;
          font-size: 14px;
          text-align: center;
        }
        .spinner {
          width: 38px; height: 38px;
          border: 3px solid #e8ecf0;
          border-top-color: #4f8ef7;
          border-radius: 50%;
          animation: spin .7s linear infinite;
        }
        @keyframes spin { to { transform: rotate(360deg); } }
        .state-box.is-error { color: #e74c3c; }
        .state-box.is-error small { color: #aaa; font-size: 12px; }

        /* ── Responsive breakpoints ── */
        @media (max-width: 768px) {
          .lp { padding: 14px 10px; }
          .lp-body { padding: 12px 10px 16px; }
          #leadTable thead th,
          #leadTable tbody td { padding: 10px 10px; font-size: 12.5px; }
          .cell-message { max-width: 120px; }
          .dataTables_wrapper .dataTables_length,
          .dataTables_wrapper .dataTables_filter {
            float: none !important;
            text-align: left !important;
          }
          .dataTables_wrapper .dataTables_info,
          .dataTables_wrapper .dataTables_paginate {
            float: none !important;
            text-align: center !important;
          }
        }

        @media (max-width: 480px) {
          .lp-card-head { padding: 12px 14px; }
          #leadTable thead th,
          #leadTable tbody td { padding: 9px 8px; font-size: 12px; }
          .dataTables_wrapper .dataTables_paginate .paginate_button {
            padding: 4px 8px !important;
            font-size: 12px !important;
          }
        }
      `}</style>

      <div className="lp">
        {/* Header */}
        <div className="lp-header">
          <h1 className="lp-title">Leads Dashboard</h1>
          {!loading && !error && (
            <span className="lp-badge">{leads.length} total</span>
          )}
        </div>

        {/* Card */}
        <div className="lp-card">
          <div className="lp-card-head">
            <div className="live-dot" />
            <h2>All Submissions</h2>
          </div>

          {/* Loading */}
          {loading && (
            <div className="state-box">
              <div className="spinner" />
              <span>Loading leads…</span>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="state-box is-error">
              <span>⚠ {error}</span>
              <small>
                Make sure your Express server is running on port 5000
              </small>
            </div>
          )}

          {/* Fix 3: Added Array.isArray(leads) guard before rendering table */}
          {!loading && !error && Array.isArray(leads) && (
            <div className="lp-body">
              <table
                id="leadTable"
                className="display nowrap"
                style={{ width: "100%" }}
              >
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Country</th>
                    <th>Phone</th>
                    <th>Message</th>
                    <th>Form Type</th>
                    <th>Source Page</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => (
                    <tr key={lead.id}>
                      <td>{lead.id}</td>
                      <td>
                        <span className="cell-name">{lead.name}</span>
                      </td>
                      <td>
                        <a className="cell-email" href={`mailto:${lead.email}`}>
                          {lead.email}
                        </a>
                      </td>
                      <td>{lead.country}</td>
                      <td>
                        <a className="cell-phone" href={`tel:${lead.phone}`}>
                          {lead.phone}
                        </a>
                      </td>
                      <td>
                        <span className="cell-message" title={lead.message}>
                          {lead.message}
                        </span>
                      </td>
                      <td>
                        <span
                          className="chip"
                          style={getBadgeStyle(lead.form_type)}
                        >
                          {lead.form_type || "—"}
                        </span>
                      </td>
                      <td>
                        <span className="cell-source">
                          {lead.source_page || "—"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </>
  );
}