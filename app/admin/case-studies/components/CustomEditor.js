"use client";

import { useEffect, useRef, useState } from "react";

/**
 * CKEditor Classic with link + formatting toolbar.
 * Optional uploadUrl enables imageUpload in the content body.
 */
export default function CustomEditor({ value, onChange, editorApiRef, uploadUrl }) {
  const editorRef = useRef(null);
  const instanceRef = useRef(null);
  const [ready, setReady] = useState(false);
  const uploadUrlRef = useRef(uploadUrl);
  uploadUrlRef.current = uploadUrl;

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

        if (instanceRef.current) {
          await instanceRef.current.destroy().catch(() => {});
          instanceRef.current = null;
        }

        const editor = await ClassicEditor.create(editorRef.current, {
          toolbar: {
            items: [
              "heading",
              "|",
              "bold",
              "italic",
              "|",
              "link",
              "|",
              "bulletedList",
              "numberedList",
              "outdent",
              "indent",
              "|",
              "blockQuote",
              "insertTable",
              "imageUpload",
              "mediaEmbed",
              "|",
              "undo",
              "redo",
            ],
            shouldNotGroupWhenFull: true,
          },
          heading: {
            options: [
              { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
              { model: "heading2", view: "h2", title: "Heading 2", class: "ck-heading_heading2" },
              { model: "heading3", view: "h3", title: "Heading 3", class: "ck-heading_heading3" },
              { model: "heading4", view: "h4", title: "Heading 4", class: "ck-heading_heading4" },
            ],
          },
          link: {
            addTargetToExternalLinks: true,
            defaultProtocol: "https://",
            decorators: {
              openInNewTab: {
                mode: "manual",
                label: "Open in a new tab",
                attributes: {
                  target: "_blank",
                  rel: "noopener noreferrer",
                },
              },
            },
          },
          table: {
            contentToolbar: [
              "tableColumn",
              "tableRow",
              "mergeTableCells",
            ],
          },
          image: {
            toolbar: [
              "imageTextAlternative",
              "imageStyle:inline",
              "imageStyle:block",
              "imageStyle:side",
              "linkImage",
            ],
          },
        });

        // Upload adapter for inline images (reuses featured upload endpoint when provided)
        if (uploadUrlRef.current) {
          const endpoint = uploadUrlRef.current;
          editor.plugins.get("FileRepository").createUploadAdapter = (loader) => ({
            upload: () =>
              loader.file.then(
                (file) =>
                  new Promise(async (resolve, reject) => {
                    try {
                      const data = new FormData();
                      data.append("featured_image", file);
                      const res = await fetch(endpoint, {
                        method: "POST",
                        body: data,
                        credentials: "include",
                      });
                      const json = await res.json().catch(() => ({}));
                      if (!res.ok || !json?.url) {
                        reject(json?.error || "Image upload failed");
                        return;
                      }
                      resolve({ default: json.url });
                    } catch (err) {
                      reject(err?.message || "Image upload failed");
                    }
                  }),
              ),
            abort: () => {},
          });
        }

        editor.setData(value || "");

        editor.model.document.on("change:data", () => {
          onChange(editor.getData());
        });

        editor.editing.view.document.on("blur", () => {
          onChange(editor.getData());
        });

        instanceRef.current = editor;

        if (editorApiRef) {
          editorApiRef.current = {
            getData: () => instanceRef.current?.getData() || "",
          };
        }
      } catch (err) {
        console.error("CKEditor init error:", err);
      }
    };

    init();

    return () => {
      if (editorApiRef) editorApiRef.current = null;
      if (instanceRef.current) {
        instanceRef.current.destroy().catch(() => {});
        instanceRef.current = null;
      }
    };
  }, [ready, editorApiRef]);

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
        .ck-editor__editable a { color: #1a56db; text-decoration: underline; }
        .ck-editor__editable img { max-width: 100%; height: auto; }
        .ck.ck-balloon-panel { z-index: 9999 !important; }
      `}</style>
      <div ref={editorRef} />
    </>
  );
}
