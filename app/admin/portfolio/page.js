"use client";

import { useState, useEffect } from "react";
import { useCategories, useSubcategories, useProjects } from "./hooks/usePortfolio";
import CategoryTable from "./components/CategoryTable";
import SubcategoryTable from "./components/SubcategoryTable";
import ProjectTable from "./components/ProjectTable";
import CategoryModal from "./components/CategoryModal";
import SubcategoryModal from "./components/SubcategoryModal";
import ProjectModal from "./components/ProjectModal";
import {
  createCategory, updateCategory, deleteCategory,
  createSubcategory, updateSubcategory, deleteSubcategory,
  createProject, updateProject, deleteProject,
  getSubcategories,
} from "./services/portfolioService";

// ── Empty form shapes ──────────────────────────────────────────
const emptyCategoryForm = { name: "" };
const emptySubcategoryForm = { name: "", category_id: "" };
const emptyProjectForm = {
  title: "", description: "", project_link: "",
  category_id: "", subcategory_id: "",
  imageFile: null, existingImage: "",
};

export default function PortfolioPage() {
  const [tab, setTab] = useState("categories");

  // ── Categories state ───────────────────────────────────────
  const { items: categories, loading: catLoading, error: catError, reload: reloadCats } = useCategories();
  const [showCatModal, setShowCatModal] = useState(false);
  const [editingCatId, setEditingCatId] = useState(null);
  const [catForm, setCatForm] = useState(emptyCategoryForm);

  // ── Subcategories state ────────────────────────────────────
  const [filterCatId, setFilterCatId] = useState("");
  const { items: subcategories, loading: subLoading, error: subError, reload: reloadSubs } = useSubcategories(filterCatId);
  const [allSubcategories, setAllSubcategories] = useState([]); // for project modal dropdown
  const [showSubModal, setShowSubModal] = useState(false);
  const [editingSubId, setEditingSubId] = useState(null);
  const [subForm, setSubForm] = useState(emptySubcategoryForm);

  // ── Projects state ─────────────────────────────────────────
  const [filterSubId, setFilterSubId] = useState("");
  const { items: projects, loading: projLoading, error: projError, reload: reloadProjects } = useProjects(filterSubId);
  const [showProjModal, setShowProjModal] = useState(false);
  const [editingProjId, setEditingProjId] = useState(null);
  const [projForm, setProjForm] = useState(emptyProjectForm);
  const [projSubsForModal, setProjSubsForModal] = useState([]);

  // ── Set initial filterCatId once categories load ───────────
  useEffect(() => {
    if (categories.length && !filterCatId) {
      setFilterCatId(String(categories[0].id));
    }
  }, [categories]);

  // ── Load all subcategories for project modal when cat changes
  useEffect(() => {
    if (!projForm.category_id) { setProjSubsForModal([]); return; }
    getSubcategories(projForm.category_id).then(setProjSubsForModal);
  }, [projForm.category_id]);

  // DataTable init is handled inside each Table component via useDataTable hook.

  // ── Category handlers ──────────────────────────────────────
  const openCatCreate = () => {
    setCatForm(emptyCategoryForm);
    setEditingCatId(null);
    setShowCatModal(true);
  };
  const openCatEdit = (item) => {
    setCatForm({ name: item.name });
    setEditingCatId(item.id);
    setShowCatModal(true);
  };
  const handleCatSubmit = async () => {
    if (!catForm.name.trim()) return;
    if (editingCatId) {
      await updateCategory(editingCatId, catForm.name.trim());
    } else {
      await createCategory(catForm.name.trim());
    }
    reloadCats();
    setShowCatModal(false);
  };
  const handleCatDelete = async (id) => {
    if (!confirm("Delete this category and all its data?")) return;
    await deleteCategory(id);
    reloadCats();
  };

  // ── Subcategory handlers ───────────────────────────────────
  const openSubCreate = () => {
    setSubForm({ ...emptySubcategoryForm, category_id: filterCatId });
    setEditingSubId(null);
    setShowSubModal(true);
  };
  const openSubEdit = (item) => {
    setSubForm({ name: item.name, category_id: String(item.category_id) });
    setEditingSubId(item.id);
    setShowSubModal(true);
  };
  const handleSubSubmit = async () => {
    if (!subForm.name.trim() || !subForm.category_id) return;
    if (editingSubId) {
      await updateSubcategory(editingSubId, subForm.name.trim(), subForm.category_id);
    } else {
      await createSubcategory(subForm.name.trim(), subForm.category_id);
    }
    reloadSubs();
    setShowSubModal(false);
  };
  const handleSubDelete = async (id) => {
    if (!confirm("Delete this subcategory and all its projects?")) return;
    await deleteSubcategory(id);
    reloadSubs();
  };

  // ── Project handlers ───────────────────────────────────────
  const openProjCreate = () => {
    setProjForm({
      ...emptyProjectForm,
      category_id: filterCatId,
      subcategory_id: filterSubId,
    });
    setEditingProjId(null);
    setShowProjModal(true);
  };
  const openProjEdit = (item) => {
    setProjForm({
      title: item.title,
      description: item.description || "",
      project_link: item.project_link || "",
      category_id: String(item.category_id || ""),
      subcategory_id: String(item.subcategory_id || filterSubId),
      imageFile: null,
      existingImage: item.image_url || "",
    });
    setEditingProjId(item.id);
    setShowProjModal(true);
  };
  const handleProjSubmit = async () => {
    if (!projForm.title.trim() || !projForm.subcategory_id) return;
    const fd = new FormData();
    fd.append("subcategory_id", projForm.subcategory_id);
    fd.append("title", projForm.title.trim());
    fd.append("description", projForm.description);
    fd.append("project_link", projForm.project_link);
    fd.append("existing_image", projForm.existingImage);
    if (projForm.imageFile) fd.append("image", projForm.imageFile);

    if (editingProjId) {
      await updateProject(editingProjId, fd);
    } else {
      await createProject(fd);
    }
    reloadProjects();
    setShowProjModal(false);
  };
  const handleProjDelete = async (id) => {
    if (!confirm("Delete this project?")) return;
    await deleteProject(id);
    reloadProjects();
  };

  // ── Add button label per tab ───────────────────────────────
  const addLabels = {
    categories: "+ Add Category",
    subcategories: "+ Add Subcategory",
    projects: "+ Add Project",
  };
  const addHandlers = {
    categories: openCatCreate,
    subcategories: openSubCreate,
    projects: openProjCreate,
  };
  const cardTitles = {
    categories: "Categories",
    subcategories: "Subcategories",
    projects: "Projects",
  };

  return (
    <>
      <style>{`
        .pp { min-height: 100vh; background: #f0f2f5; padding: 20px; }
        .pp-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; }
        .pp-title { font-size: 26px; font-weight: 800; }
        .pp-tabs { display: flex; gap: 8px; margin-bottom: 20px; flex-wrap: wrap; }
        .pp-tab-btn {
          padding: 8px 20px; border-radius: 8px; border: 1px solid #ddd;
          cursor: pointer; font-size: 13px; font-weight: 600;
          background: #fff; color: #555; transition: all .2s;
        }
        .pp-tab-btn.active { background: #4f8ef7; color: #fff; border-color: #4f8ef7; }
        .pp-card { background: white; border-radius: 12px; box-shadow: 0 2px 16px rgba(0,0,0,.08); overflow: hidden; }
        .pp-card-head { padding: 16px; border-bottom: 1px solid #eee; font-weight: 700; }
        .pp-body { padding: 16px; }
        .pp-filter { display: flex; gap: 10px; margin-bottom: 16px; flex-wrap: wrap; }
        .pp-filter select {
          padding: 7px 12px; border: 1px solid #ddd; border-radius: 8px;
          font-size: 13px; outline: none; min-width: 180px;
        }
        .btn { border: none; padding: 6px 12px; border-radius: 6px; cursor: pointer; font-size: 12px; }
        .btn-edit { background: #f0ad00; color: #fff; margin-right: 6px; }
        .btn-delete { background: #e74c3c; color: #fff; }
        .btn-add {
          background: #16a37f; color: white; padding: 8px 16px;
          border-radius: 6px; cursor: pointer; border: none;
          font-size: 13px; font-weight: 600;
        }
        .modal {
          position: fixed; top: 0; left: 0; width: 100%; height: 100%;
          background: rgba(0,0,0,.4); display: flex;
          align-items: center; justify-content: center; z-index: 1000;
        }
        .modal-box {
          background: white; padding: 25px; border-radius: 10px;
          width: 480px; max-height: 90vh; overflow-y: auto;
        }
        .modal-box input[type="text"],
        .modal-box input[type="url"],
        .modal-box input:not([type="file"]):not([type="checkbox"]) {
          width: 100%; margin-bottom: 10px; padding: 8px;
          border: 1px solid #ddd; border-radius: 6px;
          box-sizing: border-box; font-size: 14px;
        }
        .modal-box label { font-size: 13px; font-weight: 600; display: block; margin-bottom: 4px; }
      `}</style>

      <div className="pp">
        {/* Header */}
        <div className="pp-header">
          <h1 className="pp-title">Portfolio Manager</h1>
          <button className="btn-add" onClick={addHandlers[tab]}>
            {addLabels[tab]}
          </button>
        </div>

        {/* Tabs */}
        <div className="pp-tabs">
          {["categories", "subcategories", "projects"].map((t) => (
            <button
              key={t}
              className={`pp-tab-btn${tab === t ? " active" : ""}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        {/* Card */}
        <div className="pp-card">
          <div className="pp-card-head">{cardTitles[tab]}</div>

          {/* ── Categories ── */}
          {tab === "categories" && (
            <div className="pp-body">
              {catLoading && <p>Loading...</p>}
              {catError && <p style={{ color: "red" }}>{catError}</p>}
              {!catLoading && !catError && (
                <CategoryTable
                  items={categories}
                  onEdit={openCatEdit}
                  onDelete={handleCatDelete}
                />
              )}
            </div>
          )}

          {/* ── Subcategories ── */}
          {tab === "subcategories" && (
            <div className="pp-body">
              <div className="pp-filter">
                <select
                  value={filterCatId}
                  onChange={(e) => setFilterCatId(e.target.value)}
                >

                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              {subLoading && <p>Loading...</p>}
              {subError && <p style={{ color: "red" }}>{subError}</p>}
              {!subLoading && !subError && (
                <SubcategoryTable
                  items={subcategories}
                  categories={categories}
                  onEdit={openSubEdit}
                  onDelete={handleSubDelete}
                />
              )}
            </div>
          )}

          {/* ── Projects ── */}
          {tab === "projects" && (
            <div className="pp-body">
              <div className="pp-filter">
                <select
                  value={filterCatId}
                  onChange={(e) => { setFilterCatId(e.target.value); setFilterSubId(""); }}
                >
                  <option value="">— Select Category —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
                <select
                  value={filterSubId}
                  onChange={(e) => setFilterSubId(e.target.value)}
                >
                  <option value="">— Select Subcategory —</option>
                  {subcategories.map((s) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              </div>
              {projLoading && <p>Loading...</p>}
              {projError && <p style={{ color: "red" }}>{projError}</p>}
              {!projLoading && !projError && (
                <ProjectTable
                  items={projects}
                  onEdit={openProjEdit}
                  onDelete={handleProjDelete}
                />
              )}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showCatModal && (
        <CategoryModal
          form={catForm}
          setForm={setCatForm}
          editingId={editingCatId}
          onSubmit={handleCatSubmit}
          onClose={() => setShowCatModal(false)}
        />
      )}
      {showSubModal && (
        <SubcategoryModal
          form={subForm}
          setForm={setSubForm}
          editingId={editingSubId}
          categories={categories}
          onSubmit={handleSubSubmit}
          onClose={() => setShowSubModal(false)}
        />
      )}
      {showProjModal && (
        <ProjectModal
          form={projForm}
          setForm={setProjForm}
          editingId={editingProjId}
          categories={categories}
          subcategories={projSubsForModal}
          onSubmit={handleProjSubmit}
          onClose={() => setShowProjModal(false)}
        />
      )}
    </>
  );
}