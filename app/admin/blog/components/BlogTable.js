export default function BlogTable({
  items = [],
  categories = [],
  onEdit,
  onDelete,
  canEdit = true,
  canDelete = true,
}) {
  const categoryName = (ids = []) => {
    if (!Array.isArray(ids) || !ids.length) return "—";
    const names = ids
      .map((id) => categories.find((c) => c.id === id)?.name)
      .filter(Boolean);
    return names.length ? names.join(", ") : "—";
  };

  if (!items.length) {
    return (
      <div className="blog-empty">
        <p>No blog posts found.</p>
        <p className="blog-empty-hint">Create a post or adjust your search.</p>
        <style>{`
          .blog-empty {
            text-align: center;
            padding: 48px 16px;
            color: #64748b;
          }
          .blog-empty-hint { font-size: 13px; margin-top: 8px; }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{ overflowX: "auto" }}>
      <table className="blog-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Posted by</th>
            <th>Views</th>
            <th>Status</th>
            <th>Categories</th>
            <th>Date</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>
              <td>
                <div style={{ fontWeight: 600 }}>{item.title}</div>
                <div className="blog-slug">{item.slug}</div>
                {item.link && (
                  <a
                    href={item.link}
                    className="blog-link"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    View on site
                  </a>
                )}
              </td>
              <td>{item.author || item.author_name || "—"}</td>
              <td>{Number(item.view_count || 0).toLocaleString()}</td>
              <td>
                <span className={`blog-status blog-status-${item.status}`}>
                  {item.status}
                </span>
              </td>
              <td>{categoryName(item.categories)}</td>
              <td>{item.date ? new Date(item.date).toLocaleDateString() : "—"}</td>
              <td>
                <div className="blog-actions">
                  {canEdit && (
                    <button
                      type="button"
                      className="btn btn-edit"
                      onClick={() => onEdit(item)}
                    >
                      Edit
                    </button>
                  )}
                  {canDelete && (
                    <button
                      type="button"
                      className="btn btn-delete"
                      onClick={() => onDelete(item)}
                    >
                      Delete
                    </button>
                  )}
                  {!canEdit && !canDelete && (
                    <span className="blog-view-only">View only</span>
                  )}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <style>{`
        .blog-table { width: 100%; border-collapse: collapse; }
        .blog-table th {
          text-align: left; padding: 10px; background: #f5f7fa; font-size: 13px;
        }
        .blog-table td {
          padding: 10px; border-bottom: 1px solid #eee; vertical-align: top;
        }
        .blog-slug { font-size: 11px; color: #888; word-break: break-all; }
        .blog-link { font-size: 11px; color: #4f8ef7; text-decoration: none; display: inline-block; margin-top: 4px; }
        .blog-link:hover { text-decoration: underline; }
        .blog-status {
          display: inline-block; padding: 3px 8px; border-radius: 999px;
          font-size: 11px; font-weight: 700; text-transform: uppercase;
        }
        .blog-status-publish { background: #d1fae5; color: #065f46; }
        .blog-status-draft { background: #fef3c7; color: #92400e; }
        .blog-status-pending { background: #e0e7ff; color: #3730a3; }
        .blog-actions { display: flex; gap: 6px; flex-wrap: wrap; }
        .blog-view-only { font-size: 12px; color: #94a3b8; }
        .btn {
          padding: 6px 10px; font-size: 12px; border-radius: 6px;
          border: none; cursor: pointer;
        }
        .btn-edit { background: #4f8ef7; color: #fff; }
        .btn-delete { background: #e74c3c; color: #fff; }
        .btn-delete:hover { background: #c0392b; }
        @media (max-width: 768px) {
          .blog-table thead { display: none; }
          .blog-table tr {
            display: block; margin-bottom: 12px; border: 1px solid #eee;
            border-radius: 8px; padding: 10px;
          }
          .blog-table td { display: block; border: none; padding: 6px 0; }
        }
      `}</style>
    </div>
  );
}
