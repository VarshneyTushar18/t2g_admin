"use client";
import { useRef, useState } from "react";
import CustomEditor from "../../case-studies/components/CustomEditor";
import { slugify } from "../../utilis/slugify";
import { emptyBlogSeo } from "../services/blogService";

const SITE_HOST = "www.tech2globe.com";

const stripHtml = (html = "") =>
  String(html)
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

const scoreSeo = (form) => {
  const seo = form.seo || {};
  const title = (seo.meta_title || form.title || "").trim();
  const desc = (seo.meta_description || form.excerpt || "").trim();
  const keyword = (seo.focus_keyword || "").toLowerCase();
  const content = stripHtml(form.content).toLowerCase();
  let issues = 0;

  if (!title) issues += 2;
  else if (title.length < 30 || title.length > 60) issues += 1;
  if (!desc) issues += 2;
  else if (desc.length < 120 || desc.length > 160) issues += 1;
  if (keyword && !title.toLowerCase().includes(keyword) && !content.includes(keyword)) {
    issues += 1;
  }

  if (issues === 0) return { level: "good", label: "Good" };
  if (issues <= 2) return { level: "ok", label: "Needs improvement" };
  return { level: "poor", label: "Needs work" };
};

const scoreReadability = (form) => {
  const words = stripHtml(form.content).split(/\s+/).filter(Boolean);
  if (words.length >= 300) return { level: "good", label: "Good" };
  if (words.length >= 150) return { level: "ok", label: "Needs improvement" };
  return { level: "poor", label: "Too short" };
};

function ScoreBadge({ score }) {
  return (
    <span className={`bf-score bf-score-${score.level}`}>
      {score.level === "good" ? "😊" : score.level === "ok" ? "😐" : "☹️"} {score.label}
    </span>
  );
}

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
  const imageRef = useRef(null);
  const [tab, setTab] = useState("content");

  const seo = form.seo || emptyBlogSeo;

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const handleSeoChange = (field, value) =>
    setForm((prev) => ({
      ...prev,
      seo: { ...(prev.seo || emptyBlogSeo), [field]: value },
    }));

  const toggleCategory = (categoryId) => {
    const id = Number(categoryId);
    const current = Array.isArray(form.categories) ? form.categories : [];
    const next = current.includes(id)
      ? current.filter((c) => c !== id)
      : [...current, id];
    handleChange("categories", next);
  };

  const imagePreview =
    form.featuredImageFile instanceof File
      ? URL.createObjectURL(form.featuredImageFile)
      : form.featured_image || "";

  const handleImagePick = (file) => {
    if (!file) return;
    setForm((prev) => ({
      ...prev,
      featuredImageFile: file,
      featured_image: "",
    }));
  };

  const clearImage = () => {
    setForm((prev) => => ({
      ...prev,
      featuredImageFile: null,
      featured_image: "",
    }));
    if (imageRef.current) imageRef.current.value = "";
  };

  const previewTitle = seo.meta_title || form.title || "Blog post title";
  const previewDesc =
    seo.meta_description ||
    form.excerpt ||
    "Add a meta description or excerpt for search results.";
  const previewUrl =
    seo.canonical_url ||
    (form.slug ? `https://${SITE_HOST}/blogs/${form.slug}` : `https://${SITE_HOST}/blogs/...`);
  const previewImage =
    seo.og_image || imagePreview || "";

  const seoScore = scoreSeo(form);
  const readabilityScore = scoreReadability(form);

  const handleSubmit = (e) => {
    e.preventDefault();

    const title = form.title?.trim() || "";
    const slug = form.slug?.trim() || slugify(title);
    const content = editorApiRef.current?.getData() || form.content || "";
    const author_name = form.author_name?.trim() || "";
    const tags = Array.isArray(form.tags)
      ? form.tags
      : String(form.tagsInput || "")
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean);

    if (!title) return alert("Title is required");
    if (!slug) {
      return alert("Could not generate a slug from the title. Use letters or numbers in the title.");
    }
    if (!author_name) return alert("Posted by name is required");
    if (!stripHtml(content)) return alert("Content is required");

    onSubmit({
      ...form,
      title,
      slug,
      content,
      author_name,
      tags,
    });
  };

  const tagsInputValue = Array.isArray(form.tags)
    ? form.tags.join(", ")
    : form.tagsInput || "";

  return (
    <>
      <style>{`
        .bf-tabs {
          display: flex; gap: 4px; margin-bottom: 20px; border-bottom: 1px solid #e8eaed;
          flex-wrap: wrap;
        }
        .bf-tab {
          padding: 10px 16px; border: none; background: none; cursor: pointer;
          font-size: 13px; font-weight: 700; color: #64748b; border-bottom: 2px solid transparent;
          margin-bottom: -1px;
        }
        .bf-tab.active { color: #141e46; border-bottom-color: #16a37f; }
        .bf-tab-scores { margin-left: auto; display: flex; gap: 8px; align-items: center; flex-wrap: wrap; }
        .bf-score {
          font-size: 11px; font-weight: 700; padding: 4px 10px; border-radius: 999px;
        }
        .bf-score-good { background: #d1fae5; color: #065f46; }
        .bf-score-ok { background: #fef3c7; color: #92400e; }
        .bf-score-poor { background: #fee2e2; color: #991b1b; }
        .bf-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .bf-full { grid-column: 1 / -1; }
        .bf-group { display: flex; flex-direction: column; gap: 6px; }
        .bf-label {
          font-size: 11px; font-weight: 700; text-transform: uppercase;
          letter-spacing: .6px; color: #666;
        }
        .bf-hint { font-size: 12px; color: #94a3b8; font-weight: 400; text-transform: none; letter-spacing: 0; }
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
        .bf-char { font-size: 11px; color: #94a3b8; text-align: right; }
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
        .bf-upload {
          border: 1.5px dashed #c5cad3; border-radius: 10px; min-height: 140px;
          display: flex; align-items: center; justify-content: center; flex-direction: column;
          gap: 8px; cursor: pointer; background: #fafbfc; color: #64748b; font-size: 13px;
          overflow: hidden;
        }
        .bf-upload:hover { border-color: #4f8ef7; background: #f8fbff; }
        .bf-preview { width: 100%; max-height: 180px; object-fit: cover; display: block; }
        .bf-clear-img {
          align-self: flex-start; background: none; border: none; color: #e74c3c;
          font-size: 12px; cursor: pointer; padding: 0;
        }
        .bf-snippet {
          border: 1px solid #e0e3e8; border-radius: 10px; padding: 16px; background: #fafbfc;
        }
        .bf-snippet-url { font-size: 12px; color: #1a0dab; margin-bottom: 4px; word-break: break-all; }
        .bf-snippet-title { font-size: 18px; color: #1a0dab; margin-bottom: 4px; line-height: 1.3; }
        .bf-snippet-desc { font-size: 13px; color: #4d5156; line-height: 1.5; }
        .bf-check-row {
          display: flex; align-items: center; gap: 10px; padding: 10px 12px;
          border: 1.5px solid #e0e3e8; border-radius: 8px; cursor: pointer;
        }
        .bf-check-row input { width: 16px; height: 16px; accent-color: #16a37f; }
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
        @media (max-width: 560px) {
          .bf-grid { grid-template-columns: 1fr; }
          .bf-full { grid-column: 1; }
          .bf-tab-scores { margin-left: 0; width: 100%; margin-top: 8px; }
        }
      `}</style>

      <form onSubmit={handleSubmit}>
        <div className="bf-tabs">
          <button
            type="button"
            className={`bf-tab${tab === "content" ? " active" : ""}`}
            onClick={() => setTab("content")}
          >
            Content
          </button>
          <button
            type="button"
            className={`bf-tab${tab === "seo" ? " active" : ""}`}
            onClick={() => setTab("seo")}
          >
            SEO
          </button>
          <button
            type="button"
            className={`bf-tab${tab === "social" ? " active" : ""}`}
            onClick={() => setTab("social")}
          >
            Social
          </button>
          <div className="bf-tab-scores">
            <ScoreBadge score={seoScore} />
            <ScoreBadge score={readabilityScore} />
          </div>
        </div>

        {tab === "content" && (
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
              <label className="bf-label">Posted by *</label>
              <input
                className="bf-input"
                placeholder="e.g. John Smith"
                value={form.author_name || ""}
                onChange={(e) => handleChange("author_name", e.target.value)}
              />
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

            <div className="bf-group bf-full">
              <label className="bf-label">Featured image</label>
              <div className="bf-upload" onClick={() => imageRef.current?.click()}>
                {imagePreview ? (
                  <img src={imagePreview} alt="Featured preview" className="bf-preview" />
                ) : (
                  <>
                    <span style={{ fontSize: 28 }}>🖼️</span>
                    <span>Click to upload image (JPG, PNG, WEBP)</span>
                  </>
                )}
                <input
                  ref={imageRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  style={{ display: "none" }}
                  onChange={(e) => handleImagePick(e.target.files?.[0])}
                />
              </div>
              {imagePreview && (
                <button type="button" className="bf-clear-img" onClick={clearImage}>
                  ✕ Remove image
                </button>
              )}
            </div>

            <div className="bf-group bf-full">
              <label className="bf-label">Excerpt</label>
              <textarea
                className="bf-textarea"
                placeholder="Short summary shown in listings and search if meta description is empty..."
                value={form.excerpt || ""}
                onChange={(e) => handleChange("excerpt", e.target.value)}
              />
            </div>

            <div className="bf-group bf-full">
              <label className="bf-label">
                Tags <span className="bf-hint">(comma-separated)</span>
              </label>
              <input
                className="bf-input"
                placeholder="e.g. SEO, marketing, ecommerce"
                value={tagsInputValue}
                onChange={(e) => {
                  const val = e.target.value;
                  setForm((prev) => ({
                    ...prev,
                    tagsInput: val,
                    tags: val
                      .split(",")
                      .map((t) => t.trim())
                      .filter(Boolean),
                  }));
                }}
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
        )}

        {tab === "seo" && (
          <div className="bf-grid">
            <div className="bf-group bf-full">
              <label className="bf-label">Google preview</label>
              <div className="bf-snippet">
                <div className="bf-snippet-url">{previewUrl}</div>
                <div className="bf-snippet-title">{previewTitle}</div>
                <div className="bf-snippet-desc">{previewDesc}</div>
              </div>
            </div>

            <div className="bf-group bf-full">
              <label className="bf-label">Focus keyphrase</label>
              <input
                className="bf-input"
                placeholder="Main keyword for this post"
                value={seo.focus_keyword || ""}
                onChange={(e) => handleSeoChange("focus_keyword", e.target.value)}
              />
            </div>

            <div className="bf-group bf-full">
              <label className="bf-label">SEO title</label>
              <input
                className="bf-input"
                placeholder="Leave blank to use post title"
                value={seo.meta_title || ""}
                onChange={(e) => handleSeoChange("meta_title", e.target.value)}
              />
              <div className="bf-char">{(seo.meta_title || "").length} / 60 recommended</div>
            </div>

            <div className="bf-group bf-full">
              <label className="bf-label">Meta description</label>
              <textarea
                className="bf-textarea"
                placeholder="Leave blank to use excerpt"
                value={seo.meta_description || ""}
                onChange={(e) => handleSeoChange("meta_description", e.target.value)}
              />
              <div className="bf-char">
                {(seo.meta_description || "").length} / 160 recommended
              </div>
            </div>

            <div className="bf-group bf-full">
              <label className="bf-label">Canonical URL</label>
              <input
                className="bf-input"
                placeholder={`https://${SITE_HOST}/blogs/your-slug`}
                value={seo.canonical_url || ""}
                onChange={(e) => handleSeoChange("canonical_url", e.target.value)}
              />
            </div>

            <div className="bf-group">
              <label className="bf-label">Search visibility</label>
              <label className="bf-check-row">
                <input
                  type="checkbox"
                  checked={!!seo.robots_noindex}
                  onChange={(e) => handleSeoChange("robots_noindex", e.target.checked)}
                />
                <span>Hide from search engines (noindex)</span>
              </label>
            </div>

            <div className="bf-group">
              <label className="bf-label">&nbsp;</label>
              <label className="bf-check-row">
                <input
                  type="checkbox"
                  checked={!!seo.robots_nofollow}
                  onChange={(e) => handleSeoChange("robots_nofollow", e.target.checked)}
                />
                <span>Nofollow links on this page</span>
              </label>
            </div>
          </div>
        )}

        {tab === "social" && (
          <div className="bf-grid">
            <div className="bf-group bf-full">
              <p className="bf-hint" style={{ margin: 0 }}>
                Leave social fields blank to use SEO title, description, and featured image.
              </p>
            </div>

            <div className="bf-group bf-full">
              <label className="bf-label">Open Graph title</label>
              <input
                className="bf-input"
                value={seo.og_title || ""}
                onChange={(e) => handleSeoChange("og_title", e.target.value)}
              />
            </div>

            <div className="bf-group bf-full">
              <label className="bf-label">Open Graph description</label>
              <textarea
                className="bf-textarea"
                value={seo.og_description || ""}
                onChange={(e) => handleSeoChange("og_description", e.target.value)}
              />
            </div>

            <div className="bf-group bf-full">
              <label className="bf-label">Open Graph image URL</label>
              <input
                className="bf-input"
                placeholder="Leave blank to use featured image"
                value={seo.og_image || ""}
                onChange={(e) => handleSeoChange("og_image", e.target.value)}
              />
              {previewImage && (
                <img
                  src={previewImage}
                  alt="Social preview"
                  className="bf-preview"
                  style={{ marginTop: 8, borderRadius: 8, maxHeight: 120 }}
                />
              )}
            </div>

            <div className="bf-group bf-full">
              <label className="bf-label">Twitter / X title</label>
              <input
                className="bf-input"
                value={seo.twitter_title || ""}
                onChange={(e) => handleSeoChange("twitter_title", e.target.value)}
              />
            </div>

            <div className="bf-group bf-full">
              <label className="bf-label">Twitter / X description</label>
              <textarea
                className="bf-textarea"
                value={seo.twitter_description || ""}
                onChange={(e) => handleSeoChange("twitter_description", e.target.value)}
              />
            </div>

            <div className="bf-group bf-full">
              <label className="bf-label">Twitter / X image URL</label>
              <input
                className="bf-input"
                placeholder="Leave blank to use OG image"
                value={seo.twitter_image || ""}
                onChange={(e) => handleSeoChange("twitter_image", e.target.value)}
              />
            </div>
          </div>
        )}

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
