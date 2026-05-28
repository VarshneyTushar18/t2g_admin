"use client";

const FORM_TYPES = [
  { value: "", label: "All form types" },
  { value: "contact_page", label: "Contact page" },
  { value: "service_form", label: "Service form" },
  { value: "career", label: "Career" },
];

const SOURCE_SITE_LABELS = {
  t2gca: "T2G CA",
  t2g: "T2G Original",
  t2g_original: "T2G Original",
  tech2globeca: "T2G CA",
  tech2globe: "T2G Original",
};

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export { FORM_TYPES };

export function sourceSiteLabel(value) {
  if (!value) return "—";
  return SOURCE_SITE_LABELS[value] || value;
}

export default function LeadTable({
  leads,
  loading,
  onView,
  onDelete,
  canDelete,
}) {
  if (loading) {
    return (
      <div className="leads-table-skeleton">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="leads-skeleton-row" />
        ))}
      </div>
    );
  }

  if (!leads.length) {
    return (
      <div className="leads-empty">
        <p>No leads found</p>
        <span>Try adjusting search or filters</span>
      </div>
    );
  }

  return (
    <>
      <div className="leads-table-wrap">
        <table className="leads-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Country</th>
              <th>Phone</th>
              <th>Message</th>
              <th>Form</th>
              <th>Source</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={lead.id}>
                <td data-label="Name">
                  <span className="leads-name">{lead.name}</span>
                </td>
                <td data-label="Email">
                  <a className="leads-email" href={`mailto:${lead.email}`}>
                    {lead.email}
                  </a>
                </td>
                <td data-label="Country">{lead.country || "—"}</td>
                <td data-label="Phone">{lead.phone || "—"}</td>
                <td data-label="Message">
                  <span className="leads-msg-preview" title={lead.message}>
                    {lead.message || "—"}
                  </span>
                </td>
                <td data-label="Form">
                  {lead.form_type ? (
                    <span className="leads-pill">{lead.form_type}</span>
                  ) : (
                    "—"
                  )}
                </td>
                <td data-label="Source">
                  <div>
                    <span className="leads-source leads-source-strong">
                      {sourceSiteLabel(lead.source_site)}
                    </span>
                    {lead.source_page ? (
                      <div style={{ marginTop: 4, color: "#64748b", fontSize: 12 }}>
                        {lead.source_page}
                      </div>
                    ) : null}
                  </div>
                </td>
                <td data-label="Date" className="leads-date">
                  {formatDate(lead.created_at)}
                </td>
                <td data-label="Actions">
                  <div className="leads-row-actions">
                    <button
                      type="button"
                      className="leads-btn leads-btn-sm leads-btn-view"
                      onClick={() => onView(lead)}
                    >
                      View
                    </button>
                    {canDelete && (
                      <button
                        type="button"
                        className="leads-btn leads-btn-sm leads-btn-danger"
                        onClick={() => {
                          if (confirm("Delete this lead permanently?")) {
                            onDelete(lead.id);
                          }
                        }}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="leads-mobile-cards">
        {leads.map((lead) => (
          <article key={lead.id} className="leads-mobile-card">
            <div className="leads-mobile-card-top">
              <strong>{lead.name}</strong>
              {lead.form_type && <span className="leads-pill">{lead.form_type}</span>}
            </div>
            <a className="leads-email" href={`mailto:${lead.email}`}>
              {lead.email}
            </a>
            <p className="leads-mobile-meta">
              {[lead.country, lead.phone].filter(Boolean).join(" · ") || "—"}
            </p>
            {lead.message && (
              <p className="leads-mobile-message">{lead.message}</p>
            )}
            <div className="leads-row-actions">
              <button
                type="button"
                className="leads-btn leads-btn-sm leads-btn-view"
                onClick={() => onView(lead)}
              >
                View
              </button>
              {canDelete && (
                <button
                  type="button"
                  className="leads-btn leads-btn-sm leads-btn-danger"
                  onClick={() => {
                    if (confirm("Delete this lead?")) onDelete(lead.id);
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          </article>
        ))}
      </div>
    </>
  );
}
