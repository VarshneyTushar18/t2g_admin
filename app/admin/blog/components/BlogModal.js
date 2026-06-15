"use client";
import BlogForm from "./BlogForm";

export default function BlogModal({
  form,
  setForm,
  editingId,
  onSubmit,
  onClose,
  submitting,
  categories,
}) {
  return (
    <>
      <style>{`
        .bm-overlay {
          position: fixed; inset: 0; background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 20px;
        }
        .bm-modal {
          background: #fff; border-radius: 14px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.18);
          width: 100%; max-width: 920px; max-height: 92vh;
          display: flex; flex-direction: column; overflow: hidden;
        }
        .bm-header {
          padding: 20px 24px; border-bottom: 1px solid #eee;
          display: flex; justify-content: space-between; align-items: center;
        }
        .bm-header h2 { margin: 0; font-size: 18px; font-weight: 800; color: #1a1a2e; }
        .bm-close {
          background: #f0f2f5; border: none; border-radius: 8px;
          width: 32px; height: 32px; cursor: pointer; font-size: 16px; color: #666;
        }
        .bm-body { padding: 24px; overflow-y: auto; flex: 1; }
      `}</style>

      <div className="bm-overlay">
        <div className="bm-modal">
          <div className="bm-header">
            <h2>{editingId ? "Edit Blog Post" : "Add Blog Post"}</h2>
            <button className="bm-close" onClick={onClose}>
              ✕
            </button>
          </div>
          <div className="bm-body">
            <BlogForm
              form={form}
              setForm={setForm}
              categories={categories}
              onSubmit={onSubmit}
              submitting={submitting}
              editingId={editingId}
              onClose={onClose}
            />
          </div>
        </div>
      </div>
    </>
  );
}
