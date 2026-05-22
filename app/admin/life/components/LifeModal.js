import ImagePreview from "./ImagePreview";
import UploadProgressBar from "./UploadProgressBar";

export default function LifeModal({
  form,
  setForm,
  editingId,
  onSubmit,
  onClose,
  onRemoveGalleryImage,
  saving,
  uploadProgress,
  uploadLabel,
}) {
  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files || []);
    setForm({ ...form, galleryFiles: files });
    e.target.value = "";
  };

  const existingCount = form.existingGallery?.length || 0;
  const newCount = form.galleryFiles?.length || 0;

  return (
    <div className="modal">
      <div
        className="modal-box"
        style={{ width: "560px", maxHeight: "90vh", overflowY: "auto" }}
      >
        <h3 style={{ marginBottom: "16px" }}>
          {editingId ? "Edit Item" : "Add Item"}
        </h3>

        <label>Category Slug</label>
        <input
          placeholder="e.g. campus"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        <label>Section title (tab heading)</label>
        <input
          placeholder="e.g. Events Collection"
          value={form.category_title}
          onChange={(e) =>
            setForm({ ...form, category_title: e.target.value })
          }
        />
        <p style={{ fontSize: "12px", color: "#666", margin: "-6px 0 10px" }}>
          Same for all items in this category (shown above the year buttons).
        </p>

        <label>Year</label>
        <input
          placeholder="e.g. 2023"
          value={form.year}
          onChange={(e) => setForm({ ...form, year: e.target.value })}
        />

        <label>Event card title (shown on banner)</label>
        <input
          placeholder="e.g. Gitex – Dubai 2019"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <p style={{ fontSize: "12px", color: "#666", margin: "-6px 0 10px" }}>
          One line per card. Include the year here (e.g. Gitex – Dubai 2019).
        </p>

        <label>Sort Order</label>
        <input
          type="number"
          placeholder="0"
          value={form.sort_order}
          onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
        />

        <label
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            margin: "8px 0",
          }}
        >
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            style={{ width: "auto", margin: 0 }}
          />
          Active
        </label>

        <label style={{ marginTop: "12px", display: "block" }}>
          Banner Image{" "}
          {editingId
            ? "(optional — leave empty to keep current)"
            : "(required)"}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) =>
            setForm({ ...form, banner: e.target.files?.[0] || null })
          }
        />
        <ImagePreview
          file={form.banner}
          existingUrl={editingId ? form.existingBanner : null}
        />

        {editingId && (
          <div style={{ marginTop: "16px" }}>
            <label>Saved gallery ({existingCount} images)</label>
            <p style={{ fontSize: "12px", color: "#666", margin: "4px 0 8px" }}>
              {existingCount > 0
                ? "Click × to remove. Already on server — not re-uploaded on save."
                : "No images yet. Use “Add more photos” below."}
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {form.existingGallery.map((url, i) => (
                <div key={`${url}-${i}`} style={{ position: "relative" }}>
                  <img
                    src={url}
                    alt=""
                    width="80"
                    height="60"
                    style={{
                      objectFit: "cover",
                      borderRadius: "6px",
                      display: "block",
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => onRemoveGalleryImage(url)}
                    title="Remove image"
                    style={{
                      position: "absolute",
                      top: 2,
                      right: 2,
                      width: 22,
                      height: 22,
                      border: "none",
                      borderRadius: "50%",
                      background: "rgba(231,76,60,0.95)",
                      color: "white",
                      cursor: "pointer",
                      fontSize: 14,
                      lineHeight: 1,
                    }}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        <label style={{ marginTop: "16px", display: "block" }}>
          {editingId ? "Add more photos (new files only)" : "Gallery images"}
        </label>
        <p style={{ fontSize: "12px", color: "#666", margin: "0 0 8px" }}>
          {editingId
            ? "Select only new images. Up to 150 per batch."
            : "Multiple files or folder. Up to 150 per batch."}
        </p>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalleryChange}
        />
        <input
          type="file"
          accept="image/*"
          multiple
          webkitdirectory=""
          directory=""
          onChange={handleGalleryChange}
          style={{ marginTop: "6px" }}
        />
        <p style={{ fontSize: "11px", color: "#999", marginTop: "4px" }}>
          Second input: upload a folder (Chrome / Edge).
        </p>

        {newCount > 0 && (
          <div style={{ marginTop: "10px" }}>
            <p
              style={{ fontSize: "12px", color: "#16a37f", marginBottom: "6px" }}
            >
              {newCount} new file{newCount !== 1 ? "s" : ""} to upload
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {form.galleryFiles.map((file, i) => (
                <ImagePreview key={`${file.name}-${i}`} file={file} />
              ))}
            </div>
          </div>
        )}

        <UploadProgressBar
          visible={saving}
          percent={uploadProgress}
          label={uploadLabel}
        />

        <div style={{ marginTop: "20px", display: "flex", gap: "8px" }}>
          <button className="btn btn-edit" onClick={onSubmit} disabled={saving}>
            {saving ? "Uploading…" : editingId ? "Update" : "Create"}
          </button>
          <button className="btn btn-delete" onClick={onClose} disabled={saving}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
