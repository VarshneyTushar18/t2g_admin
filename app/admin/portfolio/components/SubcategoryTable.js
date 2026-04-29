"use client";
import { useEffect, useRef } from "react";

export default function SubcategoryTable({ items, categories, onEdit, onDelete }) {
    const wrapRef = useRef(null);
    const dtRef = useRef(null);
    const catMap = Object.fromEntries(categories.map((c) => [c.id, c.name]));

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

            if (dtRef.current) {
                dtRef.current.destroy(true);
                dtRef.current = null;
            }

            wrapRef.current.innerHTML = `
        <table class="display nowrap" style="width:100%">
          <thead>
            <tr><th>ID</th><th>Category</th><th>Name</th><th>Actions</th></tr>
          </thead>
          <tbody>
            ${items.map((item) => `
              <tr>
                <td>${item.id}</td>
                <td>${catMap[item.category_id] ?? item.category_id ?? ""}</td>
                <td>${item.name ?? ""}</td>
                <td data-id="${item.id}">
                  <button class="btn btn-edit dt-edit">Edit</button>
                  <button class="btn btn-delete dt-del">Delete</button>
                </td>
              </tr>
            `).join("")}
          </tbody>
        </table>`;

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