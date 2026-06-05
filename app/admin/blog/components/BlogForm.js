"use client";
import { useRef } from "react";
import CustomEditor from "../../case-studies/components/CustomEditor";
import { slugify } from "../../utilis/slugify";

const stripHtml = (html = "") =>
  String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

export default function BlogForm({
  form,
  setForm,
  categories,
  onSubmit,
  submitting,
  editingId,
  onClose,
}) {
  const editorApiRef = useRef(null);

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const toggleCategory = (categoryId) => {
    const id = Number(categoryId);
    const current = Array.isArray(form.categories) ? form.categories : [];
    const next = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    handleChange("categories", next);
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const title = form.title?.trim() || "";
    const slug = form.slug?.trim() || slugify(title);
    const content = editorApiRef.current?.getData() || form.content || "";

    if (!title) return alert("Title is required");
    if (!slug) {
      return alert("Could not generate a slug from the title. Use letters or numbers in the title.");
    }
    if (!stripHtml(content)) return alert("Content is required");

    onSubmit({
      ...form,
      title,
      slug,
      content,
    });
  };

  return (
    <>
      <style>{`
        .bf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .bf-full { grid-column: 1 / -1; }
        .bf-group { display: flex; flex-direction: column; gap: 6px; }
        .bf-label {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .6px; color: #666;
        }
        .bf-input, .bf-select, .bf-textarea {
          border: 1.5px solid #e0e3e8; border-radius: 8px; padding: 9px 12px;
          font-size: 13.5px; color: #1a1a2e; outline: none; width: 100%;
          box-sizing: border-box; background: #fff;
        }
        .bf-input:focus, .bf-select:focus, .bf-textarea:focus {
          border-color: #4f8ef7; box-shadow: 0 0 0 3px rgba(79,142,247,.12);
        }
        .bf-input[readonly] { background: #f8f9fb; color: #999; cursor: not-allowed; }
        .bf-textarea { resize: vertical; min-height: 80px; }
        .bf-editor-wrap {
          border: 1.5px solid #e0e3e8; border-radius: 8px; overflow: hidden; min-height: 220px;
        }
        .bf-editor-wrap:focus-within {
          border-color: #4f8ef7; box-shadow: 0 0 0 3px rgba(79,142,247,.12);
        }
        .bf-cats { display: flex; flex-wrap: wrap; gap: 8px; }
        .bf-cat {
          display: flex; align-items: center; gap: 6px; padding: 6px 10px;
          border: 1.5px solid #e0e3e8; border-radius: 999px; font-size: 13px; cursor: pointer;
        }
        .bf-actions {
          display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px;
          padding-top: 16px; border-top: 1px solid #eee;
        }
        .bf-btn {
          padding: 9px 22px; border-radius: 8px; font-size: 13.5px; font-weight: 700;
          border: none; cursor: pointer;
        }
        .bf-btn:disabled { opacity: .6; cursor: not-allowed; }
        .bf-btn-primary { background: #16a37f; color: #fff; }
        .bf-btn-cancel { background: #f0f2f5; color: #555; }
        @media (max-width: 560px) { .bf-grid { grid-template-columns: 1fr; } .bf-full { grid-column: 1; } }
      `}</style>

      <form onSubmit={handleSubmit}>
        <div className="bf-grid">
          <div className="bf-group">
            <label className="bf-label">Title *</label>
            <input
              className="bf-input"
              placeholder="Blog post title"
              value={form.title || ""}
              onChange={(e) => {
                const val = e.target.value;
                setForm((prev) => ({
                  ...prev,
                  title: val,
                  slug: editingId ? prev.slug : slugify(val),
                }));
              }}
            />
          </div>

          <div className="bf-group">
            <label className="bf-label">Slug</label>
            <input className="bf-input" value={form.slug || ""} readOnly />
          </div>

          <div className="bf-group">
            <label className="bf-label">Status</label>
            <select
              className="bf-select"
              value={form.status || "publish"}
              onChange={(e) => handleChange("status", e.target.value)}
            >
              <option value="publish">Published</option>
              <option value="draft">Draft</option>
              <option value="pending">Pending Review</option>
            </select>
          </div>

          <div className="bf-group">
            <label className="bf-label">Featured image URL</label>
            <input
              className="bf-input"
              placeholder="https://res.cloudinary.com/... (not blog.tech2globe.com)"
              value={form.featured_image || ""}
              onChange={(e) => handleChange("featured_image", e.target.value)}
            />
          </div>

          <div className="bf-group bf-full">
            <label className="bf-label">Excerpt</label>
            <textarea
              className="bf-textarea"
              placeholder="Short summary shown in listings..."
              value={form.excerpt || ""}
              onChange={(e) => handleChange("excerpt", e.target.value)}
            />
          </div>

          <div className="bf-group bf-full">
            <label className="bf-label">Categories</label>
            <div className="bf-cats">
              {categories.map((cat) => (
                <label key={cat.id} className="bf-cat">
                  <input
                    type="checkbox"
                    checked={(form.categories || []).includes(Number(cat.id))}
                    onChange={() => toggleCategory(cat.id)}
                  />
                  {cat.name}
                </label>
              ))}
              {!categories.length && (
                <span style={{ color: "#888", fontSize: 13 }}>
                  No categories yet — add one below.
                </span>
              )}
            </div>
          </div>

          <div className="bf-group bf-full">
            <label className="bf-label">Content *</label>
            <div className="bf-editor-wrap">
              <CustomEditor
                value={form.content || ""}
                onChange={(val) => handleChange("content", val)}
                editorApiRef={editorApiRef}
              />
            </div>
          </div>
        </div>

        <div className="bf-actions">
          <button type="button" className="bf-btn bf-btn-cancel" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="bf-btn bf-btn-primary" disabled={submitting}>
            {submitting
              ? "Saving..."
              : editingId
                ? "Update Blog Post"
                : "Publish Blog Post"}
          </button>
        </div>
      </form>
    </>
  );
}
