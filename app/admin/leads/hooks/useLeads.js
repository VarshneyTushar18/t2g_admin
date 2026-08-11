import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { deleteLead, getLeads } from "../services/leadService";

function readFiltersFromParams(searchParams) {
  return {
    search: searchParams.get("search") || "",
    formType: searchParams.get("form_type") || "",
    sourceSite: searchParams.get("source_site") || "",
    dateFrom: searchParams.get("date_from") || "",
    dateTo: searchParams.get("date_to") || "",
  };
}

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 10,
  total: 0,
  totalPages: 1,
};

export function useLeads() {
  const searchParams = useSearchParams();
  const initialFilters = readFiltersFromParams(searchParams);

  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState(initialFilters.search);
  const [debouncedSearch, setDebouncedSearch] = useState(initialFilters.search);
  const [formType, setFormType] = useState(initialFilters.formType);
  const [sourceSite, setSourceSite] = useState(initialFilters.sourceSite);
  const [dateFrom, setDateFrom] = useState(initialFilters.dateFrom);
  const [dateTo, setDateTo] = useState(initialFilters.dateTo);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);

  useEffect(() => {
    const next = readFiltersFromParams(searchParams);
    setSearch(next.search);
    setDebouncedSearch(next.search);
    setFormType(next.formType);
    setSourceSite(next.sourceSite);
    setDateFrom(next.dateFrom);
    setDateTo(next.dateTo);
    setPage(1);
  }, [searchParams]);

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
