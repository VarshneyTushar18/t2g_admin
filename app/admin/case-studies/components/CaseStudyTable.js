export default function CaseStudyTable({ items = [], onEdit, onDelete }) {
  return (
    <div style={{ overflowX: "auto" }}>
      <table className="cs-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Category</th>
            <th>Featured</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td>{item.id}</td>

              <td>
                <div style={{ fontWeight: 600 }}>{item.title}</div>
                <div className="cs-slug">{item.slug}</div>
              </td>

              <td>{item.category_name || "-"}</td>

              <td>
                {item.is_featured ? "⭐ Yes" : "No"}
              </td>

              <td>
                <div className="cs-actions">
                  <button
                    className="btn btn-edit"
                    onClick={() => onEdit(item)}
                  >
                    Edit
                  </button>

                  <button
                    className="btn btn-delete"
                    onClick={() => onDelete(item.id)}
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* styles */}
      <style>{`
        .cs-table {
          width: 100%;
          border-collapse: collapse;
        }

        .cs-table th {
          text-align: left;
          padding: 10px;
          background: #f5f7fa;
          font-size: 13px;
        }

        .cs-table td {
          padding: 10px;
          border-bottom: 1px solid #eee;
          vertical-align: top;
        }

        .cs-slug {
          font-size: 11px;
          color: #888;
          word-break: break-all;
        }

        .cs-actions {
          display: flex;
          gap: 6px;
          flex-wrap: wrap;
        }

        .btn {
          padding: 6px 10px;
          font-size: 12px;
          border-radius: 6px;
          border: none;
          cursor: pointer;
        }

        .btn-edit {
          background: #4f8ef7;
          color: #fff;
        }

        .btn-delete {
          background: #e74c3c;
          color: #fff;
        }

        /* MOBILE FIX */
        @media (max-width: 768px) {
          .cs-table thead {
            display: none;
          }

          .cs-table tr {
            display: block;
            margin-bottom: 12px;
            border: 1px solid #eee;
            border-radius: 8px;
            padding: 10px;
          }

          .cs-table td {
            display: block;
            border: none;
            padding: 6px 0;
          }

          .cs-actions {
            justify-content: flex-start;
          }
        }
      `}</style>
    </div>
  );
}