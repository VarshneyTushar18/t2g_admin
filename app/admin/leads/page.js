"use client";

import { useState } from "react";
import useLeads from "./hooks/useLeads";
import LeadTable from "./components/LeadTable";
import LeadModal from "./components/LeadModal";
import { updateLead, deleteLead } from "./services/leadService";

export default function LeadsPage() {
  const { leads, loading, error, reload } = useLeads();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    country: "",
    message: "",
    form_type: "",
    source_page: ""
  });

  const handleEditClick = (lead) => {
    setForm({
      name: lead.name || "",
      email: lead.email || "",
      phone: lead.phone || "",
      country: lead.country || "",
      message: lead.message || "",
      form_type: lead.form_type || "",
      source_page: lead.source_page || ""
    });
    setEditingId(lead.id);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async () => {
    if (!editingId) return;
    try {
      await updateLead(editingId, form);
      setIsModalOpen(false);
      reload(); // Refresh the datatable
    } catch (err) {
      alert("Failed to update lead: " + err.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Are you sure you want to delete this lead?")) return;
    try {
      await deleteLead(id);
      reload(); // Refresh the datatable
    } catch (err) {
      alert("Failed to delete lead: " + err.message);
    }
  };

  return (
    <>
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

          {!loading && !error && (
            <LeadTable
              leads={leads}
              onEdit={handleEditClick}
              onDelete={handleDelete}
            />
          )}
        </div>
      </div>

      {isModalOpen && (
        <LeadModal
          form={form}
          setForm={setForm}
          onSubmit={handleModalSubmit}
          onClose={() => setIsModalOpen(false)}
        />
      )}
    </>
  );
}