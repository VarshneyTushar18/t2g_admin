import { useEffect, useState } from "react";
import { getLeads, deleteLead, updateLead } from "../services/leadService";

export function useLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadLeads();
  }, []);

  async function loadLeads() {
    try {
      const data = await getLeads();
      setLeads(Array.isArray(data) ? data : data.data ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(id) {
    await deleteLead(id);
    setLeads((prev) => prev.filter((l) => l.id !== id));
  }

  async function handleUpdate(lead, name) {
    await updateLead(lead.id, { name });
    setLeads((prev) =>
      prev.map((l) => (l.id === lead.id ? { ...l, name } : l))
    );
  }

  return {
    leads,
    loading,
    error,
    handleDelete,
    handleUpdate,
  };
}