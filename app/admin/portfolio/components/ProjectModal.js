"use client";

import { useEffect, useState } from "react";

function ImagePreview({ file, existingUrl }) {
    const [preview, setPreview] = useState(null);
    useEffect(() => {
        if (!file) { setPreview(null); return; }
        const url = URL.createObjectURL(file);
        setPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [file]);

    if (preview)
        return <img src={preview} width="200" style={{ borderRadius: "8px", marginTop: "10px", display: "block" }} />;
    if (existingUrl)
        return <img src={existingUrl} width="200" style={{ borderRadius: "8px", marginTop: "10px", display: "block", opacity: 0.6 }} />;
    return null;
}

export default function ProjectModal({
    form, setForm, editingId,
    categories, subcategories,
    onSubmit, onClose,
}) {
    return (
        <div className="modal">
            <div className="modal-box" style={{ width: "500px", maxHeight: "90vh", overflowY: "auto" }}>
                <h3 style={{ marginBottom: "16px" }}>
                    {editingId ? "Edit Project" : "Add Project"}
                </h3>

                <label>Category</label>
                <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value, subcategory_id: "" })}
                >
                    <option value="">— Select Category —</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                <label>Subcategory</label>
                <select
                    value={form.subcategory_id}
                    onChange={(e) => setForm({ ...form, subcategory_id: e.target.value })}
                >
                    <option value="">— Select Subcategory —</option>
                    {subcategories.map((s) => (
                        <option key={s.id} value={s.id}>{s.name}</option>
                    ))}
                </select>

                <label>Title</label>
                <input
                    placeholder="Project title"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                />

                <label>Description</label>
                <textarea
                    placeholder="Short description"
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                />

                <label>Project Link</label>
                <input
                    placeholder="https://..."
                    value={form.project_link}
                    onChange={(e) => setForm({ ...form, project_link: e.target.value })}
                />

                <label style={{ marginTop: "12px", display: "block" }}>
                    Project Image {editingId && "(leave empty to keep current)"}
                </label>
                <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setForm({ ...form, imageFile: e.target.files[0] || null })}
                />
                <ImagePreview
                    file={form.imageFile}
                    existingUrl={editingId ? form.existingImage : null}
                />

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