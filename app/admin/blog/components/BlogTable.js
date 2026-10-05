"use client";

import Link from "next/link";

function formatStatus(status) {
  if (status === "publish") return "Published";
  if (status === "draft") return "Draft";
  if (status === "pending") return "Pending";
  return status || "—";
}

export default function BlogTable({
  items = [],
  categories = [],
  onDelete,
  canEdit = true,
  canDelete = true,
}) {
  const categoryNames = (ids = []) => {
    if (!Array.isArray(ids) || !ids.length) return [];
    return ids
      .map((id) => categories.find((c) => c.id === id)?.name)
      .filter(Boolean);
  };

  if (!items.length) {
    return (
      <div className="blog-empty">
        <div className="blog-empty-icon">📝</div>
        <h3>No posts found</h3>
        <p>Create a new post or try a different search.</p>
      </div>
    );
  }

  return (
    <div className="blog-table-wrap">
      <table className="blog-table">
        <thead>
          <tr>
            <th>Post</th>
            <th>Author</th>
            <th>Views</th>
            <th>Status</th>
            <th>Categories</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => {
            const cats = categoryNames(item.categories);
            const siteLink = item.link
              ? item.link.startsWith("http")
                ? item.link
                : `https://www.tech2globe.com${item.link}`
              : null;

            return (
              <tr key={item.id}>
                <td data-label="Post">
                  <div className="blog-post-cell">
                    {item.featured_image ? (
                      <img
                        src={item.featured_image}
                        alt=""
                        className="blog-thumb"
                      />
                    ) : (
                      <div className="blog-thumb blog-thumb-empty">📄</div>
                    )}
                    <div>
                      <div className="blog-post-title">{item.title || "Untitled"}</div>
                      <div className="blog-slug">/blogs/{item.slug || "—"}</div>
                      {siteLink && (
                        <a
                          href={siteLink}
                          className="blog-view-link"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          View live →
                        </a>
                      )}
                    </div>
                  </div>
                </td>
                <td data-label="Author">{item.author || item.author_name || "—"}</td>
                <td data-label="Views">{Number(item.view_count || 0).toLocaleString()}</td>
                <td data-label="Status">
                  <span className={`blog-status blog-status-${item.status}`}>
                    {formatStatus(item.status)}
                  </span>
                </td>
                <td data-label="Categories">
                  {cats.length ? (
                    <div className="blog-cat-pills">
                      {cats.map((name) => (
                        <span key={name} className="blog-cat-pill">{name}</span>
                      ))}
                    </div>
                  ) : (
                    <span style={{ color: "#94a3b8" }}>—</span>
                  )}
                </td>
                <td data-label="Date">
                  {item.date ? new Date(item.date).toLocaleDateString(undefined, {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  }) : "—"}
                </td>
                <td data-label="Actions">
                  <div className="blog-row-actions">
                    {canEdit && (
                      <Link
                        href={`/admin/blog/edit/${item.id}`}
                        className="blog-row-btn blog-row-btn-edit"
                      >
                        Edit
                      </Link>
                    )}
                    {canDelete && (
                      <button
                        type="button"
                        className="blog-row-btn blog-row-btn-delete"
                        onClick={() => onDelete(item)}
                      >
                        Delete
                      </button>
                    )}
                    {!canEdit && !canDelete && (
                      <span style={{ fontSize: 12, color: "#94a3b8" }}>View only</span>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
