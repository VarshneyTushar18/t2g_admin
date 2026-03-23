"use client";
import CaseStudyForm from "./CaseStudyForm";

export default function CaseStudyModal({
  form, setForm, editingId, onSubmit, onClose, submitting, categories,
}) {
  return (
    <>
      <style>{`
        .cs-overlay {
          position: fixed; inset: 0;
          background: rgba(0,0,0,0.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 1000; padding: 20px;
        }
        .cs-modal {
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 8px 40px rgba(0,0,0,0.18);
          width: 100%; max-width: 720px;
          max-height: 90vh;
          display: flex; flex-direction: column;
          overflow: hidden;
        }
        .cs-modal-header {
          padding: 20px 24px;
          border-bottom: 1px solid #eee;
          display: flex; justify-content: space-between; align-items: center;
          flex-shrink: 0;
        }
        .cs-modal-header h2 {
          margin: 0; font-size: 18px; font-weight: 800; color: #1a1a2e;
        }
        .cs-modal-close {
          background: #f0f2f5; border: none; border-radius: 8px;
          width: 32px; height: 32px; cursor: pointer;
          font-size: 16px; color: #666;
          display: flex; align-items: center; justify-content: center;
        }
        .cs-modal-close:hover { background: #e0e3e8; }
        .cs-modal-body {
          padding: 24px; overflow-y: auto; flex: 1;
        }
      `}</style>

      <div className="cs-overlay">
        <div className="cs-modal">
          <div className="cs-modal-header">
            <h2>{editingId ? "✏️ Edit Case Study" : "➕ Add Case Study"}</h2>
            <button className="cs-modal-close" onClick={onClose}>✕</button>
          </div>
          <div className="cs-modal-body">
            <CaseStudyForm
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