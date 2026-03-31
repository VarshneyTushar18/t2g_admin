"use client";

import { useEffect, useRef } from "react";

export default function LeadTable({ leads, onDelete, onEdit }) {
  const tableRef = useRef(null);
  const dataTableRef = useRef(null);
  const onDeleteRef = useRef(onDelete);
  const onEditRef = useRef(onEdit);

  useEffect(() => {
    onDeleteRef.current = onDelete;
  }, [onDelete]);

  useEffect(() => {
    onEditRef.current = onEdit;
  }, [onEdit]);

  useEffect(() => {
    if (!tableRef.current) return;

    let isMounted = true;

    const initTable = async () => {
      const $ = (await import("jquery")).default;

      if (typeof window !== "undefined") {
        window.jQuery = $;
        window.$ = $;
      }

      await import("datatables.net-dt");
      await import("datatables.net-responsive-dt");

      if (!isMounted || !tableRef.current) return;

      if ($.fn.DataTable.isDataTable(tableRef.current)) return;

      dataTableRef.current = $(tableRef.current).DataTable({
        responsive: true,
        pageLength: 10,
        autoWidth: false,
        scrollX: false,
        data: leads || [],
        columns: [
          { data: "id", defaultContent: "" },
          { data: "name", defaultContent: "" },
          { data: "email", defaultContent: "" },
          { data: "country", defaultContent: "" },
          { data: "phone", defaultContent: "" },
          { data: "message", defaultContent: "", width: "200px" },
          { data: "form_type", defaultContent: "" },
          { data: "source_page", defaultContent: "", width: "200px" },
          {
            data: null,
            orderable: false,
            render: (data, type, row) =>
              `<button class="edit-btn" data-id="${row.id}" data-name="${encodeURIComponent(row.name ?? '')}" style="background:#3b82f6;color:#fff;border:none;padding:6px 10px;border-radius:4px;cursor:pointer;margin-right:6px;">Edit</button>
               <button class="delete-btn" data-id="${row.id}" style="background:#ef4444;color:#fff;border:none;padding:6px 10px;border-radius:4px;cursor:pointer;">Delete</button>`,
          },
        ],
      });

      $(tableRef.current).on("click", ".edit-btn", function () {
        const id = $(this).data("id");
        const name = decodeURIComponent($(this).data("name"));
        onEditRef.current?.({ id, name });
      });

      $(tableRef.current).on("click", ".delete-btn", function () {
        const id = $(this).data("id");
        if (confirm("Delete this lead?")) {
          onDeleteRef.current?.(id);
        }
      });
    };

    initTable();

    return () => {
      isMounted = false;
      if (dataTableRef.current) {
        dataTableRef.current.destroy();
        dataTableRef.current = null;
      }
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (dataTableRef.current && leads) {
      dataTableRef.current.clear();
      dataTableRef.current.rows.add(leads);
      dataTableRef.current.draw(false);
    }
  }, [leads]);

  return (
    // ✅ datatable-wrapper scopes DataTables CSS away from layout
    <div
      className="datatable-wrapper"
      style={{ width: "100%", maxWidth: "100%", overflowX: "auto", contain: "layout" }}
    >
      <table
        ref={tableRef}
        className="display"
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
        <tbody />
      </table>
    </div>
  );
}