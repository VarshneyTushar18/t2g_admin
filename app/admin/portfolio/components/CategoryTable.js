"use client";
import { useEffect, useRef } from "react";

export default function CategoryTable({ items, onEdit, onDelete }) {
    const wrapRef = useRef(null);
    const dtRef = useRef(null);

    useEffect(() => {
        if (!wrapRef.current) return;
        let cancelled = false;

        async function init() {
            const $ = (await import("jquery")).default;
            window.jQuery = $;
            await import("datatables.net-dt");
            await import("datatables.net-responsive");
            await import("datatables.net-dt/css/dataTables.dataTables.css");
            await import("datatables.net-responsive-dt/css/responsive.dataTables.css");
            if (cancelled) return;

            // Destroy previous instance fully before touching the DOM
            if (dtRef.current) {
                dtRef.current.destroy(true);
                dtRef.current = null;
            }

            // Build table in plain JS — React never owns these nodes
            wrapRef.current.innerHTML = `
        <table class="display nowrap" style="width:100%">
          <thead>
            <tr><th>ID</th><th>Name</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${items.map((item) => `
              <tr>
                <td>${item.id}</td>
                <td>${item.name ?? ""}</td>
                <td data-id="${item.id}">
                  <button class="btn btn-edit dt-edit">Edit</button>
                  <button class="btn btn-delete dt-del">Delete</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>`;

            // Attach click handlers via event delegation on the wrapper
            wrapRef.current.addEventListener("click", (e) => {
                const td = e.target.closest("td[data-id]");
                if (!td) return;
                const id = Number(td.dataset.id);
                const row = items.find((i) => i.id === id);
                if (!row) return;
                if (e.target.classList.contains("dt-edit")) onEdit(row);
                if (e.target.classList.contains("dt-del")) onDelete(id);
            });

            dtRef.current = $(wrapRef.current.querySelector("table")).DataTable({
                responsive: true,
                pageLength: 10,
            });
        }

        init();
        return () => { cancelled = true; };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [items]);

    return <div ref={wrapRef} />;
}