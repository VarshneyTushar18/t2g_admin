"use client";
import { useEffect, useState } from "react";
import useTestimonials from "./hooks/useTestimonials";
import TestimonialTable from "./components/TestimonialTable";
import TestimonialModal from "./components/TestimonialModal";
import { createTestimonial, updateTestimonial, deleteTestimonial } from "./services/testimonialService";

const emptyForm = {
  name:              "",
  stars:             5,
  text:              "",
  companyName:       "",
  link:              "",
  status:            true,
  avatar:            null,
  companyLogo:       null,
  existingAvatar:    null,
  existingCompanyLogo: null,
};

export default function TestimonialsPage() {
  const { items, loading, error, reload } = useTestimonials();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form,      setForm]      = useState(emptyForm);

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
      if ($.fn.dataTable.isDataTable("#testimonialTable")) {
        $("#testimonialTable").DataTable().destroy();
      }
      table = $("#testimonialTable").DataTable({ responsive: true, pageLength: 10 });
    }
    init();
    return () => { if (table) table.destroy(); };
  }, [loading, items]);

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowModal(true);
  };

  const openEdit = (item) => {
    setForm({
      name:                item.name,
      stars:               item.stars,
      text:                item.text,
      companyName:         item.companyName  || "",
      link:                item.link         || "",
      status:              item.status === "active",
      avatar:              null,
      companyLogo:         null,
      existingAvatar:      item.avatar       || null,
      existingCompanyLogo: item.companyLogo  || null,
    });
    setEditingId(item.id);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (editingId) {
      await updateTestimonial(editingId, form);
    } else {
      await createTestimonial(form);
    }
    reload();
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this testimonial?")) return;
    await deleteTestimonial(id);
    reload();
  };

  return (
    <>
      <style>{`
        .tp { min-height:100vh; background:#f0f2f5; padding:20px; }
        .tp-header { display:flex; justify-content:space-between; margin-bottom:20px; }
        .tp-title { font-size:26px; font-weight:800; }
        .tp-card { background:white; border-radius:12px; box-shadow:0 2px 16px rgba(0,0,0,.08); overflow:hidden; }
        .tp-card-head { padding:16px; border-bottom:1px solid #eee; font-weight:700; }
        .tp-body { padding:16px; }
        .btn { border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; }
        .btn-edit { background:#4f8ef7; color:white; margin-right:6px; }
        .btn-delete { background:#e74c3c; color:white; }
        .btn-add { background:#16a37f; color:white; padding:8px 16px; border-radius:6px; cursor:pointer; border:none; font-size:14px; }
        .modal { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; z-index:1000; }
        .modal-box { background:white; padding:25px; border-radius:10px; }
        .modal-box input { width:100%; margin-bottom:10px; padding:8px; border:1px solid #ddd; border-radius:6px; box-sizing:border-box; }
        .modal-box label { font-size:13px; font-weight:600; display:block; margin-bottom:4px; }
      `}</style>

      <div className="tp">
        <div className="tp-header">
          <h1 className="tp-title">Testimonials</h1>
          <button className="btn-add" onClick={openCreate}>+ Add Testimonial</button>
        </div>

        <div className="tp-card">
          <div className="tp-card-head">All Testimonials</div>

          {loading && <div className="tp-body">Loading...</div>}
          {error   && <div className="tp-body" style={{ color: "red" }}>{error}</div>}

          {!loading && !error && (
            <div className="tp-body">
              <TestimonialTable
                items={items}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <TestimonialModal
          form={form}
          setForm={setForm}
          editingId={editingId}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}