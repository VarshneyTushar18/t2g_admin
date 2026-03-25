"use client";
import { useEffect, useState } from "react";
import useCaseStudies from "./hooks/useCaseStudies";
import CaseStudyTable from "./components/CaseStudyTable";
import CaseStudyModal from "./components/CaseStudyModal";
import {
  createCaseStudy,
  updateCaseStudy,
  deleteCaseStudy,
} from "./services/caseStudyService";

const emptyForm = {
  title: "",
  slug: "",
  category: "",
  short_description: "",
  content: "",
  is_featured: false,
  featured_image: null,
  existingFeaturedImage: null,
};

export default function CaseStudiesPage() {
  const [submitting, setSubmitting] = useState(false);
  const { items, loading, error, reload } = useCaseStudies();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [categories, setCategories] = useState([]);
  const [form, setForm] = useState(emptyForm);

  useEffect(() => {
    const url = `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000"}/api/case-studies/categories`;
   

    fetch(url)
      .then((r) => {
        console.log("Response status:", r.status);
        return r.json();
      })
      .then((json) => {
        console.log("Categories data:", json); 
        setCategories(json.data || []);
      })
      .catch((err) => console.error("Categories fetch error:", err));
  }, []);

  // DataTable
  useEffect(() => {
    if (loading) return;
    let table;
    async function init() {
      const $ = (await import("jquery")).default;
      window.jQuery = $;
      await import("datatables.net-dt");
      await import("datatables.net-responsive");
      await import("datatables.net-dt/css/dataTables.dataTables.css");
      await import("datatables.net-responsive-dt/css/responsive.dataTables.css");
      if ($.fn.dataTable.isDataTable("#caseStudyTable")) {
        $("#caseStudyTable").DataTable().destroy();
      }
      table = $("#caseStudyTable").DataTable({
        responsive: true,
        pageLength: 10,
      });
    }
    init();
    return () => {
      if (table) table.destroy();
    };
  }, [loading, items]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

const openEdit = (item) => {
  setForm({
    title: item.title,
    slug: item.slug,
    category_id: item.category_id, // ✅ FIXED KEY
    short_description: item.short_description || "",
    content: item.content || "",
    is_featured: !!item.is_featured,
    featured_image: item.featured_image || "", // optional improvement
    existingFeaturedImage: item.featured_image || null,
  });

  setEditingId(item.id);
  setShowModal(true);
};

  const handleSubmit = async () => {
    if (submitting) return;

    try {
      setSubmitting(true);

      if (editingId) {
        await updateCaseStudy(editingId, form);
      } else {
        await createCaseStudy(form);
      }

      reload();
      setShowModal(false);
    } catch (err) {
      console.error("Submit error:", err);
    } finally {
      setSubmitting(false);
    }
  };
  const handleDelete = async (id) => {
    if (!confirm("Delete this case study?")) return;
    await deleteCaseStudy(id);
    reload();
  };

  return (
    <>
      <style>{`
        .cp { min-height:100vh; background:#f0f2f5; padding:20px; }
        .cp-header { display:flex; justify-content:space-between; margin-bottom:20px; }
        .cp-title { font-size:26px; font-weight:800; }
        .cp-card { background:white; border-radius:12px; box-shadow:0 2px 16px rgba(0,0,0,.08); overflow:hidden; }
        .cp-card-head { padding:16px; border-bottom:1px solid #eee; font-weight:700; }
        .cp-body { padding:16px; }
        .btn { border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; }
        .btn-edit { background:#4f8ef7; color:white; margin-right:6px; }
        .btn-delete { background:#e74c3c; color:white; }
        .btn-add { background:#16a37f; color:white; padding:8px 16px; border-radius:6px; cursor:pointer; border:none; font-size:14px; }
        .modal { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; z-index:1000; }
        .modal-box { background:white; padding:25px; border-radius:10px; }
        .modal-box input { width:100%; margin-bottom:10px; padding:8px; border:1px solid #ddd; border-radius:6px; box-sizing:border-box; }
        .modal-box label { font-size:13px; font-weight:600; display:block; margin-bottom:4px; }
      `}</style>

      <div className="cp">
        <div className="cp-header">
          <h1 className="cp-title">Case Studies</h1>
          <button className="btn-add" onClick={openCreate}>
            + Add Case Study
          </button>
        </div>

        <div className="cp-card">
          <div className="cp-card-head">All Case Studies</div>

          {loading && <div className="cp-body">Loading...</div>}
          {error && (
            <div className="cp-body" style={{ color: "red" }}>
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="cp-body">
              <CaseStudyTable
                items={items}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <CaseStudyModal
          form={form}
          setForm={setForm}
          editingId={editingId}
          categories={categories}
          onSubmit={handleSubmit}
          submitting={submitting} // ✅ ADD THIS
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
