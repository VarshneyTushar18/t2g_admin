"use client";
import { useEffect } from "react";
import useLifeItems from "./hooks/useLifeItems";
import LifeTable from "./components/LifeTable";
import LifeModal from "./components/LifeModal";
import {
  createLifeItem,
  updateLifeItem,
  deleteLifeItem,
} from "./services/lifeService";
import { useState } from "react";

const emptyForm = {
  category: "",
  category_title: "",
  year: "",
  description: "",
  sort_order: 0,
  is_active: true,
  banner: null,
};

export default function LifePage() {
  const { items, loading, error, reload } = useLifeItems();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);

  // DataTable init
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
      if ($.fn.dataTable.isDataTable("#lifeTable")) {
        $("#lifeTable").DataTable().destroy();
      }
      table = $("#lifeTable").DataTable({ responsive: true, pageLength: 10 });
    }
    init();
    return () => {
      if (table) table.destroy();
    };
  }, [loading, items]);

  const openEdit = (item) => {
    setForm({
      category: item.category,
      category_title: item.category_title,
      year: item.year,
      description: item.description || "",
      sort_order: item.sort_order || 0,
      is_active: !!item.is_active,
      banner: null,
      galleryFiles: [],
      existingBanner: item.banner, // shown as preview
      existingGallery: item.gallery || [], // shown as preview
    });
    setEditingId(item.id);
    setShowModal(true);
  };

  const openCreate = () => {
    setForm({
      category: "",
      category_title: "",
      year: "",
      description: "",
      sort_order: 0,
      is_active: true,
      banner: null,
      galleryFiles: [],
      existingBanner: null,
      existingGallery: [],
    });
    setEditingId(null);
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (editingId) {
      await updateLifeItem(editingId, form);
    } else {
      await createLifeItem(form);
    }
    reload();
    setShowModal(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return;
    await deleteLifeItem(id);
    reload();
  };

  return (
    <>
      <style>{`
        .lp { min-height:100vh; background:#f0f2f5; padding:20px; }
        .lp-header { display:flex; justify-content:space-between; margin-bottom:20px; }
        .lp-title { font-size:26px; font-weight:800; }
        .lp-card { background:white; border-radius:12px; box-shadow:0 2px 16px rgba(0,0,0,.08); overflow:hidden; }
        .lp-card-head { padding:16px; border-bottom:1px solid #eee; font-weight:700; }
        .lp-body { padding:16px; }
        .btn { border:none; padding:6px 12px; border-radius:6px; cursor:pointer; font-size:12px; }
        .btn-edit { background:#4f8ef7; color:white; margin-right:6px; }
        .btn-delete { background:#e74c3c; color:white; }
        .btn-add { background:#16a37f; color:white; padding:8px 16px; border-radius:6px; cursor:pointer; border:none; }
        .modal { position:fixed; top:0; left:0; width:100%; height:100%; background:rgba(0,0,0,.4); display:flex; align-items:center; justify-content:center; z-index:1000; }
        .modal-box { background:white; padding:25px; border-radius:10px; width:480px; max-height:90vh; overflow-y:auto; }
        .modal-box input { width:100%; margin-bottom:10px; padding:8px; border:1px solid #ddd; border-radius:6px; box-sizing:border-box; }
        .modal-box label { font-size:13px; font-weight:600; display:block; margin-bottom:4px; }
      `}</style>

      <div className="lp">
        <div className="lp-header">
          <h1 className="lp-title">Life @ Tech2Globe</h1>
          <button className="btn-add" onClick={openCreate}>
            + Add Item
          </button>
        </div>

        <div className="lp-card">
          <div className="lp-card-head">Gallery Items</div>

          {loading && <div className="lp-body">Loading...</div>}
          {error && (
            <div className="lp-body" style={{ color: "red" }}>
              {error}
            </div>
          )}

          {!loading && !error && (
            <div className="lp-body">
              <LifeTable
                items={items}
                onEdit={openEdit}
                onDelete={handleDelete}
              />
            </div>
          )}
        </div>
      </div>

      {showModal && (
        <LifeModal
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
