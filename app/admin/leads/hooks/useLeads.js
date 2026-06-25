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
  const [sourceSite, setSourceSite] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
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
      const query = {
        page,
        limit,
        search: debouncedSearch,
        date_from: dateFrom,
        date_to: dateTo,
      };

      const res = await getLeads({
        ...query,
        form_type: formType,
        source_site: sourceSite,
      });

      setLeads(res.data || []);
      setPagination(res.pagination || DEFAULT_PAGINATION);
    } catch (err) {
      setError(err.message);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, formType, sourceSite, dateFrom, dateTo]);

  useEffect(() => {
    loadLeads();
  }, [loadLeads]);

  const handleDelete = async (lead) => {
    await deleteLead(lead.id);

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

  const changeSourceSite = (value) => {
    setSourceSite(value);
    setPage(1);
  };

  const changeDateRange = (from, to) => {
    setDateFrom(from);
    setDateTo(to);
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
    sourceSite,
    changeSourceSite,
    dateFrom,
    dateTo,
    changeDateRange,
    page,
    limit,
    pagination,
    goToPage,
    changeLimit,
    handleDelete,
    reload: loadLeads,
  };
}
