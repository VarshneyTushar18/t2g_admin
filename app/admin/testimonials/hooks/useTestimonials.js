import { useState, useEffect } from "react";
import { getTestimonials } from "../services/testimonialService";

export default function useTestimonials() {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState(null);

  const reload = async () => {
    try {
      setLoading(true);
      const data = await getTestimonials();
      setItems(data.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { reload(); }, []);

  return { items, loading, error, reload };
}