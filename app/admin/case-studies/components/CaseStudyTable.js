export default function CaseStudyTable({ items = [], onEdit, onDelete }) {
  return (
    <table
      id="caseStudyTable"
      className="display nowrap"
      style={{ width: "100%" }}
    >
      <thead>
        <tr>
          <th>ID</th>
          <th>Thumbnail</th>
          <th>Title</th>
          <th>Slug</th>
          <th>Category</th>
          <th>Featured</th>
          <th>Actions</th>
        </tr>
      </thead>
 
      <tbody>
        {items.map((item, index) => (
          <tr key={item.id ?? `row-${index}`}>
            <td>{item.id ?? index}</td>
 
            <td>
              {item.featured_image ? (
                <img
                  src={item.featured_image}
                  width="80"
                  height="55"
                  style={{
                    objectFit: "cover",
                    borderRadius: "6px",
                  }}
                />
              ) : (
                "-"
              )}
            </td>
 
            <td>{item.title || "-"}</td>
 
            <td style={{ fontSize: "12px", color: "#888" }}>
              {item.slug || "-"}
            </td>
 
            <td>{item.category || "-"}</td>
 
            <td>{item.is_featured ? "⭐ Yes" : "No"}</td>
 
            <td>
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
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}