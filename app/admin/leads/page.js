"use client";

import { useEffect, useState } from "react";

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // =========================
  // FETCH LEADS (UNCHANGED)
  // =========================
  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/leads`, {
      credentials: "include",
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch leads");
        return res.json();
      })
      .then((data) => {
        setLeads(Array.isArray(data) ? data : (data.data ?? []));
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  // =========================
  // DATATABLE INIT (UNCHANGED)
  // =========================
  useEffect(() => {
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
          { targets: [5, 6, 7, 8], orderable: false }, // added actions col
        ],
      });
    }

    initTable();

    return () => {
      if (table) table.destroy();
    };
  }, [loading, leads]);

  // =========================
  // DELETE
  // =========================
  async function handleDelete(id) {
    if (!confirm("Are you sure you want to delete this lead?")) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leads/${id}`,
        {
          method: "DELETE",
          credentials: "include",
        }
      );

      if (!res.ok) throw new Error("Delete failed");

      setLeads((prev) => prev.filter((lead) => lead.id !== id));
    } catch (err) {
      alert(err.message);
    }
  }

  // =========================
  // UPDATE
  // =========================
  // =========================
  // UPDATE (FIXED)
  // =========================
  async function handleUpdate(lead) {
    const name = prompt("Edit name", lead.name);

    // Prevent empty or same value update
    if (!name || name.trim() === lead.name) return;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/leads/${lead.id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ name: name.trim() }), // ✅ only send updated field
        }
      );

      if (!res.ok) throw new Error("Update failed");

      // Update UI instantly
      setLeads((prev) =>
        prev.map((l) =>
          l.id === lead.id ? { ...l, name: name.trim() } : l
        )
      );

    } catch (err) {
      alert(err.message);
    }
  }
  function getBadgeStyle(formType) {
    if (formType === "contact_page")
      return { background: "#e8f0fe", color: "#4f8ef7" };
    if (formType === "service_form")
      return { background: "#e6faf4", color: "#16a37f" };
    return { background: "#f1f3f5", color: "#666" };
  }

  return (
    <>
      {/* UI FULLY UNCHANGED */}

      <div className="lp">
        <div className="lp-header">
          <h1 className="lp-title">Leads Dashboard</h1>
          {!loading && !error && (
            <span className="lp-badge">{leads.length} total</span>
          )}
        </div>

        <div className="lp-card">
          <div className="lp-card-head">
            <div className="live-dot" />
            <h2>All Submissions</h2>
          </div>

          {loading && (
            <div className="state-box">
              <div className="spinner" />
              <span>Loading leads…</span>
            </div>
          )}

          {error && (
            <div className="state-box is-error">
              <span>⚠ {error}</span>
            </div>
          )}

          {!loading && !error && Array.isArray(leads) && (
            <div className="lp-body">
              <table id="leadTable" className="display nowrap">
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
                    <th>Actions</th> {/* NEW */}
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

                      {/* ACTIONS COLUMN */}
                      <td>
                        <button
                          onClick={() => handleUpdate(lead)}
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
                          onClick={() => handleDelete(lead.id)}
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
          )}
        </div>
      </div>
    </>
  );
}