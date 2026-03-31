"use client";

export default function LeadModal({ form, setForm, onSubmit, onClose }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="modal">
      <div className="modal-box" style={{ maxWidth: "500px", width: "90%", maxHeight: "90vh", overflowY: "auto" }}>
        <h2 style={{ marginBottom: "20px", fontSize: "20px", fontWeight: "700" }}>Edit Lead</h2>

        <label>Name</label>
        <input 
          type="text" 
          name="name" 
          value={form.name || ""} 
          onChange={handleChange} 
          required 
        />

        <label>Email</label>
        <input 
          type="email" 
          name="email" 
          value={form.email || ""} 
          onChange={handleChange} 
          required 
        />

        <label>Phone</label>
        <input 
          type="text" 
          name="phone" 
          value={form.phone || ""} 
          onChange={handleChange} 
        />

        <label>Country</label>
        <input 
          type="text" 
          name="country" 
          value={form.country || ""} 
          onChange={handleChange} 
        />

        <label>Message</label>
        <textarea 
          name="message" 
          value={form.message || ""} 
          onChange={handleChange} 
          style={{ width: "100%", padding: "8px", border: "1px solid #ddd", borderRadius: "6px", marginBottom: "10px", minHeight: "80px" }}
        />

        <label>Form Type</label>
        <input 
          type="text" 
          name="form_type" 
          value={form.form_type || ""} 
          onChange={handleChange} 
        />

        <label>Source Page</label>
        <input 
          type="text" 
          name="source_page" 
          value={form.source_page || ""} 
          onChange={handleChange} 
        />

        <div style={{ display: "flex", justifyContent: "flex-end", gap: "10px", marginTop: "20px" }}>
          <button 
            type="button" 
            onClick={onClose}
            style={{ padding: "8px 16px", borderRadius: "6px", border: "1px solid #ccc", background: "#f9f9f9", cursor: "pointer" }}
          >
            Cancel
          </button>
          <button 
            type="button" 
            onClick={onSubmit}
            style={{ padding: "8px 16px", borderRadius: "6px", border: "none", background: "#4f8ef7", color: "white", cursor: "pointer", fontWeight: "600" }}
          >
            Save Changes
          </button>
        </div>
      </div>
      <style>{`
        .modal {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 9999;
        }
        .modal-box {
          background: white;
          padding: 25px;
          border-radius: 12px;
          box-shadow: 0 5px 20px rgba(0,0,0,0.15);
        }
        .modal-box input {
          width: 100%;
          margin-bottom: 12px;
          padding: 10px;
          border: 1px solid #ddd;
          border-radius: 6px;
          box-sizing: border-box;
          font-size: 14px;
        }
        .modal-box label {
          font-size: 13px;
          font-weight: 600;
          display: block;
          margin-bottom: 4px;
          color: #333;
        }
      `}</style>
    </div>
  );
}
