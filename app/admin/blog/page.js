"use client";

import { useEffect, useMemo, useState } from "react";
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
import "./blog-admin.css";

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

  const { total = 0, totalPages = 1 } = pagination;
  const from = total === 0 ? 0 : (page - 1) * limit + 1;
  const to = Math.min(page * limit, total);

  const pageStats = useMemo(() => {
    const published = items.filter((i) => i.status === "publish").length;
    const drafts = items.filter((i) => i.status === "draft").length;
    return { published, drafts };
  }, [items]);

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await createCategory(newCategory);
      setNewCategory("");
      await loadCategories();
      setSuccess("Category added.");
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
      <div className="blog-admin-page">
        <div className="blog-loading">Loading…</div>
      </div>
    );
  }

  const readOnly = isReadOnly("blog");

  return (
    <div className="blog-admin-page">
      <div className="blog-admin-inner">
        <Link href="/admin" className="blog-admin-back">
          ← All modules
        </Link>

        <section className="blog-admin-hero">
          <div className="blog-admin-hero-row">
            <div>
              <h1>Blog</h1>
              <p>
                Manage posts, categories, and SEO for the live Tech2Globe blog.
              </p>
              <div className="blog-admin-stats">
                <div className="blog-admin-stat">
                  <strong>{total.toLocaleString()}</strong>
                  <span>Total posts</span>
                </div>
                <div className="blog-admin-stat">
                  <strong>{categories.length}</strong>
                  <span>Categories</span>
                </div>
                {items.length > 0 && (
                  <>
                    <div className="blog-admin-stat">
                      <strong>{pageStats.published}</strong>
                      <span>Published (page)</span>
                    </div>
                    <div className="blog-admin-stat">
                      <strong>{pageStats.drafts}</strong>
                      <span>Drafts (page)</span>
                    </div>
                  </>
                )}
              </div>
            </div>
            <div className="blog-admin-actions">
              {canAdd("blog") && !readOnly && (
                <Link href="/admin/blog/create" className="blog-btn blog-btn-primary">
                  + New post
                </Link>
              )}
            </div>
          </div>
        </section>

        <div className="blog-quick-links">
          <Link href="/admin/blog/agent" className="blog-quick-card">
            <div className="blog-quick-icon agent">✨</div>
            <div>
              <strong>Blog Agent</strong>
              <span>AI writing assistant</span>
            </div>
          </Link>
          <Link href="/admin/blog/agent-automations" className="blog-quick-card">
            <div className="blog-quick-icon auto">⏱️</div>
            <div>
              <strong>Automations</strong>
              <span>Scheduled AI posts</span>
            </div>
          </Link>
          <Link href="/admin/blog/image-agent" className="blog-quick-card">
            <div className="blog-quick-icon image">🖼️</div>
            <div>
              <strong>Image Agent</strong>
              <span>AI featured images</span>
            </div>
          </Link>
        </div>

        {readOnly && <ReadOnlyBanner moduleKey="blog" />}
        {success && <div className="blog-alert-success">{success}</div>}

        <div className="blog-card">
          <div className="blog-card-head">
            <span>All posts</span>
            {total > 0 && (
              <span style={{ fontWeight: 500, color: "#94a3b8", fontSize: 13 }}>
                {total} total
              </span>
            )}
          </div>

          <div className="blog-card-body">
            <form
              className="blog-toolbar"
              onSubmit={(e) => e.preventDefault()}
            >
              <div className="blog-search-wrap">
                <span className="blog-search-icon">🔍</span>
                <input
                  className="blog-input"
                  placeholder="Search by title or slug…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <select
                className="blog-select blog-filter-select"
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
              <button
                type="button"
                className="blog-btn blog-btn-secondary"
                onClick={handleExportSeo}
                disabled={exporting || loading}
              >
                {exporting ? "Exporting…" : "Export SEO CSV"}
              </button>
            </form>

            <details className="blog-categories-panel">
              <summary>
                Manage categories
                <span style={{ color: "#94a3b8", fontWeight: 500 }}>
                  {categories.length} total
                </span>
              </summary>
              <div className="blog-categories-inner">
                <div className="blog-cat-add-row">
                  <input
                    className="blog-input"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="New category name"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleCreateCategory();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="blog-btn blog-btn-accent"
                    onClick={handleCreateCategory}
                    disabled={readOnly || !canEdit("blog") || !newCategory.trim()}
                  >
                    Add category
                  </button>
                </div>
                <CategoryManageDropdown
                  categories={categories}
                  canDelete={canDelete("blog") && !readOnly}
                  onDelete={handleDeleteCategory}
                />
              </div>
            </details>

            {loading && <div className="blog-loading">Loading posts…</div>}
            {error && <div className="blog-alert-error">{error}</div>}

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
                  <footer className="blog-footer">
                    <div className="blog-footer-meta">
                      Showing <strong>{from}</strong>–<strong>{to}</strong> of{" "}
                      <strong>{total}</strong>
                    </div>

                    <div className="blog-per-page">
                      <span>Per page</span>
                      <select
                        className="blog-select"
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

                    <nav className="blog-pagination" aria-label="Blog list pagination">
                      <button
                        type="button"
                        className="blog-page-btn"
                        disabled={page <= 1}
                        onClick={() => goToPage(page - 1)}
                      >
                        ←
                      </button>
                      {pageNumbers(page, totalPages).map((p, i, arr) => (
                        <span key={p} style={{ display: "contents" }}>
                          {i > 0 && arr[i - 1] !== p - 1 && (
                            <span style={{ padding: "0 4px", color: "#94a3b8" }}>…</span>
                          )}
                          <button
                            type="button"
                            className={`blog-page-btn${p === page ? " active" : ""}`}
                            onClick={() => goToPage(p)}
                          >
                            {p}
                          </button>
                        </span>
                      ))}
                      <button
                        type="button"
                        className="blog-page-btn"
                        disabled={page >= totalPages}
                        onClick={() => goToPage(page + 1)}
                      >
                        →
                      </button>
                    </nav>
                  </footer>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
