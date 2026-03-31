"use client";

import { useLeads } from "./hooks/useLeads";
import LeadTable from "./components/LeadTable";

export default function LeadsPage() {
  const { leads, loading, error, handleDelete, handleUpdate } = useLeads();

  function handleEdit(lead) {
    const name = prompt("Edit name", lead.name);
    if (!name || name.trim() === lead.name) return;

    handleUpdate(lead, name.trim());
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <div>
      <h1>Leads</h1>

      <LeadTable
        leads={leads}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}