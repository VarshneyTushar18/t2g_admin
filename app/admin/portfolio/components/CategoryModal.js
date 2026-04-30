export default function CategoryModal({ form, setForm, editingId, onSubmit, onClose }) {
    return (
        <div className="modal">
            <div className="modal-box" style={{ width: "420px" }}>
                <h3 style={{ marginBottom: "16px" }}>
                    {editingId ? "Edit Category" : "Add Category"}
                </h3>

                <label>Category Name</label>
                <input
                    placeholder="e.g. E-commerce"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    onKeyDown={(e) => e.key === "Enter" && onSubmit()}
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