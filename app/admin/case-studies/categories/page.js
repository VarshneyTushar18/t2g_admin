"use client";

import { useEffect, useState } from "react";

export default function CaseStudyCategoriesPage() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  // 🔹 Fetch categories
  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/case-studies/categories", {
        credentials: "include",
      });

      const data = await res.json();
      setItems(data.data || []);
    } catch (err) {
      console.error("Fetch categories error:", err);
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  // 🔴 Delete category
  const handleDelete = async (id) => {
    if (!confirm("Delete this category? This will remove all related case studies.")) return;

    try {
      await fetch(`/api/case-studies/categories/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      fetchCategories(); // refresh
    } catch (err) {
      console.error("Delete error:", err);
      alert("Delete failed");
    }
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1 style={{ marginBottom: "20px" }}>Case Study Categories</h1>

      {loading && <p>Loading...</p>}

      {!loading && items.length === 0 && (
        <p>No categories found</p>
      )}

      {!loading && items.length > 0 && (
        <table
          className="display"
          style={{
            width: "100%",
            borderCollapse: "collapse",
          }}
        >
          <thead>
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th style={{ width: "150px" }}>Actions</th>
            </tr>
          </thead>

          <tbody>
            {items.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>

                <td style={{ fontWeight: "600" }}>
                  {item.name}
                </td>

                <td>
                  <button
                    className="btn btn-delete"
                    onClick={() => handleDelete(item.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
