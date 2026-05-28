"use client";

import { sourceSiteLabel } from "./LeadTable";

export default function LeadDetailModal({ lead, onClose }) {
  if (!lead) return null;

  return (
    <div className="leads-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="leads-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="lead-modal-title"
      >
        <div className="leads-modal-head">
          <h2 id="lead-modal-title">{lead.name}</h2>
          <button type="button" className="leads-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        <div className="leads-modal-body">
          <dl className="leads-detail-grid">
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${lead.email}`}>{lead.email}</a>
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{lead.phone || "—"}</dd>
            </div>
            <div>
              <dt>Country</dt>
              <dd>{lead.country || "—"}</dd>
            </div>
            <div>
              <dt>Form type</dt>
              <dd>
                <span className="leads-pill">{lead.form_type || "—"}</span>
              </dd>
            </div>
            <div>
              <dt>Source site</dt>
              <dd>{sourceSiteLabel(lead.source_site)}</dd>
            </div>
            <div>
              <dt>Source page</dt>
              <dd>{lead.source_page || "—"}</dd>
            </div>
            <div>
              <dt>Submitted</dt>
              <dd>
                {lead.created_at
                  ? new Date(lead.created_at).toLocaleString()
                  : "—"}
              </dd>
            </div>
            <div className="leads-detail-full">
              <dt>Message</dt>
              <dd className="leads-message-box">{lead.message || "—"}</dd>
            </div>
          </dl>
        </div>
        <div className="leads-modal-foot">
          <button type="button" className="leads-btn leads-btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
