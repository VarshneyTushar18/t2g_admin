"use client";

import { useEffect, useRef } from "react";
import $ from "jquery";

import "datatables.net-dt";
import "datatables.net-responsive-dt";

export default function LeadTable({ leads, onDelete }) {
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);

  useEffect(() => {
    if (!tableRef.current) return;

    // Destroy previous instance
    if (dataTableRef.current) {
      dataTableRef.current.destroy();
    }

    // Initialize DataTable AFTER DOM update
    dataTableRef.current = $(tableRef.current).DataTable({
      responsive: true,
      pageLength: 10,
      autoWidth: false,
      destroy: true,
      columnDefs: [
        { targets: [5, 7], width: "200px" },
      ],
    });

  }, [leads]);

  return (
    <div style={{ overflowX: "auto" }}>
      <table
        ref={tableRef}
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
                  onClick={() => {
                    if (confirm("Delete this lead?")) {
                      onDelete(lead.id);
                    }
                  }}
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    padding: "6px 10px",
                    borderRadius: "4px",
                    cursor: "pointer",
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