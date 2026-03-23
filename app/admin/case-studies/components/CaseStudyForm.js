"use client";
import CustomEditor from "./CustomEditor";
import { slugify } from "../../utilis/slugify";

export default function CaseStudyForm({
  form,
  setForm,
  categories,
  onSubmit,
  submitting,
  editingId,
  onClose,
}) {
  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // ✅ FIXED — strips all HTML tags to check if real content exists
  const isEmptyContent = (html) => {
    if (!html) return true;
    const stripped = html.replace(/<[^>]*>/g, "").trim();
    return stripped.length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.title?.trim()) return alert("Title is required");
    if (!form.slug?.trim()) return alert("Slug is required");
    if (!form.category_id) return alert("Category is required");
    if (isEmptyContent(form.content)) return alert("Content is required");
    onSubmit();
  };

  return (
    <>
      <style>{`
        .csf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .csf-full { grid-column: 1 / -1; }
        .csf-group { display: flex; flex-direction: column; gap: 6px; }
        .csf-label { font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: .6px; color: #666; }
        .csf-input, .csf-select, .csf-textarea { border: 1.5px solid #e0e3e8; border-radius: 8px; padding: 9px 12px; font-size: 13.5px; color: #1a1a2e; outline: none; width: 100%; box-sizing: border-box; transition: border-color .2s, box-shadow .2s; background: #fff; }
        .csf-input:focus, .csf-select:focus, .csf-textarea:focus { border-color: #4f8ef7; box-shadow: 0 0 0 3px rgba(79,142,247,.12); }
        .csf-input[readonly] { background: #f8f9fb; color: #999; cursor: not-allowed; }
        .csf-textarea { resize: vertical; min-height: 80px; }
        .csf-editor-wrap { border: 1.5px solid #e0e3e8; border-radius: 8px; overflow: hidden; min-height: 200px; }
        .csf-editor-wrap:focus-within { border-color: #4f8ef7; box-shadow: 0 0 0 3px rgba(79,142,247,.12); }
        .csf-check-row { display: flex; align-items: center; gap: 10px; padding: 10px 12px; border: 1.5px solid #e0e3e8; border-radius: 8px; cursor: pointer; }
        .csf-check-row input[type="checkbox"] { width: 16px; height: 16px; accent-color: #4f8ef7; cursor: pointer; }
        .csf-check-label { font-size: 13.5px; color: #1a1a2e; cursor: pointer; }
        .csf-actions { display: flex; gap: 10px; justify-content: flex-end; margin-top: 24px; padding-top: 16px; border-top: 1px solid #eee; }
        .csf-btn { padding: 9px 22px; border-radius: 8px; font-size: 13.5px; font-weight: 700; border: none; cursor: pointer; transition: opacity .2s; }
        .csf-btn:disabled { opacity: .6; cursor: not-allowed; }
        .csf-btn-primary { background: #16a37f; color: #fff; }
        .csf-btn-primary:hover:not(:disabled) { background: #128c6c; }
        .csf-btn-cancel { background: #f0f2f5; color: #555; }
        .csf-btn-cancel:hover { background: #e0e3e8; }
        @media (max-width: 560px) { .csf-grid { grid-template-columns: 1fr; } .csf-full { grid-column: 1; } }
      `}</style>

      <form onSubmit={handleSubmit}>
        <div className="csf-grid">
          <div className="csf-group">
            <label className="csf-label">Title *</label>
            <input className="csf-input" placeholder="e.g. Online Business Growth" value={form.title || ""}
              onChange={(e) => { const val = e.target.value; handleChange("title", val); if (!editingId) handleChange("slug", slugify(val)); }} />
          </div>
          <div className="csf-group">
            <label className="csf-label">Slug (auto-generated)</label>
            <input className="csf-input" value={form.slug || ""} readOnly />
          </div>
          <div className="csf-group">
            <label className="csf-label">Category *</label>
            <select className="csf-select" value={form.category_id || ""} onChange={(e) => handleChange("category_id", e.target.value)}>
              <option value="">Select Category</option>
              {Array.isArray(categories) && categories.map((c) => (<option key={c.id} value={c.id}>{c.name}</option>))}
            </select>
          </div>
          <div className="csf-group">
            <label className="csf-label">Featured Image URL</label>
            <input className="csf-input" placeholder="https://..." value={form.featured_image || ""} onChange={(e) => handleChange("featured_image", e.target.value)} />
          </div>
          <div className="csf-group csf-full">
            <label className="csf-label">Short Description</label>
            <textarea className="csf-textarea" placeholder="Brief summary shown on the listing page..." value={form.short_description || ""} onChange={(e) => handleChange("short_description", e.target.value)} />
          </div>
          <div className="csf-group">
            <label className="csf-label">Options</label>
            <label className="csf-check-row">
              <input type="checkbox" checked={!!form.is_featured} onChange={(e) => handleChange("is_featured", e.target.checked)} />
              <span className="csf-check-label">⭐ Mark as Featured</span>
            </label>
          </div>
          <div className="csf-group csf-full">
            <label className="csf-label">Content *</label>
            <div className="csf-editor-wrap">
              <CustomEditor value={form.content || ""} onChange={(val) => handleChange("content", val)} />
            </div>
          </div>
        </div>
        <div className="csf-actions">
          <button type="button" className="csf-btn csf-btn-cancel" onClick={onClose}>Cancel</button>
          <button type="submit" className="csf-btn csf-btn-primary" disabled={submitting}>
            {submitting ? "Saving..." : editingId ? "Update Case Study" : "Create Case Study"}
          </button>
        </div>
      </form>
    </>
  );
}