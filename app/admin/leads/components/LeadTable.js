"use client";

import { useEffect, useRef } from "react";

export default function LeadTable({ leads, onEdit, onDelete }) {
  const tableRef = useRef(null);

  // Initialize DataTable
  useEffect(() => {
    if (!leads || leads.length === 0) return;

    let table = null;

    async function initTable() {
      const $ = (await import("jquery")).default;
      window.jQuery = $;

      await import("datatables.net-dt");
      await import("datatables.net-responsive");
      await import("datatables.net-dt/css/dataTables.dataTables.css");
      await import("datatables.net-responsive-dt/css/responsive.dataTables.css");

      if ($.fn.dataTable.isDataTable(tableRef.current)) {
        $(tableRef.current).DataTable().destroy();
      }

      table = $(tableRef.current).DataTable({
        responsive: true,
        pageLength: 10,
        lengthMenu: [10, 25, 50, 100],
        order: [[0, "desc"]],
        columnDefs: [
          { targets: [8], orderable: false }, // Actions column
        ],
      });
    }

    initTable();

    return () => {
      if (table) table.destroy();
    };
  }, [leads]);

  return (
    <div className="lp-body">
      <table ref={tableRef} className="display nowrap table-responsive" style={{ width: "100%" }}>
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
            <tr key={lead.id}>
              <td>{lead.id}</td>
              <td>{lead.name}</td>
              <td>{lead.email}</td>
              <td>{lead.country}</td>
              <td>{lead.phone}</td>
              <td>{lead.message}</td>
              <td>{lead.form_type}</td>
              <td>{lead.source_page}</td>
              <td>
                <button
                  onClick={() => onEdit(lead)}
                  style={{
                    background: "#4f8ef7",
                    color: "#fff",
                    border: "none",
                    padding: "5px 8px",
                    borderRadius: "5px",
                    marginRight: "5px",
                    cursor: "pointer"
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={() => onDelete(lead.id)}
                  style={{
                    background: "#e74c3c",
                    color: "#fff",
                    border: "none",
                    padding: "5px 8px",
                    borderRadius: "5px",
                    cursor: "pointer"
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
  );
}
