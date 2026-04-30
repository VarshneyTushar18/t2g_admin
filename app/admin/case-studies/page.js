"use client";
import { useEffect, useState, useMemo } from "react";
import useCaseStudies from "./hooks/useCaseStudies";
import CaseStudyTable from "./components/CaseStudyTable";
import CaseStudyModal from "./components/CaseStudyModal";
import {
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
  getCategories,
  createCategory,
  deleteCategory,
} from "./services/caseStudyService";

const emptyForm = {
  title: "",
  slug: "",
  category_id: "",
  short_description: "",
  content: "",
  is_featured: false,
  featured_image: null,
  existingFeaturedImage: null,
};

export default function CaseStudiesPage() {
  const [submitting, setSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const { items, loading, error, reload } = useCaseStudies();

  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [newCategory, setNewCategory] = useState("");

  const filteredItems = useMemo(() => {
    return selectedCategory
      ? items.filter((item) => item.category_id === Number(selectedCategory))
      : items;
  }, [items, selectedCategory]);

  const loadCategories = async () => {
    try {
      const data = await getCategories();
      setCategories(data);
    } catch (err) {
      console.error("Categories fetch error:", err);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setForm({
      title: item.title,
      slug: item.slug,
      category_id: item.category_id,
      short_description: item.short_description || "",
      content: item.content || "",
      is_featured: !!item.is_featured,
      featured_image: item.featured_image || "",
      existingFeaturedImage: item.featured_image || null,
    });

    setEditingId(item.id);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);
      if (editingId) {
        await updateCaseStudy(editingId, form);
      } else {
        await createCaseStudy(form);
      }
      await reload();
      setShowModal(false);
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this case study?")) return;
    await deleteCaseStudy(id);
    await reload();
  };

  const handleCreateCategory = async () => {
    if (!newCategory.trim()) return;
    try {
      await createCategory(newCategory);
      setNewCategory("");
      await loadCategories();
    } catch (err) {
      console.error("Create category error:", err);
    }
  };

  const handleDeleteCategory = async (id) => {
    if (!confirm("Delete this category?")) return;
    try {
      await deleteCategory(id);
      await loadCategories();
      await reload();
    } catch (err) {
      console.error("Delete category error:", err);
    }
  };

  return (
    <>
      <style>{`
        .cp { min-height:100vh; background:#f0f2f5; padding:20px; }
        .cp-header { display:flex; justify-content:space-between; margin-bottom:20px; }
        .cp-title { font-size:26px; font-weight:800; }
        .cp-card { background:white; border-radius:12px; box-shadow:0 2px 16px rgba(0,0,0,.08); overflow:hidden; }
        .cp-card-head { padding:16px; border-bottom:1px solid #eee; font-weight:700; }
        .cp-body { padding:16px; }

        .btn { border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; }
        .btn-edit { background:#4f8ef7; color:white; }
        .btn-delete { background:#e74c3c; color:white; }
        .btn-add { background:#16a37f; color:white; padding:8px 16px; border-radius:6px; cursor:pointer; }

        .cat-chip {
          background:#eef2f7;
          padding:6px 10px;
          border-radius:20px;
          display:flex;
          align-items:center;
          gap:6px;
        }
      `}</style>

      <div className="cp">
        <div className="cp-header">
          <h1 className="cp-title">Case Studies</h1>
          <button className="btn-add" onClick={openCreate}>
            + Add Case Study
          </button>
        </div>

        <div className="cp-card">
          <div className="cp-card-head">All Case Studies</div>

          {/* 🔥 CATEGORY SECTION */}
          <div style={{ padding: "16px", borderBottom: "1px solid #eee" }}>
            
            {/* FILTER */}
            <div style={{ marginBottom: "12px" }}>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                style={{
                  padding: "8px 12px",
                  borderRadius: "6px",
                  border: "1px solid #ccc",
                }}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* ADD CATEGORY */}
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
              <button className="btn btn-edit" onClick={handleCreateCategory}>
                Add
              </button>
            </div>

            {/* CATEGORY CHIPS */}
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {categories.map((cat) => (
                <div key={cat.id} className="cat-chip">
                  {cat.name}
                  <button
                    onClick={() => handleDeleteCategory(cat.id)}
                    style={{
                      border: "none",
                      background: "transparent",
                      color: "red",
                      cursor: "pointer",
                    }}
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>

          </div>

          {loading && <div className="cp-body">Loading...</div>}
          {error && <div className="cp-body" style={{ color: "red" }}>{error}</div>}

          {!loading && !error && (
            <div className="cp-body">
              <CaseStudyTable
                items={filteredItems}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <CaseStudyModal
          form={form}
          setForm={setForm}
          editingId={editingId}
          categories={categories}
          onSubmit={handleSubmit}
          submitting={submitting}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}