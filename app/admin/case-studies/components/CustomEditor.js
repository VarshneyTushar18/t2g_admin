"use client";

import { useEffect, useRef, useState } from "react";

export default function CustomEditor({ value, onChange }) {
  const editorRef = useRef(null);
  const instanceRef = useRef(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready || !editorRef.current) return;

    const init = async () => {
      try {
        const ClassicEditor = (
          await import("@ckeditor/ckeditor5-build-classic")
        ).default;

        // Destroy previous instance if exists
        if (instanceRef.current) {
          await instanceRef.current.destroy().catch(() => {});
          instanceRef.current = null;
        }

        const editor = await ClassicEditor.create(editorRef.current, {
          toolbar: [
            "heading", "|",
            "bold", "italic", "underline", "|",
            "bulletedList", "numberedList", "|",
            "blockQuote", "|",
            "insertTable", "tableColumn", "tableRow", "|",
            "undo", "redo",
          ],
          table: {
            contentToolbar: ["tableColumn", "tableRow", "mergeTableCells"],
          },
        });

        
        editor.setData(value || "");

   
        editor.model.document.on("change:data", () => {
          onChange(editor.getData());
        });

        instanceRef.current = editor;
      } catch (err) {
        console.error("CKEditor init error:", err);
      }
    };

    init();

    return () => {
      if (instanceRef.current) {
        instanceRef.current.destroy().catch(() => {});
        instanceRef.current = null;
      }
    };
  }, [ready]); // ← only runs once when ready

  // ✅ Sync value when editing existing item
  useEffect(() => {
    if (!instanceRef.current) return;
    const current = instanceRef.current.getData();
    if (value !== current) {
      instanceRef.current.setData(value || "");
    }
  }, [value]);

  return (
    <>
      <style>{`
        .ck-editor__editable { min-height: 300px !important; font-size: 14px; line-height: 1.6; }
        .ck.ck-toolbar { border-radius: 8px 8px 0 0 !important; background: #f8f9fb !important; border-color: #e0e3e8 !important; flex-wrap: wrap !important; }
        .ck.ck-editor__editable { border-radius: 0 0 8px 8px !important; border-color: #e0e3e8 !important; }
        .ck.ck-editor__editable:focus { box-shadow: none !important; border-color: #4f8ef7 !important; }
        .ck-editor__editable table { border-collapse: collapse; width: 100%; margin: 12px 0; }
        .ck-editor__editable table td, .ck-editor__editable table th { border: 1px solid #ccc; padding: 8px 12px; min-width: 80px; }
        .ck-editor__editable table th { background: #f0f2f5; font-weight: 700; }
        .ck.ck-balloon-panel { z-index: 9999 !important; }
      `}</style>
      <div ref={editorRef} />
    </>
  );
}