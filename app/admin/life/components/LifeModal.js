import ImagePreview from "./ImagePreview";

export default function LifeModal({ form, setForm, editingId, onSubmit, onClose }) {

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    setForm({ ...form, galleryFiles: files });
  };

  return (
    <div className="modal">
      <div className="modal-box" style={{ width: "500px", maxHeight: "90vh", overflowY: "auto" }}>
        <h3 style={{ marginBottom: "16px" }}>
          {editingId ? "Edit Item" : "Add Item"}
        </h3>

        <label>Category Slug</label>
        <input
          placeholder="e.g. campus"
          value={form.category}
          onChange={(e) => setForm({ ...form, category: e.target.value })}
        />

        <label>Category Title</label>
        <input
          placeholder="e.g. Campus Placement"
          value={form.category_title}
          onChange={(e) => setForm({ ...form, category_title: e.target.value })}
        />

        <label>Year</label>
        <input
          placeholder="e.g. 2023"
          value={form.year}
          onChange={(e) => setForm({ ...form, year: e.target.value })}
        />

        <label>Description</label>
        <input
          placeholder="Short description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <label>Sort Order</label>
        <input
          type="number"
          placeholder="0"
          value={form.sort_order}
          onChange={(e) => setForm({ ...form, sort_order: e.target.value })}
        />

        <label style={{ display: "flex", alignItems: "center", gap: "8px", margin: "8px 0" }}>
          <input
            type="checkbox"
            checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            style={{ width: "auto", margin: 0 }}
          />
          Active
        </label>

        {/* Banner Image */}
        <label style={{ marginTop: "12px", display: "block" }}>
          Banner Image {editingId && "(leave empty to keep current)"}
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={(e) => setForm({ ...form, banner: e.target.files[0] })}
        />
        <ImagePreview file={form.banner} existingUrl={editingId ? form.existingBanner : null} />

        {/* Gallery Images */}
        <label style={{ marginTop: "16px", display: "block" }}>
          Gallery Images (select multiple){" "}
          {editingId && "(leave empty to keep current)"}
        </label>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleGalleryChange}
        />

        {/* Gallery Preview */}
        {form.galleryFiles?.length > 0 && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "10px" }}>
            {form.galleryFiles.map((file, i) => (
              <ImagePreview key={i} file={file} />
            ))}
          </div>
        )}

        {/* Existing gallery preview when editing */}
        {editingId && form.existingGallery?.length > 0 && !form.galleryFiles?.length && (
          <div>
            <p style={{ fontSize: "12px", color: "#888", marginTop: "8px" }}>
              Current gallery ({form.existingGallery.length} images):
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {form.existingGallery.map((url, i) => (
                <img key={i} src={url} width="80" height="60"
                  style={{ objectFit: "cover", borderRadius: "6px" }} />
              ))}
            </div>
          </div>
        )}

        <div style={{ marginTop: "20px", display: "flex", gap: "8px" }}>
          <button className="btn btn-edit" onClick={onSubmit}>
            {editingId ? "Update" : "Create"}
          </button>
          <button className="btn btn-delete" onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}