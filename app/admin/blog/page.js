"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth } from "../context/AuthContext";
import ReadOnlyBanner from "../components/ReadOnlyBanner";
import useBlogPosts from "./hooks/useBlogPosts";
import BlogTable from "./components/BlogTable";
import CategoryManageDropdown from "./components/CategoryManageDropdown";
import {
  deleteBlogPost,
  getCategories,
  createCategory,
  deleteCategory,
  exportBlogSeoCsv,
} from "./services/blogService";

function pageNumbers(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const pages = new Set([1, total, current, current - 1, current + 1]);
  return [...pages]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);
}

export default function BlogPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading: authLoading, canView, canAdd, canEdit, canDelete, isReadOnly } =
    useAuth();
  const [success, setSuccess] = useState("");
  const {
    items,
    loading,
    error,
    pagination,
    search,
    setSearch,
    page,
    limit,
    reload,
    goToPage,
    changeLimit,
    categoryFilter,
    filterByCategory,
  } = useBlogPosts();
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [exporting, setExporting] = useState(false);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Categories fetch error:", err);
    }
  };

  useEffect(() => {
    if (authLoading) return;
    if (!canView("blog")) {
      router.replace("/admin");
      return;
    }
    loadCategories();
  }, [authLoading, canView, router]);

  useEffect(() => {
    if (searchParams.get("created") === "1") {
      setSuccess("Post created successfully.");
      router.replace("/admin/blog");
    } else if (searchParams.get("updated") === "1") {
      setSuccess("Post updated successfully.");
      router.replace("/admin/blog");
    }
  }, [searchParams, router]);

  useEffect(() => {
    if (!success) return;
    const t = setTimeout(() => setSuccess(""), 4000);
    return () => clearTimeout(t);
  }, [success]);

  const handleDelete = async (item) => {
    if (!canDelete("blog")) return;
    const label = item.title || item.slug || "this post";
    if (!confirm(`Delete "${label}" permanently? This cannot be undone.`)) return;
    try {
      await deleteBlogPost(item.id);
      await reload();
      setSuccess("Post deleted.");
    } catch (err) {
      alert(err.message || "Failed to delete blog post");
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
  };

  const { total = 0, totalPages = 1 } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await createCategory(newCategory);
      setNewCategory("");
      await loadCategories();
    } catch (err) {
      alert(err.message || "Failed to create category");
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await deleteCategory(id);
      await loadCategories();
    } catch (err) {
      alert(err.message || "Failed to delete category");
    }
  };

  const handleExportSeo = async () => {
    if (exporting) return;
    try {
      setExporting(true);
      await exportBlogSeoCsv({ search });
    } catch (err) {
      alert(err.message || "SEO export failed");
    } finally {
      setExporting(false);
    }
  };

  if (authLoading || !canView("blog")) {
    return (
      <div className="bp" style={{ padding: 24 }}>
        Loading…
      </div>
    );
  }

  const readOnly = isReadOnly("blog");

  return (
    <>
      <style>{`
        .bp { min-height: 100vh; background: #f0f2f5; padding: 20px; }
        .bp-header {
          display: flex; justify-content: space-between; align-items: center;
          gap: 16px; margin-bottom: 20px; flex-wrap: wrap;
        }
        .bp-title { font-size: 26px; font-weight: 800; margin: 0; }
        .bp-subtitle { color: #666; font-size: 13px; margin-top: 4px; }
        .bp-card {
          background: white; border-radius: 12px;
          box-shadow: 0 2px 16px rgba(0,0,0,.08); overflow: hidden;
        }
        .bp-card-head {
          padding: 16px; border-bottom: 1px solid #eee; font-weight: 700;
        }
        .bp-body { padding: 16px; }
        .bp-toolbar { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 16px; }
        .bp-search {
          flex: 1; min-width: 220px; padding: 8px 12px; border: 1px solid #ccc;
          border-radius: 6px;
        }
        .btn-add {
          display: inline-flex; align-items: center;
          background: #16a37f; color: white; padding: 8px 16px;
          border-radius: 6px; border: none; cursor: pointer; font-weight: 700;
          text-decoration: none;
        }
        .btn-search {
          background: #4f8ef7; color: white; padding: 8px 16px;
          border-radius: 6px; border: none; cursor: pointer;
        }
        .btn-export {
          background: #fff; color: #141e46; padding: 8px 16px;
          border-radius: 6px; border: 1px solid #cbd5e1; cursor: pointer;
          font-weight: 600;
        }
        .btn-export:disabled { opacity: 0.6; cursor: not-allowed; }
        .bp-filter-select {
          min-width: 180px;
          padding: 8px 12px;
          border: 1px solid #ccc;
          border-radius: 6px;
          font-size: 13px;
          background: #fff;
        }
        .bp-cat-row {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 12px;
          margin-bottom: 16px;
        }
        @media (max-width: 720px) {
          .bp-cat-row { grid-template-columns: 1fr; }
        }
        .cat-chip {
          background: #eef2f7; padding: 6px 10px; border-radius: 20px;
          display: flex; align-items: center; gap: 6px; font-size: 13px;
        }
        .bp-footer {
          display: flex; flex-wrap: wrap; align-items: center;
          justify-content: space-between; gap: 12px;
          margin-top: 20px; padding-top: 16px; border-top: 1px solid #eee;
        }
        .bp-footer-meta { font-size: 13px; color: #64748b; }
        .bp-pagination { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
        .bp-page-btn {
          min-width: 36px; height: 36px; padding: 0 10px;
          border: 1px solid #ddd; border-radius: 6px; background: #fff;
          cursor: pointer; font-size: 13px;
        }
        .bp-page-btn:disabled { opacity: 0.45; cursor: not-allowed; }
        .bp-page-btn.active { background: #141e46; color: #fff; border-color: #141e46; }
        .bp-per-page { display: flex; align-items: center; gap: 8px; font-size: 13px; }
        .bp-per-page select { padding: 6px 8px; border-radius: 6px; border: 1px solid #ccc; }
        .bp-alert-success {
          background: #d1fae5; color: #065f46; padding: 12px 16px;
          border-radius: 8px; margin-bottom: 16px; font-size: 14px;
        }
        .bp-back { color: #4f46e5; text-decoration: none; font-size: 14px; font-weight: 600; }
        .bp-back:hover { text-decoration: underline; }
      `}</style>

      <div className="bp">
        <p style={{ marginBottom: 12 }}>
          <Link href="/admin" className="bp-back">
            ← All modules
          </Link>
        </p>

        <div className="bp-header">
          <div>
            <h1 className="bp-title">Blog Posts</h1>
            <p className="bp-subtitle">
              Manage posts, categories, and SEO for the live blog.
            </p>
          </div>
          {canAdd("blog") && !readOnly && (
            <Link href="/admin/blog/create" className="btn-add">
              + Add Blog Post
            </Link>
          )}
        </div>

        {readOnly && <ReadOnlyBanner moduleKey="blog" />}
        {success && <div className="bp-alert-success">{success}</div>}

        <div className="bp-card">
          <div className="bp-card-head">All Blog Posts</div>

          <div className="bp-body">
            <form className="bp-toolbar" onSubmit={handleSearch}>
              <input
                className="bp-search"
                placeholder="Search posts..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <select
                className="bp-filter-select"
                value={categoryFilter}
                onChange={(e) => filterByCategory(e.target.value)}
                aria-label="Filter by category"
              >
                <option value="">All categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
              <button type="submit" className="btn-search">
                Search
              </button>
              <button
                type="button"
                className="btn-export"
                onClick={handleExportSeo}
                disabled={exporting || loading}
              >
                {exporting ? "Exporting…" : "Export SEO CSV"}
              </button>
            </form>

            <div style={{ marginBottom: 16 }}>
              <div style={{ display: "flex", gap: 10, marginBottom: 12 }}>
                <input
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  placeholder="Add new category"
                  style={{
                    padding: "8px",
                    border: "1px solid #ccc",
                    borderRadius: "6px",
                    flex: 1,
                  }}
                />
                <button
                  type="button"
                  className="btn-search"
                  onClick={handleCreateCategory}
                  disabled={readOnly || !canEdit("blog")}
                >
                  Add Category
                </button>
              </div>
              <CategoryManageDropdown
                categories={categories}
                canDelete={canDelete("blog") && !readOnly}
                onDelete={handleDeleteCategory}
              />
            </div>

            {loading && <div>Loading...</div>}
            {error && (
              <div style={{ color: "red", marginBottom: 12 }}>{error}</div>
            )}

            {!loading && !error && (
              <>
                <BlogTable
                  items={items}
                  categories={categories}
                  onDelete={handleDelete}
                  canEdit={canEdit("blog") && !readOnly}
                  canDelete={canDelete("blog")}
                />

                {total > 0 && (
                  <footer className="bp-footer">
                    <div className="bp-footer-meta">
                      Showing <strong>{from}</strong> to <strong>{to}</strong> of{" "}
                      <strong>{total}</strong> posts
                    </div>

                    <div className="bp-per-page">
                      <span>Per page</span>
                      <select
                        value={limit}
                        onChange={(e) => changeLimit(Number(e.target.value))}
                        aria-label="Posts per page"
                      >
                        {[10, 20, 50, 100].map((n) => (
                          <option key={n} value={n}>
                            {n}
                          </option>
                        ))}
                      </select>
                    </div>

                    <nav className="bp-pagination" aria-label="Blog list pagination">
                      <button
                        type="button"
                        className="bp-page-btn"
                        disabled={page <= 1}
                        onClick={() => goToPage(page - 1)}
                      >
                        Prev
                      </button>
                      {pageNumbers(page, totalPages).map((p, i, arr) => (
                        <span key={p} style={{ display: "contents" }}>
                          {i > 0 && arr[i - 1] !== p - 1 && (
                            <span style={{ padding: "0 4px", color: "#94a3b8" }}>…</span>
                          )}
                          <button
                            type="button"
                            className={`bp-page-btn${p === page ? " active" : ""}`}
                            onClick={() => goToPage(p)}
                          >
                            {p}
                          </button>
                        </span>
                      ))}
                      <button
                        type="button"
                        className="bp-page-btn"
                        disabled={page >= totalPages}
                        onClick={() => goToPage(page + 1)}
                      >
                        Next
                      </button>
                    </nav>
                  </footer>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
