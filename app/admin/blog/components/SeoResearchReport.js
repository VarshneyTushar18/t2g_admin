"use client";

const list = (v) => (Array.isArray(v) ? v.filter(Boolean) : []);

function Section({ title, children }) {
  return (
    <section className="srr-section">
      <h4>{title}</h4>
      {children}
    </section>
  );
}

function Row({ label, value }) {
  if (!value) return null;
  return (
    <div className="srr-row">
      <span>{label}</span>
      <div>{value}</div>
    </div>
  );
}

export default function SeoResearchReport({ report }) {
  if (!report) return null;
  const r = report.research || {};
  const seo = report.seo || {};
  const score = report.score || { passed: 0, total: 0 };

  return (
    <div className="srr">
      <style>{`
        .srr { display: grid; gap: 14px; padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; font-size: 13px; color: #334155; }
        .srr-head { display: flex; justify-content: space-between; align-items: center; gap: 12px; flex-wrap: wrap; }
        .srr-head h3 { margin: 0; font-size: 15px; color: #0f172a; }
        .srr-score { font-weight: 700; padding: 4px 10px; border-radius: 999px; background: #e0e7ff; color: #3730a3; }
        .srr-grid { display: grid; gap: 14px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); }
        .srr-section { background: #fff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px 14px; }
        .srr-section h4 { margin: 0 0 8px; font-size: 13px; color: #0f172a; }
        .srr-section p { margin: 0; line-height: 1.55; }
        .srr-section ul { margin: 0; padding-left: 18px; line-height: 1.6; }
        .srr-row { display: grid; grid-template-columns: 140px 1fr; gap: 8px; padding: 4px 0; border-bottom: 1px solid #f1f5f9; }
        .srr-row:last-child { border-bottom: none; }
        .srr-row > span { color: #64748b; }
        .srr-chips { display: flex; flex-wrap: wrap; gap: 6px; }
        .srr-chip { background: #eef2f7; padding: 2px 8px; border-radius: 999px; font-size: 12px; }
        .srr-check { list-style: none; padding: 0 !important; }
        .srr-check li { display: flex; gap: 8px; align-items: baseline; }
        .srr-ok { color: #15803d; font-weight: 700; }
        .srr-bad { color: #b91c1c; font-weight: 700; }
        .srr-muted { color: #64748b; }
        .srr a { color: #2563eb; word-break: break-all; }
      `}</style>

      <div className="srr-head">
        <h3>SEO research report</h3>
        <span className="srr-score">
          Checklist {score.passed}/{score.total}
        </span>
      </div>

      {list(report.limitations).length > 0 && (
        <Section title="Research limitations">
          <ul>
            {list(report.limitations).map((l) => (
              <li key={l}>{l}</li>
            ))}
          </ul>
        </Section>
      )}

      <div className="srr-grid">
        {r.research_summary && (
          <Section title="Research summary">
            <p>{r.research_summary}</p>
          </Section>
        )}

        <Section title="Keyword strategy">
          <Row label="Primary" value={r.primary_keyword} />
          <Row
            label="Secondary"
            value={
              list(r.secondary_keywords).length ? (
                <div className="srr-chips">
                  {list(r.secondary_keywords).map((k) => (
                    <span key={k} className="srr-chip">{k}</span>
                  ))}
                </div>
              ) : null
            }
          />
          <Row
            label="Semantic"
            value={list(r.semantic_keywords).length ? list(r.semantic_keywords).join(", ") : null}
          />
          <Row label="Search intent" value={r.search_intent} />
          <Row label="Audience" value={r.target_audience} />
          <Row label="Location" value={r.target_location} />
          <Row label="Main goal" value={r.main_goal} />
          <Row label="Cannibalization" value={r.cannibalization_risk} />
        </Section>

        <Section title="SEO metadata">
          <Row label="Title" value={seo.title} />
          <Row label="Meta title" value={seo.meta_title} />
          <Row label="Meta description" value={seo.meta_description} />
          <Row label="Focus keyword" value={seo.focus_keyword} />
          <Row
            label="URL"
            value={
              seo.url ? (
                <a href={seo.url} target="_blank" rel="noreferrer">{seo.url}</a>
              ) : null
            }
          />
          <Row label="Word count" value={report.word_count ? `${report.word_count} words` : null} />
        </Section>

        <Section title="Optimization checklist">
          <ul className="srr-check">
            {list(report.checklist).map((c) => (
              <li key={c.label}>
                <span className={c.ok ? "srr-ok" : "srr-bad"}>{c.ok ? "✓" : "✗"}</span>
                <span>
                  {c.label}
                  {c.detail ? <span className="srr-muted"> — {c.detail}</span> : null}
                </span>
              </li>
            ))}
          </ul>
        </Section>

        {list(r.competitors).length > 0 && (
          <Section title="Competitor analysis">
            <ul>
              {list(r.competitors).map((c) => (
                <li key={c.url}>
                  <a href={c.url} target="_blank" rel="noreferrer">{c.title || c.url}</a>
                  {c.gap ? <div className="srr-muted">Gap: {c.gap}</div> : null}
                </li>
              ))}
            </ul>
          </Section>
        )}

        {list(r.content_gaps).length > 0 && (
          <Section title="Content gaps covered">
            <ul>
              {list(r.content_gaps).map((g) => (
                <li key={g}>{g}</li>
              ))}
            </ul>
          </Section>
        )}

        <Section title="Internal links in the post">
          {list(report.internal_links).length ? (
            <ul>
              {list(report.internal_links).map((l, i) => (
                <li key={`${l.url}-${i}`}>
                  <strong>{l.anchor}</strong> →{" "}
                  <a href={l.url} target="_blank" rel="noreferrer">{l.url}</a>
                </li>
              ))}
            </ul>
          ) : (
            <p className="srr-muted">None</p>
          )}
        </Section>

        {list(r.internal_links).length > 0 && (
          <Section title="Internal linking suggestions">
            <ul>
              {list(r.internal_links).map((l) => (
                <li key={l.url}>
                  <strong>{l.anchor}</strong> →{" "}
                  <a href={l.url} target="_blank" rel="noreferrer">{l.url}</a>
                  {l.why ? <div className="srr-muted">{l.why}</div> : null}
                </li>
              ))}
            </ul>
          </Section>
        )}

        <Section title="FAQs in the post">
          {list(report.faqs).length ? (
            <ul>
              {list(report.faqs).map((q) => (
                <li key={q}>{q}</li>
              ))}
            </ul>
          ) : (
            <p className="srr-muted">No FAQ section found</p>
          )}
        </Section>

        <Section title="Sources">
          {list(report.external_links).length || list(r.sources).length ? (
            <ul>
              {(list(report.external_links).length ? report.external_links : r.sources).map(
                (s, i) => (
                  <li key={`${s.url}-${i}`}>
                    <a href={s.url} target="_blank" rel="noreferrer">
                      {s.title || s.anchor || s.url}
                    </a>
                  </li>
                ),
              )}
            </ul>
          ) : (
            <p className="srr-muted">No verified sources</p>
          )}
        </Section>
      </div>
    </div>
  );
}
