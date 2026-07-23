"use client";

const FORM_TYPE_GROUPS = [
  {
    label: "Website forms",
    options: [
      { value: "contact_page", label: "Contact page" },
      { value: "service_form", label: "Service form" },
      { value: "ai_contact", label: "AI contact" },
    ],
  },
  {
    label: "Landing pages",
    options: [
      { value: "amazon_ads", label: "Amazon Ads (short form)" },
      { value: "amazon_onboarding", label: "Amazon onboarding" },
      { value: "amazon_leads", label: "Services4Amazon leads" },
      { value: "shopify_intake", label: "Shopify intake" },
    ],
  },
];

const FORM_TYPES = [
  { value: "", label: "All web forms" },
  ...FORM_TYPE_GROUPS.flatMap((group) => group.options),
];

const SOURCE_SITE_LABELS = {
  t2gca: "Tech2Globe.ca",
  t2g: "Tech2Globe.com",
  t2gai: "T2G AI",
  shopify: "Tech2Globe.com",
  amazon: "Tech2Globe.com",
  s4a: "Services4Amazon",
  t2g_ai: "T2G AI",
  tech2globe_ai: "T2G AI",
  t2g_original: "Tech2Globe.com",
  tech2globeca: "Tech2Globe.ca",
  tech2globe: "Tech2Globe.com",
};

const FORM_TYPE_LABELS = {
  ai_contact: "AI contact",
  contact_page: "Contact page",
  service_form: "Service form",
  amazon_ads: "Amazon Ads (short form)",
  amazon_onboarding: "Amazon onboarding",
  amazon_leads: "Services4Amazon leads",
  shopify_intake: "Shopify intake",
};

function formTypeLabel(value) {
  if (!value) return null;
  return FORM_TYPE_LABELS[value] || value.replace(/_/g, " ");
}

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

export { FORM_TYPES, FORM_TYPE_GROUPS };

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
          <colgroup>
            <col className="leads-col-name" />
            <col className="leads-col-email" />
            <col className="leads-col-country" />
            <col className="leads-col-phone" />
            <col className="leads-col-message" />
            <col className="leads-col-form" />
            <col className="leads-col-source" />
            <col className="leads-col-date" />
            <col className="leads-col-actions" />
          </colgroup>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Country</th>
              <th>Phone</th>
              <th>Message</th>
              <th>Web form</th>
              <th>Website</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((lead) => (
              <tr key={`${lead.source_site || "lead"}-${lead.id}`}>
                <td data-label="Name" className="leads-cell-name">
                  <span className="leads-name">{lead.name}</span>
                </td>
                <td data-label="Email" className="leads-cell-email">
                  <a
                    className="leads-email"
                    href={`mailto:${lead.email}`}
                    title={lead.email}
                  >
                    {lead.email}
                  </a>
                </td>
                <td data-label="Country" className="leads-cell-country">
                  {lead.country || "—"}
                </td>
                <td data-label="Phone" className="leads-cell-phone">
                  <span className="leads-phone" title={lead.phone}>
                    {lead.phone || "—"}
                  </span>
                </td>
                <td data-label="Message" className="leads-cell-message">
                  <span className="leads-msg-preview" title={lead.message || lead.store_link}>
                    {lead.message || lead.store_link || "—"}
                  </span>
                </td>
                <td data-label="Web form" className="leads-cell-form">
                  {lead.form_type ? (
                    <span
                      className="leads-pill"
                      data-form={lead.form_type}
                    >
                      {formTypeLabel(lead.form_type)}
                    </span>
                  ) : (
                    "—"
                  )}
                </td>
                <td data-label="Website" className="leads-cell-source">
                  <div className="leads-source-block">
                    <span className="leads-source-strong">
                      {sourceSiteLabel(lead.source_site)}
                    </span>
                    {lead.source_page ? (
                      <a
                        className="leads-source-page"
                        href={lead.source_page}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={lead.source_page}
                      >
                        {lead.source_page}
                      </a>
                    ) : null}
                  </div>
                </td>
                <td data-label="Date" className="leads-cell-date leads-date">
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
                            onDelete(lead);
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
          <article key={`${lead.source_site || "lead"}-${lead.id}`} className="leads-mobile-card">
            <div className="leads-mobile-card-top">
              <strong>{lead.name}</strong>
              {lead.form_type && (
                <span className="leads-pill">{formTypeLabel(lead.form_type)}</span>
              )}
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
                    if (confirm("Delete this lead?")) onDelete(lead);
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
