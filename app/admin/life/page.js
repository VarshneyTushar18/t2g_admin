"use client";
import { useEffect, useState } from "react";
import useLifeItems from "./hooks/useLifeItems";
import LifeTable from "./components/LifeTable";
import LifeModal from "./components/LifeModal";
import {
  createLifeItem,
  updateLifeItem,
  appendGalleryImages,
  removeGalleryImages,
  deleteLifeItem,
  getLifeItem,
  parseGallery,
  getAllLifeUploadedImages,
} from "./services/lifeService";
import AllUploadedImagesModal from "./components/AllUploadedImagesModal";

const emptyForm = {
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
};

export default function LifePage() {
  const { items, loading, error, reload } = useLifeItems();
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadLabel, setUploadLabel] = useState("");
  const [showAllImages, setShowAllImages] = useState(false);
  const [allImageUrls, setAllImageUrls] = useState([]);
  const [allImagesLoading, setAllImagesLoading] = useState(false);
  const [allImagesError, setAllImagesError] = useState(null);

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

  const openEdit = async (item) => {
    try {
      const res = await getLifeItem(item.id);
      const data = res.data || item;
      setForm({
        category: data.category,
        category_title: data.category_title,
        year: data.year,
        description: data.description || "",
        sort_order: data.sort_order || 0,
        is_active: !!data.is_active,
        banner: null,
        galleryFiles: [],
        existingBanner: data.banner,
        existingGallery: parseGallery(data.gallery),
      });
      setEditingId(data.id);
      setShowModal(true);
    } catch (err) {
      alert(err.message || "Failed to load item");
    }
  };

  const openCreate = () => {
    setForm({ ...emptyForm });
    setEditingId(null);
    setShowModal(true);
  };

  const handleRemoveGalleryImage = async (url) => {
    if (!editingId) return;
    if (!confirm("Remove this image from the gallery?")) return;

    try {
      await removeGalleryImages(editingId, [url]);
      setForm((prev) => ({
        ...prev,
        existingGallery: prev.existingGallery.filter((u) => u !== url),
      }));
    } catch (err) {
      alert(err.message || "Failed to remove image");
    }
  };

  const handleSubmit = async () => {
    if (!form.category?.trim() || !form.category_title?.trim() || !form.year?.trim()) {
      alert("Category, title, and year are required.");
      return;
    }

    setSaving(true);
    setUploadProgress(0);
    setUploadLabel("Starting…");

    const hasNewGallery = form.galleryFiles?.length > 0;

    try {
      if (editingId) {
        setUploadLabel("Saving item details…");
        await updateLifeItem(editingId, form, {
          onProgress: (p) => {
            const weight = hasNewGallery ? 0.25 : 1;
            setUploadProgress(Math.round(p * weight * 100));
          },
        });

        if (hasNewGallery) {
          const n = form.galleryFiles.length;
          setUploadLabel(`Uploading ${n} new image${n !== 1 ? "s" : ""}…`);
          setUploadProgress(25);
          await appendGalleryImages(editingId, form.galleryFiles, {
            onProgress: (p) => setUploadProgress(25 + Math.round(p * 0.75)),
          });
        }
      } else {
        if (!form.banner) {
          alert("Banner image is required.");
          setSaving(false);
          setUploadProgress(0);
          setUploadLabel("");
          return;
        }
        const n = form.galleryFiles?.length || 0;
        setUploadLabel(
          n > 0
            ? `Uploading banner + ${n} gallery image${n !== 1 ? "s" : ""}…`
            : "Uploading banner…",
        );
        await createLifeItem(form, {
          onProgress: (p) => setUploadProgress(p),
        });
      }

      setUploadLabel("Done!");
      setUploadProgress(100);
      await reload();
      setShowModal(false);
    } catch (err) {
      alert(err.message || "Save failed");
    } finally {
      setSaving(false);
      setUploadProgress(0);
      setUploadLabel("");
    }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return;
    await deleteLifeItem(id);
    reload();
  };

  const openAllUploadedImages = async () => {
    setShowAllImages(true);
    setAllImagesLoading(true);
    setAllImagesError(null);
    setAllImageUrls([]);
    try {
      const res = await getAllLifeUploadedImages();
      setAllImageUrls(Array.isArray(res.data) ? res.data : []);
    } catch (err) {
      setAllImagesError(err.message || "Failed to load images");
    } finally {
      setAllImagesLoading(false);
    }
  };

  return (
    <>
      <style>{`
        .lp { min-height:100vh; background:#f0f2f5; padding:20px; }
        .lp-header { display:flex; justify-content:space-between; align-items:center; flex-wrap:wrap; gap:12px; margin-bottom:20px; }
        .lp-header-actions { display:flex; gap:10px; flex-wrap:wrap; }
        .btn-outline { background:white; color:#333; border:1px solid #ccc; padding:8px 16px; border-radius:6px; cursor:pointer; font-size:13px; }
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
        .btn:disabled { opacity:0.6; cursor:not-allowed; }
      `}</style>

      <div className="lp">
        <div className="lp-header">
          <h1 className="lp-title">Life @ Tech2Globe</h1>
          <div className="lp-header-actions">
            <button type="button" className="btn-outline" onClick={openAllUploadedImages}>
              All uploaded images
            </button>
            <button className="btn-add" onClick={openCreate}>
              + Add Item
            </button>
          </div>
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

      {showAllImages && (
        <AllUploadedImagesModal
          urls={allImageUrls}
          loading={allImagesLoading}
          error={allImagesError}
          onClose={() => {
            setShowAllImages(false);
            setAllImageUrls([]);
            setAllImagesError(null);
          }}
        />
      )}

      {showModal && (
        <LifeModal
          form={form}
          setForm={setForm}
          editingId={editingId}
          onSubmit={handleSubmit}
          onClose={() => setShowModal(false)}
          onRemoveGalleryImage={handleRemoveGalleryImage}
          saving={saving}
          uploadProgress={uploadProgress}
          uploadLabel={uploadLabel}
        />
      )}
    </>
  );
}
