"use client";

import { useEffect } from "react";

export default function LeadTable({ leads, onDelete, onEdit }) {
  useEffect(() => {
    if (!leads || leads.length === 0) return;

    let table;
    let timeout;

    const init = async () => {
      const $ = (await import("jquery")).default;
      if (typeof window !== "undefined") {
        window.jQuery = $;
        window.$ = $;
      }

      await import("datatables.net-dt");

      timeout = setTimeout(() => {
        if ($.fn.DataTable.isDataTable("#leadsTable")) {
          $("#leadsTable").DataTable().destroy();
        }

        table = $("#leadsTable").DataTable({
          pageLength: 10,
          autoWidth: false,
          responsive: false,
          order: [[1, "desc"]],

          columnDefs: [
            {
              targets: 0,
              className: "dt-control",
              orderable: false,
              defaultContent: "▶",
            },
          ],

          createdRow: function (row) {
            row.style.borderBottom = "1px solid #e2e8f0";
          },

          initComplete: function () {
            const wrapper = document.getElementById("leadsTable_wrapper");
            if (wrapper) {
              wrapper.style.fontFamily = "Inter, Arial, sans-serif";
              wrapper.style.fontSize = "13.5px";
              wrapper.style.color = "#1e293b";
            }
          },
        });

        // ✅ Expand / Collapse Logic
        $("#leadsTable tbody")
          .off("click", "td.dt-control")   // 🔥 remove old handlers
          .on("click", "td.dt-control", function () {
            const tr = $(this).closest("tr");
            const row = table.row(tr);

            if (row.child.isShown()) {
              row.child.hide();
              tr.removeClass("shown");
              $(this).text("▶");
            } else {
              const rowData = row.data();
              const lead = {
                id: rowData[1],
                name: rowData[2],
                email: rowData[3],
                country: rowData[4],
                phone: rowData[5],
                message: rowData[6],
                form_type: rowData[7],
                source_page: rowData[8],
              };

              row.child(formatDetails(lead)).show();
              tr.addClass("shown");
              $(this).text("▼");
            }
          });
      }, 50);
    };

    init();

    return () => {
      clearTimeout(timeout);
      if (table) table.destroy();
    };
  }, [leads]);

  // ✅ Expanded Row UI
  function formatDetails(lead) {
    return `
    <div style="
      padding:16px;
      background:#f8fafc;
      border:1px solid #e2e8f0;
      border-radius:8px;
      margin:10px 0;
      font-size:13px;
    ">
      <div style="display:flex;flex-direction:column;gap:8px;">

        <div><strong>ID:</strong> ${lead.id}</div>
        <div><strong>Name:</strong> ${lead.name}</div>
        <div><strong>Email:</strong> ${lead.email}</div>
        <div><strong>Country:</strong> ${lead.country}</div>
        <div><strong>Phone:</strong> ${lead.phone}</div>

        <div>
          <strong>Message:</strong>
          <div style="
            margin-top:4px;
            background:#fff;
            padding:10px;
            border-radius:6px;
            border:1px solid #e2e8f0;
            word-break:break-word;
          ">
            ${lead.message}
          </div>
        </div>

        <div><strong>Form Type:</strong> ${lead.form_type}</div>
        <div><strong>Source:</strong> ${lead.source_page}</div>

      </div>
    </div>
  `;
  }

  return (
    <div
      style={{
        width: "100%",
        overflowX: "auto",
        background: "#fff",
        borderRadius: "10px",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
      }}
    >
      <table id="leadsTable" className="display" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th></th> {/* Expand column */}
            {[
              "ID",
              "Name",
              "Email",
              "Country",
              "Phone",
              "Message",
              "Form Type",
              "Source Page",
              "Actions",
            ].map((h) => (
              <th
                key={h}
                style={{
                  background: "#f8fafc",
                  color: "#64748b",
                  fontWeight: 600,
                  fontSize: "12px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                  padding: "10px 14px",
                  borderBottom: "2px solid #e2e8f0",
                  whiteSpace: "nowrap",
                }}
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>

        <tbody>
          {leads.map((lead) => (
            <tr key={lead.id} data-row={JSON.stringify(lead)}>
              {/* Expand button */}
              <td style={{ cursor: "pointer", textAlign: "center" }}>▶</td>

              <td style={{ padding: "10px 14px", color: "#94a3b8", fontSize: "12px" }}>
                {lead.id}
              </td>

              <td style={{ padding: "10px 14px", fontWeight: 500 }}>
                {lead.name}
              </td>

              <td style={{ padding: "10px 14px", color: "#3b82f6" }}>
                {lead.email}
              </td>

              <td style={{ padding: "10px 14px" }}>{lead.country}</td>

              <td style={{ padding: "10px 14px" }}>{lead.phone}</td>

              <td
                style={{
                  padding: "10px 14px",
                  maxWidth: "160px",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {lead.message}
              </td>

              <td style={{ padding: "10px 14px" }}>
                <span
                  style={{
                    background: "#eff6ff",
                    color: "#3b82f6",
                    padding: "2px 8px",
                    borderRadius: "20px",
                    fontSize: "11.5px",
                    fontWeight: 500,
                  }}
                >
                  {lead.form_type}
                </span>
              </td>

              <td
                style={{
                  padding: "10px 14px",
                  color: "#64748b",
                  fontSize: "12.5px",
                }}
              >
                {lead.source_page}
              </td>

              <td style={{ padding: "10px 14px", whiteSpace: "nowrap" }}>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit(lead);
                  }}
                  style={{
                    background: "#3b82f6",
                    color: "#fff",
                    border: "none",
                    padding: "5px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12.5px",
                    fontWeight: 500,
                    marginRight: "6px",
                  }}
                >
                  Edit
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm("Delete this lead?")) onDelete(lead.id);
                  }}
                  style={{
                    background: "#ef4444",
                    color: "#fff",
                    border: "none",
                    padding: "5px 12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "12.5px",
                    fontWeight: 500,
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