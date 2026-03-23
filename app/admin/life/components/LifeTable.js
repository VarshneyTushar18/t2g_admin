export default function LifeTable({ items, onEdit, onDelete }) {
  return (
    <table id="lifeTable" className="display nowrap" style={{ width: "100%" }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Category</th>
          <th>Title</th>
          <th>Year</th>
          <th>Banner</th>
          <th>Category Img</th>
          <th>Description</th>
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
                <img src={item.banner} width="80" height="55"
                  style={{ objectFit: "cover", borderRadius: "6px" }} />
              )}
            </td>
            <td>
              {item.category_img && (
                <img src={item.category_img} width="50" height="40"
                  style={{ objectFit: "cover", borderRadius: "4px" }} />
              )}
            </td>
            <td>{item.description || "—"}</td>
            <td>{item.sort_order}</td>
            <td>{item.is_active ? "✅" : "❌"}</td>
            <td>
              <button className="btn btn-edit" onClick={() => onEdit(item)}>Edit</button>
              <button className="btn btn-delete" onClick={() => onDelete(item.id)}>Delete</button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}