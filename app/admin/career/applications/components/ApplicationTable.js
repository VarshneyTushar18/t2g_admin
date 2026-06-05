"use client";

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function resumeLabel(url) {
  if (!url) return null;
  try {
    const name = decodeURIComponent(url.split("/").pop() || "");
    return name.length > 28 ? `${name.slice(0, 25)}…` : name;
  } catch {
    return "Resume";
  }
}

export default function ApplicationTable({
  applications,
  loading,
  onView,
  onStatusChange,
  statusOptions,
}) {
  if (loading) {
    return <p className="ap-empty">Loading applications…</p>;
  }

  if (!applications.length) {
    return <p className="ap-empty">No applications found.</p>;
  }

  return (
    <table className="ap-table">
      <thead>
        <tr>
          <th>Candidate</th>
          <th>Contact</th>
          <th>Applied for</th>
          <th>Resume</th>
          <th>Applied</th>
          <th>Status</th>
          <th />
        </tr>
      </thead>
      <tbody>
        {applications.map((app) => (
          <tr key={app.id}>
            <td>
              <strong>
                {app.first_name} {app.last_name}
              </strong>
              {app.last_company ? (
                <span className="ap-cell-muted">{app.last_company}</span>
              ) : null}
            </td>
            <td>
              <a href={`mailto:${app.email}`} className="ap-link">
                {app.email}
              </a>
              {app.phone ? <span className="ap-cell-muted">{app.phone}</span> : null}
            </td>
            <td>{app.job_title || "—"}</td>
            <td>
              {app.resume_file ? (
                <a
                  href={app.resume_file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ap-resume-btn"
                  title={resumeLabel(app.resume_file) || "Resume"}
                >
                  {resumeLabel(app.resume_file) || "View resume"}
                </a>
              ) : (
                <span className="ap-cell-muted">—</span>
              )}
            </td>
            <td>{formatDate(app.applied_at)}</td>
            <td>
              <select
                className="status-select"
                value={app.status}
                onChange={(e) => onStatusChange(app.id, e.target.value)}
              >
                {statusOptions.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </td>
            <td>
              <button type="button" className="ap-view-btn" onClick={() => onView(app)}>
                View
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
