export default function TestimonialTable({ items, onEdit, onDelete }) {
  return (
    <table id="testimonialTable" className="display nowrap" style={{ width: "100%" }}>
      <thead>
        <tr>
          <th>ID</th>
          <th>Avatar</th>
          <th>Name</th>
          <th>Stars</th>
          <th>Text</th>
          <th>Company</th>
          <th>Logo</th>
          <th>Link</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {items.map((item) => (
          <tr key={item.id}>
            <td>{item.id}</td>
            <td>
              {item.avatar && (
                <img src={item.avatar} width="45" height="45"
                  style={{ borderRadius: "50%", objectFit: "cover" }} />
              )}
            </td>
            <td>{item.name}</td>
            <td>{"⭐".repeat(item.stars)}</td>
            <td style={{ maxWidth: "200px", whiteSpace: "normal", fontSize: "12px" }}>
              {item.text?.slice(0, 80)}...
            </td>
            <td>{item.companyName}</td>
            <td>
              {item.companyLogo && (
                <img src={item.companyLogo} width="60" height="35"
                  style={{ objectFit: "contain" }} />
              )}
            </td>
            <td>
              {item.link && (
                <a href={item.link} target="_blank" rel="noreferrer"
                  style={{ fontSize: "12px", color: "#4f8ef7" }}>
                  View
                </a>
              )}
            </td>
            <td>
              <span style={{
                padding: "3px 8px", borderRadius: "12px", fontSize: "11px",
                background: item.status === "active" ? "#d4edda" : "#f8d7da",
                color: item.status === "active" ? "#155724" : "#721c24"
              }}>
                {item.status || "active"}
              </span>
            </td>
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