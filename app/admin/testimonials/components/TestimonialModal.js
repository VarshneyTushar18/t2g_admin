"use client";

import ImagePreview from "../../life/components/ImagePreview";

export default function TestimonialModal({ form, setForm, editingId, onSubmit, onClose }) {

  return (
    <div className="modal">
      <div className="modal-box" style={{ width: "500px", maxHeight: "90vh", overflowY: "auto" }}>

        <h3 style={{ marginBottom: "16px" }}>
          {editingId ? "Edit Testimonial" : "Add Testimonial"}
        </h3>

        {/* Name */}
        <label>Name</label>
        <input
          placeholder="Client Name"
          value={form.name || ""}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
        />

        {/* Position */}
        <label>Position / Role</label>
        <input
          placeholder="e.g. CEO, Marketing Director"
          value={form.position || ""}
          onChange={(e) => setForm({ ...form, position: e.target.value })}
        />

        {/* Testimonial */}
        <label>Testimonial Text</label>
        <textarea
          placeholder="Client feedback"
          value={form.testimonial || ""}
          onChange={(e) => setForm({ ...form, testimonial: e.target.value })}
        />

        {/* Avatar URL */}
        <label>Avatar Image URL</label>
        <input
          placeholder="https://..."
          value={form.avatar || ""}
          onChange={(e) => setForm({ ...form, avatar: e.target.value })}
        />

        {/* Avatar Preview */}
        {form.avatar && (
          <div style={{ marginTop: "8px" }}>
            <ImagePreview existingUrl={form.avatar} />
          </div>
        )}

        {/* Company Name */}
        <label style={{ marginTop: "12px" }}>Company Name</label>
        <input
          placeholder="Google / Clutch / Trustpilot"
          value={form.companyName || ""}
          onChange={(e) => setForm({ ...form, companyName: e.target.value })}
        />

        {/* Company Logo URL */}
        <label>Company Logo URL</label>
        <input
          placeholder="https://..."
          value={form.companyLogo || ""}
          onChange={(e) => setForm({ ...form, companyLogo: e.target.value })}
        />

        {/* Logo Preview */}
        {form.companyLogo && (
          <div style={{ marginTop: "8px" }}>
            <ImagePreview existingUrl={form.companyLogo} />
          </div>
        )}

        {/* Review Link */}
        <label style={{ marginTop: "12px" }}>Review Link</label>
        <input
          placeholder="External review URL"
          value={form.link || ""}
          onChange={(e) => setForm({ ...form, link: e.target.value })}
        />

        {/* Stars */}
        <label>Rating (Stars)</label>
        <input
          type="number"
          min="1"
          max="5"
          value={form.stars || 5}
          onChange={(e) => setForm({ ...form, stars: e.target.value })}
        />

        {/* Active toggle */}
        <label style={{ display: "flex", alignItems: "center", gap: "8px", margin: "12px 0" }}>
          <input
            type="checkbox"
            checked={form.is_active ?? true}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })}
            style={{ width: "auto", margin: 0 }}
          />
          Active
        </label>

        {/* Buttons */}
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