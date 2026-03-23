import { useState, useEffect } from "react";
import { getCaseStudies } from "../services/caseStudyService";

export default function useCaseStudies() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const reload = async () => {
    try {
      setLoading(true);
      const data = await getCaseStudies();
      setItems(Array.isArray(data) ? data : (data.data || []));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);
  return { items, loading, error, reload };
}