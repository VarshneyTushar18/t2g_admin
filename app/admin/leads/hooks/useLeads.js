import { useState, useEffect } from "react";
import { getLeads } from "../services/leadService";

export default function useLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const reload = async () => {
    try {
      setLoading(true);
      const data = await getLeads();
      setLeads(Array.isArray(data) ? data : (data.data ?? []));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  return { leads, loading, error, reload };
}
