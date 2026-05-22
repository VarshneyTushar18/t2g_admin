"use client";
import { useEffect, useRef } from "react";

export default function LifeTable({ items, onEdit, onDelete }) {
  const wrapRef = useRef(null);
  const itemsRef = useRef(items);
  const onEditRef = useRef(onEdit);
  const onDeleteRef = useRef(onDelete);

  itemsRef.current = items;
  onEditRef.current = onEdit;
  onDeleteRef.current = onDelete;

  useEffect(() => {
    const wrap = wrapRef.current;
    if (!wrap) return;

    const handleClick = (e) => {
      const editBtn = e.target.closest("[data-life-edit]");
      const deleteBtn = e.target.closest("[data-life-delete]");
      const btn = editBtn || deleteBtn;
      if (!btn) return;

      const id = Number(btn.dataset.lifeId);
      const item = itemsRef.current.find((i) => i.id === id);
      if (!item) return;

      if (editBtn) onEditRef.current(item);
      if (deleteBtn) onDeleteRef.current(id);
    };

    wrap.addEventListener("click", handleClick);
    return () => wrap.removeEventListener("click", handleClick);
  }, []);

  return (
    <div className="life-table-wrap" ref={wrapRef}>
      <table id="lifeTable" className="display nowrap" style={{ width: "100%" }}>
        <thead>
          <tr>
            <th>ID</th>
            <th>Category</th>
            <th>Section title</th>
            <th>Year</th>
            <th>Banner</th>
            <th>Gallery</th>
            <th>Category Img</th>
            <th>Card title</th>
            <th>Order</th>
            <th>Active</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>{item.category}</td>
              <td>{item.category_title}</td>
              <td>{item.year}</td>
              <td>
                {item.banner && (
                  <img
                    src={item.banner}
                    width="80"
                    height="55"
                    style={{ objectFit: "cover", borderRadius: "6px" }}
                    alt=""
                  />
                )}
              </td>
              <td>
                {item.galleryCount ?? (Array.isArray(item.gallery) ? item.gallery.length : 0)}{" "}
                photos
              </td>
              <td>
                {item.category_img && (
                  <img
                    src={item.category_img}
                    width="50"
                    height="40"
                    style={{ objectFit: "cover", borderRadius: "4px" }}
                    alt=""
                  />
                )}
              </td>
              <td>{item.description || "—"}</td>
              <td>{item.sort_order}</td>
              <td>{item.is_active ? "✅" : "❌"}</td>
              <td>
                <button
                  type="button"
                  className="btn btn-edit"
                  data-life-edit
                  data-life-id={item.id}
                >
                  Edit
                </button>
                <button
                  type="button"
                  className="btn btn-delete"
                  data-life-delete
                  data-life-id={item.id}
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
