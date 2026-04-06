"use client";

import { useRef } from "react";

export default function TestimonialModal({
  form,
  setForm,
  editingId,
  onSubmit,
  onClose,
}) {
  const avatarRef      = useRef(null);
  const companyLogoRef = useRef(null);

  const handleFileChange = (field, file) => {
    if (file) setForm({ ...form, [field]: file });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-box" onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div className="modal-header">
          <h3 className="modal-title">
            {editingId ? "Edit Testimonial" : "Add Testimonial"}
          </h3>
          <button className="modal-close" onClick={onClose}>✕</button>
        </div>

        <div className="modal-body">

          {/* Row: Name + Position */}
          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label">Client Name <span className="req">*</span></label>
              <input
                className="modal-input"
                placeholder="e.g. Sarah Johnson"
                value={form.name || ""}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </div>
            <div className="modal-field">
              <label className="modal-label">Position / Role</label>
              <input
                className="modal-input"
                placeholder="e.g. CEO, Marketing Director"
                value={form.position || ""}
                onChange={(e) => setForm({ ...form, position: e.target.value })}
              />
            </div>
          </div>

          {/* Testimonial Text */}
          <div className="modal-field">
            <label className="modal-label">Testimonial <span className="req">*</span></label>
            <textarea
              className="modal-textarea"
              placeholder="Write the client's feedback here…"
              value={form.text || ""}
              onChange={(e) => setForm({ ...form, text: e.target.value })}
            />
          </div>

          {/* Row: Company Name + Stars */}
          <div className="modal-row">
            <div className="modal-field">
              <label className="modal-label">Company Name</label>
              <input
                className="modal-input"
                placeholder="e.g. Google, Clutch"
                value={form.companyName || ""}
                onChange={(e) => setForm({ ...form, companyName: e.target.value })}
              />
            </div>
            <div className="modal-field modal-field--sm">
              <label className="modal-label">Rating (Stars)</label>
              <div className="modal-stars-input">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`star-btn ${(form.stars || 5) >= n ? "star-btn--on" : ""}`}
                    onClick={() => setForm({ ...form, stars: n })}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Review Link */}
          <div className="modal-field">
            <label className="modal-label">Review Link</label>
            <input
              className="modal-input"
              placeholder="https://clutch.co/..."
              value={form.link || ""}
              onChange={(e) => setForm({ ...form, link: e.target.value })}
            />
          </div>

          {/* Row: Avatar + Company Logo uploads */}
          <div className="modal-row">

            {/* Avatar */}
            <div className="modal-field">
              <label className="modal-label">Avatar Image</label>
              <div
                className="modal-upload"
                onClick={() => avatarRef.current?.click()}
              >
                {form.avatar instanceof File ? (
                  // ✅ New file just picked — blob preview
                  <img
                    src={URL.createObjectURL(form.avatar)}
                    alt="avatar preview"
                    className="modal-preview-img"
                  />
                ) : form.avatar ? (
                  // ✅ Existing URL from API — show it
                  <img
                    src={form.avatar}
                    alt="avatar preview"
                    className="modal-preview-img"
                  />
                ) : (
                  <>
                    <span className="modal-upload-icon">👤</span>
                    <span>Click to upload</span>
                  </>
                )}
                <input
                  ref={avatarRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleFileChange("avatar", e.target.files?.[0])}
                />
              </div>
              {/* ✅ Show remove for both File and existing URL */}
              {form.avatar && (
                <button
                  className="modal-clear-file"
                  onClick={() => setForm({ ...form, avatar: null })}
                >
                  ✕ Remove
                </button>
              )}
            </div>

            {/* Company Logo */}
            <div className="modal-field">
              <label className="modal-label">Company Logo</label>
              <div
                className="modal-upload"
                onClick={() => companyLogoRef.current?.click()}
              >
                {form.companyLogo instanceof File ? (
                  // ✅ New file just picked — blob preview
                  <img
                    src={URL.createObjectURL(form.companyLogo)}
                    alt="logo preview"
                    className="modal-preview-img"
                  />
                ) : form.companyLogo ? (
                  // ✅ Existing URL from API — show it
                  <img
                    src={form.companyLogo}
                    alt="logo preview"
                    className="modal-preview-img"
                  />
                ) : (
                  <>
                    <span className="modal-upload-icon">🏢</span>
                    <span>Click to upload</span>
                  </>
                )}
                <input
                  ref={companyLogoRef}
                  type="file"
                  accept="image/*"
                  style={{ display: "none" }}
                  onChange={(e) => handleFileChange("companyLogo", e.target.files?.[0])}
                />
              </div>
              {/* ✅ Show remove for both File and existing URL */}
              {form.companyLogo && (
                <button
                  className="modal-clear-file"
                  onClick={() => setForm({ ...form, companyLogo: null })}
                >
                  ✕ Remove
                </button>
              )}
            </div>

          </div>

          {/* Active toggle */}
          <label className="modal-toggle">
            <div
              className={`toggle-track ${form.is_active ? "toggle-track--on" : ""}`}
              onClick={() => setForm({ ...form, is_active: !form.is_active })}
            >
              <div className="toggle-thumb" />
            </div>
            <span>Active</span>
          </label>

        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="btn-modal-cancel" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-modal-submit" onClick={onSubmit}>
            {editingId ? "Update Testimonial" : "Create Testimonial"}
          </button>
        </div>

      </div>
    </div>
  );
}