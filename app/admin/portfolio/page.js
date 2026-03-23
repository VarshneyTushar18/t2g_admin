"use client";

import { useState, useEffect, useRef } from "react";

import { Turnstile } from "@marsidev/react-turnstile";


const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

const safeFetch = (url, options = {}) =>
  fetch(url, options)
    .then((r) => r.json())
    .then((data) => (Array.isArray(data) ? data : []))
    .catch(() => []);

export default function AdminPortfolio() {
  const [tab, setTab] = useState("categories");
    const [cfToken, setCfToken] = useState("");


      const handleSubmit = async (e) => {
    e.preventDefault();

    if (!cfToken) {
      alert("Please complete security verification");
      return;
    }

    await axios.post("/api/admin/login", {
      email,
      password,
      cfToken,
    });
  };

  return (
    <>
      <style>{`
        .ap-wrap { font-family: 'Segoe UI', sans-serif; }
        .ap-tabs { display: flex; gap: 8px; margin-bottom: 24px; flex-wrap: wrap; }
        .ap-tab-btn {
          padding: 8px 20px; border-radius: 8px; border: none; cursor: pointer;
          font-size: 13px; font-weight: 600; background: #f1f3f5; color: #555;
          transition: all .2s;
        }
        .ap-tab-btn.active { background: #4f8ef7; color: #fff; }
        .ap-card {
          background: #fff; border-radius: 14px;
          box-shadow: 0 2px 16px rgba(0,0,0,.07); padding: 24px;
        }
        .ap-card h2 { font-size: 18px; font-weight: 800; color: #1a1a2e; margin-bottom: 20px; }
        .ap-form { display: flex; gap: 10px; flex-wrap: wrap; margin-bottom: 20px; }
        .ap-input {
          flex: 1; min-width: 180px; padding: 10px 14px;
          border: 1px solid #ddd; border-radius: 8px; font-size: 13px; outline: none;
        }
        .ap-input:focus { border-color: #4f8ef7; }
        .ap-select {
          width: 100%; padding: 10px 14px;
          border: 1px solid #ddd; border-radius: 8px; font-size: 13px; outline: none;
          margin-bottom: 10px;
        }
        .ap-btn {
          padding: 10px 20px; border-radius: 8px; border: none; cursor: pointer;
          font-size: 13px; font-weight: 600; transition: all .2s;
        }
        .ap-btn-primary { background: #4f8ef7; color: #fff; }
        .ap-btn-primary:hover { background: #3a7de0; }
        .ap-btn-danger { background: #ff4d4f; color: #fff; }
        .ap-btn-danger:hover { background: #e03e40; }
        .ap-btn-edit { background: #f0ad00; color: #fff; margin-right: 6px; }
        .ap-btn-edit:hover { background: #d49800; }
        .ap-list { list-style: none; padding: 0; margin: 0; }
        .ap-list-item {
          display: flex; align-items: center; justify-content: space-between;
          padding: 12px 16px; border-bottom: 1px solid #f3f3f3;
          font-size: 13.5px; color: #333;
        }
        .ap-list-item:last-child { border-bottom: none; }
        .ap-list-item span { font-weight: 600; }
        .ap-actions { display: flex; gap: 6px; }
        .ap-file-input { padding: 6px 0; font-size: 13px; }
        .ap-img-preview {
          width: 80px; height: 60px; object-fit: cover;
          border-radius: 6px; border: 1px solid #eee; margin-top: 6px;
        }
        .ap-textarea {
          width: 100%; padding: 10px 14px;
          border: 1px solid #ddd; border-radius: 8px; font-size: 13px;
          outline: none; resize: vertical; min-height: 80px; margin-bottom: 10px;
        }
        .ap-textarea:focus { border-color: #4f8ef7; }
        .ap-msg { padding: 10px 14px; border-radius: 8px; font-size: 13px; margin-bottom: 16px; }
        .ap-msg.success { background: #e6faf4; color: #16a37f; }
        .ap-msg.error { background: #fff0f0; color: #e03e40; }
      `}</style>

      <div className="ap-wrap">
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#1a1a2e", marginBottom: 20 }}>
          Portfolio Manager
        </h1>

        <div className="ap-tabs">
          {["categories", "subcategories", "projects"].map((t) => (
            <button
              key={t}
              className={`ap-tab-btn${tab === t ? " active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {tab === "categories" && <CategoriesTab />}
        {tab === "subcategories" && <SubcategoriesTab />}
        {tab === "projects" && <ProjectsTab />}
      </div>
    </>
  );
}

// ── Categories Tab ─────────────────────────────────────────────
function CategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState(null);

  const load = () =>
    safeFetch(`${API}/api/portfolio/categories`).then(setCategories);

  useEffect(() => { load(); }, []);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleSubmit = async () => {
  if (!name.trim()) return;

  const method = editId ? "PUT" : "POST";
  const url = editId
    ? `${API}/api/portfolio/categories/${editId}`
    : `${API}/api/portfolio/categories`;

  try {
    const res = await fetch(url, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ name: name.trim() }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Request failed");
    }

    setName("");
    setEditId(null);

    showMsg(editId ? "Category updated!" : "Category added!");

    await load();

  } catch (error) {
    console.error("Category request error:", error);
    showMsg(error.message || "Failed — are you logged in?", "error");
  }
};

  const handleDelete = async (id) => {
    if (!confirm("Delete this category and all its data?")) return;
    await fetch(`${API}/api/portfolio/categories/${id}`, {
      method: "DELETE", credentials: "include",
    });
    showMsg("Category deleted!");
    load();
  };

  return (
    <div className="ap-card">
      <h2>Manage Categories</h2>
      {msg && <div className={`ap-msg ${msg.type}`}>{msg.text}</div>}
      <div className="ap-form">
        <input
          className="ap-input"
          placeholder="Category name (e.g. Ecommerce)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <button className="ap-btn ap-btn-primary" onClick={handleSubmit}>
          {editId ? "Update" : "Add Category"}
        </button>
        {editId && (
          <button className="ap-btn" style={{ background: "#eee" }}
            onClick={() => { setEditId(null); setName(""); }}>
            Cancel
          </button>
        )}
      </div>
      <ul className="ap-list">
        {categories.map((cat) => (
          <li key={cat.id} className="ap-list-item">
            <span>{cat.name}</span>
            <div className="ap-actions">
              <button className="ap-btn ap-btn-edit"
                onClick={() => { setEditId(cat.id); setName(cat.name); }}>
                Edit
              </button>
              <button className="ap-btn ap-btn-danger"
                onClick={() => handleDelete(cat.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
        {categories.length === 0 && (
          <li className="ap-list-item" style={{ color: "#aaa" }}>No categories yet.</li>
        )}
      </ul>
    </div>
  );
}

// ── Subcategories Tab ──────────────────────────────────────────
function SubcategoriesTab() {
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [name, setName] = useState("");
  const [editId, setEditId] = useState(null);
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    safeFetch(`${API}/api/portfolio/categories`)
      .then((data) => { setCategories(data); if (data[0]) setSelectedCat(String(data[0].id)); });
  }, []);

  const loadSubs = () => {
    if (!selectedCat) return;
    safeFetch(`${API}/api/portfolio/subcategories/${selectedCat}`)
      .then(setSubcategories);
  };

  useEffect(() => { loadSubs(); }, [selectedCat]);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const handleSubmit = async () => {
    if (!name.trim() || !selectedCat) return;
    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `${API}/api/portfolio/subcategories/${editId}`
      : `${API}/api/portfolio/subcategories`;

    const res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ name, category_id: selectedCat }),
    });

    if (res.ok) {
      setName(""); setEditId(null);
      showMsg(editId ? "Subcategory updated!" : "Subcategory added!");
      loadSubs();
    } else {
      showMsg("Failed — are you logged in?", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this subcategory and all its projects?")) return;
    await fetch(`${API}/api/portfolio/subcategories/${id}`, {
      method: "DELETE", credentials: "include",
    });
    showMsg("Subcategory deleted!");
    loadSubs();
  };

  return (
    <div className="ap-card">
      <h2>Manage Subcategories</h2>
      {msg && <div className={`ap-msg ${msg.type}`}>{msg.text}</div>}
      <select className="ap-select" value={selectedCat}
        onChange={(e) => setSelectedCat(e.target.value)}>
        {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <div className="ap-form">
        <input
          className="ap-input"
          placeholder="Subcategory name (e.g. Premium A+)"
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        />
        <button className="ap-btn ap-btn-primary" onClick={handleSubmit}>
          {editId ? "Update" : "Add Subcategory"}
        </button>
        {editId && (
          <button className="ap-btn" style={{ background: "#eee" }}
            onClick={() => { setEditId(null); setName(""); }}>
            Cancel
          </button>
        )}
      </div>
      <ul className="ap-list">
        {subcategories.map((sub) => (
          <li key={sub.id} className="ap-list-item">
            <span>{sub.name}</span>
            <div className="ap-actions">
              <button className="ap-btn ap-btn-edit"
                onClick={() => { setEditId(sub.id); setName(sub.name); }}>
                Edit
              </button>
              <button className="ap-btn ap-btn-danger"
                onClick={() => handleDelete(sub.id)}>
                Delete
              </button>
            </div>
          </li>
        ))}
        {subcategories.length === 0 && (
          <li className="ap-list-item" style={{ color: "#aaa" }}>No subcategories yet.</li>
        )}
      </ul>
    </div>
  );
}

// ── Projects Tab ───────────────────────────────────────────────
function ProjectsTab() {
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState("");
  const [subcategories, setSubcategories] = useState([]);
  const [selectedSub, setSelectedSub] = useState("");
  const [projects, setProjects] = useState([]);
  const [msg, setMsg] = useState(null);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState({
    title: "", description: "", project_link: "", existing_image: ""
  });
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => {
    safeFetch(`${API}/api/portfolio/categories`)
      .then((data) => { setCategories(data); if (data[0]) setSelectedCat(String(data[0].id)); });
  }, []);

  useEffect(() => {
    if (!selectedCat) return;
    safeFetch(`${API}/api/portfolio/subcategories/${selectedCat}`)
      .then((data) => { setSubcategories(data); if (data[0]) setSelectedSub(String(data[0].id)); });
  }, [selectedCat]);

  const loadProjects = () => {
    if (!selectedSub) return;
    safeFetch(`${API}/api/portfolio/projects/${selectedSub}`).then(setProjects);
  };

  useEffect(() => { loadProjects(); }, [selectedSub]);

  const showMsg = (text, type = "success") => {
    setMsg({ text, type });
    setTimeout(() => setMsg(null), 3000);
  };

  const resetForm = () => {
    setForm({ title: "", description: "", project_link: "", existing_image: "" });
    setImageFile(null); setImagePreview(null); setEditId(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setImageFile(file);
    setImagePreview(URL.createObjectURL(file));
  };

  const handleSubmit = async () => {
    if (!form.title.trim() || !selectedSub) return;

    const fd = new FormData();
    fd.append("subcategory_id", selectedSub);
    fd.append("title", form.title);
    fd.append("description", form.description);
    fd.append("project_link", form.project_link);
    fd.append("existing_image", form.existing_image);
    if (imageFile) fd.append("image", imageFile);

    const method = editId ? "PUT" : "POST";
    const url = editId
      ? `${API}/api/portfolio/projects/${editId}`
      : `${API}/api/portfolio/projects`;

    const res = await fetch(url, { method, credentials: "include", body: fd });

    if (res.ok) {
      showMsg(editId ? "Project updated!" : "Project added!");
      resetForm();
      loadProjects();
    } else {
      showMsg("Failed — are you logged in?", "error");
    }
  };

  const handleEdit = (project) => {
    setEditId(project.id);
    setForm({
      title: project.title,
      description: project.description || "",
      project_link: project.project_link || "",
      existing_image: project.image_url || "",
    });
    setImagePreview(project.image_url || null);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this project?")) return;
    await fetch(`${API}/api/portfolio/projects/${id}`, {
      method: "DELETE", credentials: "include",
    });
    showMsg("Project deleted!");
    loadProjects();
  };

  return (
    <div className="ap-card">
      <h2>Manage Projects</h2>
      {msg && <div className={`ap-msg ${msg.type}`}>{msg.text}</div>}

      <div style={{ display: "flex", gap: 10, marginBottom: 16, flexWrap: "wrap" }}>
        <select className="ap-select" style={{ margin: 0, flex: 1 }}
          value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)}>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select className="ap-select" style={{ margin: 0, flex: 1 }}
          value={selectedSub} onChange={(e) => setSelectedSub(e.target.value)}>
          {subcategories.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
        </select>
      </div>

      <div style={{ background: "#f8f9fb", borderRadius: 10, padding: 16, marginBottom: 20 }}>
        <input className="ap-input" style={{ width: "100%", marginBottom: 10 }}
          placeholder="Project title"
          value={form.title}
          onChange={(e) => setForm({ ...form, title: e.target.value })}
        />
        <textarea className="ap-textarea"
          placeholder="Description"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />
        <input className="ap-input" style={{ width: "100%", marginBottom: 10 }}
          placeholder="Project link (https://...)"
          value={form.project_link}
          onChange={(e) => setForm({ ...form, project_link: e.target.value })}
        />
        <label style={{ fontSize: 12, color: "#666", display: "block", marginBottom: 4 }}>
          Project Image
        </label>
        <input type="file" accept="image/*" ref={fileRef}
          className="ap-file-input" onChange={handleImageChange} />
        {imagePreview && (
          <img src={imagePreview} alt="preview" className="ap-img-preview" />
        )}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button className="ap-btn ap-btn-primary" onClick={handleSubmit}>
            {editId ? "Update Project" : "Add Project"}
          </button>
          {editId && (
            <button className="ap-btn" style={{ background: "#eee" }} onClick={resetForm}>
              Cancel
            </button>
          )}
        </div>
      </div>

      <ul className="ap-list">
        {projects.map((p) => (
          <li key={p.id} className="ap-list-item">
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              {p.image_url && (
                <img src={p.image_url} alt={p.title}
                  style={{ width: 50, height: 40, objectFit: "cover", borderRadius: 6 }} />
              )}
              <div>
                <span>{p.title}</span>
                {p.project_link && (
                  <a href={p.project_link} target="_blank" rel="noreferrer"
                    style={{ fontSize: 11, color: "#4f8ef7", display: "block" }}>
                    {p.project_link}
                  </a>
                )}
              </div>
            </div>
            <div className="ap-actions">
              <button className="ap-btn ap-btn-edit" onClick={() => handleEdit(p)}>Edit</button>
              <button className="ap-btn ap-btn-danger" onClick={() => handleDelete(p.id)}>Delete</button>
            </div>
          </li>
        ))}
        {projects.length === 0 && (
          <li className="ap-list-item" style={{ color: "#aaa" }}>No projects yet.</li>
        )}
      </ul>
    </div>
  );
}