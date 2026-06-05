"use client";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function resumeLabel(url) {
  if (!url) return "No resume";
  try {
    const name = decodeURIComponent(url.split("/").pop() || "");
    return name || "Resume";
  } catch {
    return "Resume";
  }
}

export default function ApplicationDetailModal({ application, onClose }) {
  if (!application) return null;

  const fullName = `${application.first_name || ""} ${application.last_name || ""}`.trim();

  return (
    <div className="ap-modal-backdrop" onClick={onClose} role="presentation">
      <div
        className="ap-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-labelledby="application-modal-title"
      >
        <div className="ap-modal-head">
          <div>
            <h2 id="application-modal-title">{fullName || "Application"}</h2>
            <p className="ap-modal-sub">{application.job_title || "—"}</p>
          </div>
          <button type="button" className="ap-modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>

        <div className="ap-modal-body">
          <dl className="ap-detail-grid">
            <div>
              <dt>Email</dt>
              <dd>
                <a href={`mailto:${application.email}`}>{application.email}</a>
              </dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{application.phone || "—"}</dd>
            </div>
            <div>
              <dt>Applied for</dt>
              <dd>{application.job_title || "—"}</dd>
            </div>
            <div>
              <dt>Source</dt>
              <dd>Career form (website)</dd>
            </div>
            <div>
              <dt>Applied on</dt>
              <dd>{formatDate(application.applied_at)}</dd>
            </div>
            <div>
              <dt>Status</dt>
              <dd>
                <span className={`ap-status-pill ap-status-${application.status}`}>
                  {application.status || "pending"}
                </span>
              </dd>
            </div>
            <div>
              <dt>Current CTC</dt>
              <dd>{application.current_ctc ? `${application.current_ctc} LPA` : "—"}</dd>
            </div>
            <div>
              <dt>Expected CTC</dt>
              <dd>{application.expected_ctc ? `${application.expected_ctc} LPA` : "—"}</dd>
            </div>
            <div>
              <dt>Notice period</dt>
              <dd>{application.notice_period || "—"}</dd>
            </div>
            <div>
              <dt>Last company</dt>
              <dd>{application.last_company || "—"}</dd>
            </div>
            <div>
              <dt>Available to join</dt>
              <dd>{application.join_date || "—"}</dd>
            </div>
            <div>
              <dt>Portfolio</dt>
              <dd>
                {application.portfolio_link ? (
                  <a href={application.portfolio_link} target="_blank" rel="noopener noreferrer">
                    {application.portfolio_link}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div>
              <dt>LinkedIn</dt>
              <dd>
                {application.linked_in ? (
                  <a href={application.linked_in} target="_blank" rel="noopener noreferrer">
                    {application.linked_in}
                  </a>
                ) : (
                  "—"
                )}
              </dd>
            </div>
            <div className="ap-detail-full">
              <dt>Resume</dt>
              <dd>
                {application.resume_file ? (
                  <a
                    href={application.resume_file}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ap-resume-link"
                  >
                    View / download — {resumeLabel(application.resume_file)}
                  </a>
                ) : (
                  "Not uploaded"
                )}
              </dd>
            </div>
            {application.comments ? (
              <div className="ap-detail-full">
                <dt>Comments</dt>
                <dd className="ap-comments-box">{application.comments}</dd>
              </div>
            ) : null}
            {application.admin_notes ? (
              <div className="ap-detail-full">
                <dt>Admin notes</dt>
                <dd className="ap-comments-box">{application.admin_notes}</dd>
              </div>
            ) : null}
          </dl>
        </div>

        <div className="ap-modal-foot">
          {application.resume_file ? (
            <a
              href={application.resume_file}
              target="_blank"
              rel="noopener noreferrer"
              className="ap-btn ap-btn-primary"
            >
              Open resume
            </a>
          ) : null}
          <button type="button" className="ap-btn ap-btn-ghost" onClick={onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
