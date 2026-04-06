"use client";

export default function TestimonialTable({ items }) {
  if (!items || items.length === 0) {
    return (
      <div className="tp-empty">
        <div className="tp-empty-icon">💬</div>
        <p>No testimonials yet. Add your first one!</p>
      </div>
    );
  }

  return (
    <div className="tp-table-wrapper">
      <table
        id="testimonialTable"
        className="display nowrap tp-table"
        style={{ width: "100%" }}
      >
        <thead>
          <tr>
            <th>ID</th>
            <th>Client</th>
            <th>Rating</th>
            <th>Review</th>
            <th>Company</th>
            <th>Logo</th>
            <th>Link</th>
            <th>Status</th>
            <th style={{ textAlign: "center" }}>Actions</th>
          </tr>
        </thead>

        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              {/* ID */}
              <td className="tp-id">#{item.id}</td>

              {/* Client */}
              <td>
                <div className="tp-user">
                  {item.avatar ? (
                    <img
                      src={item.avatar}
                      alt={item.name}
                      className="tp-avatar-img"
                    />
                  ) : (
                    <div className="tp-avatar-fallback">
                      {item.name?.charAt(0)?.toUpperCase()}
                    </div>
                  )}
                  <div>
                    <div className="tp-name">{item.name}</div>
                    {item.position && (
                      <div className="tp-position">{item.position}</div>
                    )}
                    <div className="tp-company-sub">
                      {item.companyName || "—"}
                    </div>
                  </div>
                </div>
              </td>

              {/* Stars */}
              <td className="tp-stars">
                <span className="tp-stars-filled">
                  {"★".repeat(Math.max(0, Math.min(5, item.stars || 0)))}
                </span>
                <span className="tp-stars-empty">
                  {"☆".repeat(5 - Math.max(0, Math.min(5, item.stars || 0)))}
                </span>
              </td>

              {/* Review */}
              <td className="tp-text" title={item.text}>
                <span className="tp-text-clamp">{item.text}</span>
              </td>

              {/* Company */}
              <td>{item.companyName || "—"}</td>

              {/* Logo */}
              <td>
                {item.companyLogo ? (
                  <img
                    src={item.companyLogo}
                    className="tp-logo"
                    alt={item.companyName || "logo"}
                  />
                ) : (
                  <span className="tp-dash">—</span>
                )}
              </td>

              {/* Link */}
              <td>
                {item.link ? (
                  <a
                    href={item.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="tp-link"
                  >
                    ↗ Visit
                  </a>
                ) : (
                  <span className="tp-dash">—</span>
                )}
              </td>

              {/* Status */}
              <td>
                <span
                  className={`tp-badge ${
                    item.status === "active" ||
                    item.status === true ||
                    item.status === 1
                      ? "active"
                      : "inactive"
                  }`}
                >
                  {item.status === "active" ||
                  item.status === true ||
                  item.status === 1
                    ? "Active"
                    : "Inactive"}
                </span>
              </td>

              {/* Actions — ✅ both buttons have data-id */}
              <td className="tp-actions">
                <button
                  className="btn btn-edit edit-btn"
                  data-id={item.id}
                >
                  ✏ Edit
                </button>
                <button
                  className="btn btn-delete delete-btn"
                  data-id={item.id}   // ✅ FIXED — was missing
                >
                  🗑 Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}