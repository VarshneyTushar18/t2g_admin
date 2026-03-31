"use client";

import { useEffect, useRef } from "react";

export default function LeadTable({ leads, onDelete }) {
  const tableRef = useRef(null);

  useEffect(() => {
    if (!leads || leads.length === 0) return;

    let tableInstance;

    async function initTable() {
      const $ = (await import("jquery")).default;
      window.jQuery = $;

      await import("datatables.net-dt");
      await import("datatables.net-responsive");
      await import("datatables.net-dt/css/dataTables.dataTables.css");
      await import("datatables.net-responsive-dt/css/responsive.dataTables.css");

      // ✅ destroy properly
      if ($.fn.dataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().clear().destroy(true);
      }

      setTimeout(() => {
        tableInstance = $(tableRef.current).DataTable({
          responsive: false,   // 🔥 IMPORTANT FIX (no child rows)
          scrollX: true,
          autoWidth: false,
          pageLength: 10,
          lengthMenu: [10, 25, 50, 100],
          order: [[0, "desc"]],
          columnDefs: [
            { targets: [8], orderable: false },
          ],
        });
      }, 50);
    }

    initTable();

    return () => {
      if (tableInstance) {
        tableInstance.destroy(true);
      }
    };
  }, [leads]);

  return (
    <div className="lp-body">
      <div style={{ width: "100%", overflowX: "auto" }}>
        <table
          ref={tableRef}
          className="display nowrap"
          style={{ width: "100%", minWidth: "900px" }}
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
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {leads.map((lead) => (
              <tr key={`${lead.id}-${JSON.stringify(lead)}`}>
                <td>{lead.id}</td>
                <td>{lead.name}</td>
                <td>{lead.email}</td>
                <td>{lead.country}</td>
                <td>{lead.phone}</td>
                <td
                  style={{
                    maxWidth: "200px",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {lead.message}
                </td>
                <td>{lead.form_type}</td>
                <td>{lead.source_page}</td>
                <td>
                  <button
                    onClick={() => onDelete(lead.id)}
                    style={{
                      background: "#e74c3c",
                      color: "#fff",
                      border: "none",
                      padding: "5px 8px",
                      borderRadius: "5px",
                      cursor: "pointer",
                      fontSize: "12px",
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}