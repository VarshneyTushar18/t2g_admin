import { useCallback, useEffect, useState } from "react";
import { deleteLead, getLeads } from "../services/leadService";

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

export function useLeads() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [formType, setFormType] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const loadLeads = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getLeads({
        page,
        limit,
        search: debouncedSearch,
        form_type: formType,
      });
      setLeads(res.data || []);
      setPagination(res.pagination || DEFAULT_PAGINATION);
    } catch (err) {
      setError(err.message);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, formType]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleDelete = async (id) => {
    await deleteLead(id);
    if (leads.length === 1 && page > 1) {
      setPage((p) => p - 1);
    } else {
      loadLeads();
    }
  };

  const goToPage = (next) => {
    setPage(Math.max(1, Math.min(next, pagination.totalPages || 1)));
  };

  const changeLimit = (nextLimit) => {
    setLimit(nextLimit);
    setPage(1);
  };

  const changeFormType = (value) => {
    setFormType(value);
    setPage(1);
  };

  return {
    leads,
    loading,
    error,
    search,
    setSearch,
    formType,
    changeFormType,
    page,
    limit,
    pagination,
    goToPage,
    changeLimit,
    handleDelete,
    reload: loadLeads,
  };
}
