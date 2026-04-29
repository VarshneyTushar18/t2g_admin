export default function SubcategoryModal({ form, setForm, editingId, categories, onSubmit, onClose }) {
    return (
        <div className="modal">
            <div className="modal-box" style={{ width: "420px" }}>
                <h3 style={{ marginBottom: "16px" }}>
                    {editingId ? "Edit Subcategory" : "Add Subcategory"}
                </h3>

                <label>Category</label>
                <select
                    value={form.category_id}
                    onChange={(e) => setForm({ ...form, category_id: e.target.value })}
                >
                    <option value="">— Select Category —</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>

                <label>Subcategory Name</label>
                <input
                    placeholder="e.g. Premium A+"
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