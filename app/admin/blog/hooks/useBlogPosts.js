import { useCallback, useEffect, useState } from "react";
import { getBlogPosts } from "../services/blogService";

const DEFAULT_PAGINATION = {
  page: 1,
  limit: 20,
  total: 0,
  totalPages: 1,
};

export default function useBlogPosts() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [categoryFilter, setCategoryFilter] = useState("");
  const [pagination, setPagination] = useState(DEFAULT_PAGINATION);

  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [search]);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await getBlogPosts({
        page,
        limit,
        search: debouncedSearch,
        category: categoryFilter,
      });
      setItems(Array.isArray(result.items) ? result.items : []);
      setPagination(result.pagination || DEFAULT_PAGINATION);
    } catch (err) {
      setError(err.message || "Failed to load blog posts");
      setItems([]);
    } finally {
      setLoading(false);
    }
  }, [page, limit, debouncedSearch, categoryFilter]);

  useEffect(() => {
    load();
  }, [load]);

  const reload = async () => {
    await load();
  };

  const goToPage = (p) => {
    setPage(Math.max(1, Math.min(p, pagination.totalPages || 1)));
  };

  const changeLimit = (next) => {
    setLimit(next);
    setPage(1);
  };

  const filterByCategory = (categoryId) => {
    setCategoryFilter(categoryId ? String(categoryId) : "");
    setPage(1);
  };

  return {
    items,
    loading,
    error,
    pagination,
    search,
    setSearch,
    page,
    limit,
    categoryFilter,
    filterByCategory,
    reload,
    goToPage,
    changeLimit,
  };
}
