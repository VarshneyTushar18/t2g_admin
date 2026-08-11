"use client";

import Link from "next/link";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  Building2,
  CalendarDays,
  Globe2,
  Layers,
  MapPin,
  RefreshCw,
  TrendingUp,
  Users,
} from "lucide-react";
import { FORM_TYPE_GROUPS } from "../components/LeadTable";
import { useLeadStats } from "../hooks/useLeadStats";
import "../leads.css";

const WEBSITE_FILTERS = [
  { value: "", label: "All websites" },
  { value: "t2g", label: "Tech2Globe.com" },
  { value: "t2gca", label: "Tech2Globe.ca" },
  { value: "t2gai", label: "T2G AI" },
];

const FORM_TYPE_LABELS = {
  ai_contact: "AI contact",
  contact_page: "Contact page",
  service_form: "Service form",
  amazon_ads: "Amazon Ads",
  amazon_onboarding: "Amazon onboarding",
  amazon_leads: "Services4Amazon",
  shopify_intake: "Shopify intake",
  unknown: "Unknown",
};

const CHART_COLORS = [
  "#4f46e5",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#14b8a6",
  "#f97316",
];

const SOURCE_COLORS = {
  t2g: "#4f46e5",
  t2gca: "#0ea5e9",
  t2gai: "#10b981",
};

function formTypeLabel(key) {
  if (!key) return "Unknown";
  return FORM_TYPE_LABELS[key] || String(key).replace(/_/g, " ");
}

function pct(count, total) {
  if (!total) return 0;
  return Math.round((count / total) * 1000) / 10;
}

function formatDate(value) {
  if (!value) return "—";
  return new Date(value).toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function shortUrl(url) {
  if (!url) return "—";
  try {
    const u = new URL(url);
    return u.pathname === "/" ? u.hostname : `${u.hostname}${u.pathname}`;
  } catch {
    return url.length > 48 ? `${url.slice(0, 48)}…` : url;
  }
}

function formatDateParam(date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function todayParam() {
  return formatDateParam(new Date());
}

function startOfWeekParam() {
  const date = new Date();
  const weekday = date.getDay();
  const diff = weekday === 0 ? 6 : weekday - 1;
  date.setDate(date.getDate() - diff);
  return formatDateParam(date);
}

function startOfMonthParam() {
  const date = new Date();
  return formatDateParam(new Date(date.getFullYear(), date.getMonth(), 1));
}

function buildLeadsUrl({ formType = "", sourceSite = "", dateFrom = "", dateTo = "", search = "" } = {}) {
  const params = new URLSearchParams();
  if (search?.trim()) params.set("search", search.trim());
  if (formType) params.set("form_type", formType);
  if (sourceSite) params.set("source_site", sourceSite);
  if (dateFrom) params.set("date_from", dateFrom);
  if (dateTo) params.set("date_to", dateTo);
  const qs = params.toString();
  return `/admin/leads${qs ? `?${qs}` : ""}`;
}

function StatCard({ label, value, hint, icon: Icon, accent, href, linkTitle }) {
  const className = `ld-kpi-card ld-kpi-${accent || "indigo"}${href ? " ld-kpi-clickable" : ""}`;
  const body = (
    <>
      <div className="ld-kpi-icon">
        <Icon size={22} strokeWidth={2.2} />
      </div>
      <div className="ld-kpi-body">
        <span className="ld-kpi-label">{label}</span>
        <strong className="ld-kpi-value">{Number(value || 0).toLocaleString()}</strong>
        {hint ? <span className="ld-kpi-hint">{hint}</span> : null}
      </div>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={className} title={linkTitle || "View leads"}>
        {body}
      </Link>
    );
  }

  return <div className={className}>{body}</div>;
}

function ChartCard({ title, subtitle, children, empty, wide, tall }) {
  return (
    <section className={`ld-chart-card${wide ? " ld-chart-wide" : ""}${tall ? " ld-chart-tall" : ""}`}>
      <header className="ld-chart-head">
        <div>
          <h2>{title}</h2>
          {subtitle ? <p>{subtitle}</p> : null}
        </div>
      </header>
      <div className="ld-chart-body">
        {empty ? <div className="ld-chart-empty">No data for this range</div> : children}
      </div>
    </section>
  );
}

function InsightTile({ label, value, meta }) {
  return (
    <div className="ld-insight-tile">
      <span className="ld-insight-label">{label}</span>
      <strong className="ld-insight-value">{value || "—"}</strong>
      {meta ? <span className="ld-insight-meta">{meta}</span> : null}
    </div>
  );
}

export default function LeadsDashboardPage() {
  const {
    stats,
    loading,
    error,
    formType,
    setFormType,
    sourceSite,
    setSourceSite,
    dateFrom,
    dateTo,
    changeDateRange,
    reload,
  } = useLeadStats();

  const totals = stats.totals || {};
  const insights = stats.insights || {};
  const total = totals.total || 0;

  const bySource = (stats.bySourceSite || []).map((row) => ({
    ...row,
    name: row.label || row.key,
    share: pct(row.count, total),
    fill: SOURCE_COLORS[row.key] || CHART_COLORS[0],
  }));

  const byForm = (stats.byFormType || []).map((row) => ({
    ...row,
    name: formTypeLabel(row.key),
    share: pct(row.count, total),
  }));

  const byCompany = stats.byCompany || [];
  const byCountry = stats.byCountry || [];
  const byDay = (stats.byDay || []).map((row) => ({
    ...row,
    label: row.date?.slice(5) || row.date,
  }));
  const byMonth = (stats.byMonth || []).map((row) => ({
    ...row,
    label: row.month?.slice(2) || row.month,
  }));
  const bySourcePage = stats.bySourcePage || [];
  const recentLeads = stats.recentLeads || [];

  const topFormLabel = insights.topForm
    ? formTypeLabel(insights.topForm.key)
    : "—";
  const topCountryLabel = insights.topCountry?.name || "—";
  const topCompanyLabel = insights.topCompany?.name || "—";
  const topWebsiteLabel = insights.topWebsite?.label || "—";
  const today = todayParam();
  const baseFilters = { formType, sourceSite };
  const rangeFilters = { ...baseFilters, dateFrom, dateTo };

  return (
    <div className="leads-page ld-page">
      <section className="ld-hero">
        <div className="ld-hero-copy">
          <span className="ld-hero-badge">Analytics</span>
          <h1>Leads Intelligence</h1>
          <p>
            Full picture of inbound demand — websites, companies, forms, geography,
            and lead velocity across all Tech2Globe properties.
          </p>
        </div>
        <div className="ld-hero-actions">
          <button
            type="button"
            className="leads-btn leads-btn-primary"
            onClick={reload}
            disabled={loading}
          >
            <RefreshCw size={16} className={loading ? "ld-spin" : ""} />
            {loading ? "Refreshing…" : "Refresh data"}
          </button>
        </div>
      </section>

      <div className="ld-filters leads-toolbar">
        <select
          className="leads-select"
          value={formType}
          onChange={(e) => setFormType(e.target.value)}
          aria-label="Filter by web form"
        >
          <option value="">All web forms</option>
          {FORM_TYPE_GROUPS.map((group) => (
            <optgroup key={group.label} label={group.label}>
              {group.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </optgroup>
          ))}
        </select>

        <select
          className="leads-select"
          value={sourceSite}
          onChange={(e) => setSourceSite(e.target.value)}
          aria-label="Filter by website"
        >
          {WEBSITE_FILTERS.map((opt) => (
            <option key={opt.value || "all"} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        <div className="leads-date-range">
          <label htmlFor="ld-date-from">From</label>
          <input
            id="ld-date-from"
            type="date"
            value={dateFrom}
            onChange={(e) => changeDateRange(e.target.value, dateTo)}
          />
          <label htmlFor="ld-date-to">To</label>
          <input
            id="ld-date-to"
            type="date"
            value={dateTo}
            onChange={(e) => changeDateRange(dateFrom, e.target.value)}
          />
          {(dateFrom || dateTo) && (
            <button
              type="button"
              className="leads-btn leads-btn-ghost leads-btn-sm"
              onClick={() => changeDateRange("", "")}
            >
              Clear dates
            </button>
          )}
        </div>
      </div>

      {error && <div className="leads-alert-error">{error}</div>}

      <div className={`ld-kpi-grid${loading ? " ld-loading" : ""}`}>
        <StatCard
          label="Total leads"
          value={total}
          hint="All sources"
          icon={Users}
          accent="indigo"
          href={buildLeadsUrl(rangeFilters)}
          linkTitle="View all matching leads"
        />
        <StatCard
          label="Today"
          value={totals.today}
          icon={CalendarDays}
          accent="sky"
          href={buildLeadsUrl({ ...baseFilters, dateFrom: today, dateTo: today })}
          linkTitle="View today's leads"
        />
        <StatCard
          label="This week"
          value={totals.thisWeek}
          icon={TrendingUp}
          accent="emerald"
          href={buildLeadsUrl({ ...baseFilters, dateFrom: startOfWeekParam(), dateTo: today })}
          linkTitle="View this week's leads"
        />
        <StatCard
          label="This month"
          value={totals.thisMonth}
          icon={Layers}
          accent="violet"
          href={buildLeadsUrl({ ...baseFilters, dateFrom: startOfMonthParam(), dateTo: today })}
          linkTitle="View this month's leads"
        />
        <StatCard
          label="Avg / active day"
          value={insights.avgDaily || 0}
          hint="Based on days with activity"
          icon={TrendingUp}
          accent="amber"
        />
        <StatCard
          label="Companies"
          value={totals.uniqueCompanies}
          hint="Named prospects"
          icon={Building2}
          accent="rose"
          href={
            insights.topCompany?.name
              ? buildLeadsUrl({
                  ...rangeFilters,
                  search: insights.topCompany.name,
                })
              : undefined
          }
          linkTitle={
            insights.topCompany?.name
              ? `Search leads for company: ${insights.topCompany.name}`
              : undefined
          }
        />
        <StatCard
          label="Countries"
          value={totals.uniqueCountries}
          hint="Geographic reach"
          icon={MapPin}
          accent="teal"
          href={
            insights.topCountry?.name
              ? buildLeadsUrl({
                  ...rangeFilters,
                  search: insights.topCountry.name,
                })
              : undefined
          }
          linkTitle={
            insights.topCountry?.name
              ? `Search leads for country: ${insights.topCountry.name}`
              : undefined
          }
        />
        <StatCard
          label="Top website"
          value={insights.topWebsite?.count || 0}
          hint={topWebsiteLabel}
          icon={Globe2}
          accent="indigo"
          href={
            insights.topWebsite?.key
              ? buildLeadsUrl({
                  ...rangeFilters,
                  sourceSite: insights.topWebsite.key,
                })
              : undefined
          }
          linkTitle={
            insights.topWebsite?.key
              ? `View leads from ${topWebsiteLabel}`
              : undefined
          }
        />
      </div>

      <section className="ld-insights-panel">
        <InsightTile
          label="Top form"
          value={topFormLabel}
          meta={insights.topForm ? `${insights.topForm.count} leads (${pct(insights.topForm.count, total)}%)` : null}
        />
        <InsightTile
          label="Top country"
          value={topCountryLabel}
          meta={insights.topCountry ? `${insights.topCountry.count} leads` : null}
        />
        <InsightTile
          label="Top company"
          value={topCompanyLabel}
          meta={insights.topCompany ? `${insights.topCompany.count} leads` : null}
        />
        <InsightTile
          label="Busiest day"
          value={insights.peakDay?.date ? formatDate(insights.peakDay.date) : "—"}
          meta={insights.peakDay ? `${insights.peakDay.count} leads` : null}
        />
      </section>

      {bySource.some((r) => r.count > 0) && (
        <section className="ld-source-cards">
          {bySource
            .filter((r) => r.count > 0)
            .map((row) => (
              <article key={row.key} className="ld-source-card">
                <div className="ld-source-card-top">
                  <span className="ld-source-dot" style={{ background: row.fill }} />
                  <strong>{row.name}</strong>
                  <span className="ld-source-count">{row.count}</span>
                </div>
                <div className="ld-source-bar-track">
                  <span
                    className="ld-source-bar-fill"
                    style={{ width: `${Math.min(row.share, 100)}%`, background: row.fill }}
                  />
                </div>
                <span className="ld-source-share">{row.share}% of all leads</span>
              </article>
            ))}
        </section>
      )}

      <ChartCard
        title="Lead velocity"
        subtitle={dateFrom || dateTo ? "Daily leads in selected range" : "Daily leads — last 30 days"}
        empty={!loading && byDay.length === 0}
        wide
        tall
      >
        <ResponsiveContainer width="100%" height={360}>
          <AreaChart data={byDay} margin={{ top: 12, right: 20, left: 0, bottom: 8 }}>
            <defs>
              <linearGradient id="ldAreaFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
            <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} />
            <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
            <Tooltip
              labelFormatter={(_, payload) => formatDate(payload?.[0]?.payload?.date)}
              formatter={(value) => [Number(value).toLocaleString(), "Leads"]}
            />
            <Area
              type="monotone"
              dataKey="count"
              stroke="#4f46e5"
              strokeWidth={3}
              fill="url(#ldAreaFill)"
              dot={{ r: 4, fill: "#4f46e5", strokeWidth: 0 }}
              activeDot={{ r: 6 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </ChartCard>

      <div className="ld-charts-grid">
        <ChartCard
          title="Leads by website"
          subtitle="Share across Tech2Globe properties"
          empty={!loading && bySource.every((r) => !r.count)}
          tall
        >
          <ResponsiveContainer width="100%" height={340}>
            <PieChart>
              <Pie
                data={bySource.filter((r) => r.count > 0)}
                dataKey="count"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={72}
                outerRadius={118}
                paddingAngle={3}
                label={({ name, share }) => `${name} (${share}%)`}
              >
                {bySource
                  .filter((r) => r.count > 0)
                  .map((entry) => (
                    <Cell key={entry.key} fill={entry.fill} />
                  ))}
              </Pie>
              <Tooltip formatter={(value) => [Number(value).toLocaleString(), "Leads"]} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Leads by form type"
          subtitle="Which funnels drive the most enquiries"
          empty={!loading && byForm.length === 0}
          tall
        >
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={byForm} margin={{ top: 12, right: 12, left: 0, bottom: 56 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="name"
                tick={{ fontSize: 11, fill: "#64748b" }}
                interval={0}
                angle={-24}
                textAnchor="end"
                height={72}
              />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip
                formatter={(value, _n, item) => [
                  `${Number(value).toLocaleString()} (${item.payload.share}%)`,
                  "Leads",
                ]}
              />
              <Bar dataKey="count" radius={[8, 8, 0, 0]} maxBarSize={56}>
                {byForm.map((_, i) => (
                  <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Top companies"
          subtitle="Prospect brands submitting enquiries"
          empty={!loading && byCompany.length === 0}
          tall
        >
          <ResponsiveContainer width="100%" height={380}>
            <BarChart
              layout="vertical"
              data={byCompany.slice(0, 14)}
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <Tooltip formatter={(value) => [Number(value).toLocaleString(), "Leads"]} />
              <Bar dataKey="count" fill="#4f46e5" radius={[0, 8, 8, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Leads by country"
          subtitle="Geographic distribution of inbound interest"
          empty={!loading && byCountry.length === 0}
          tall
        >
          <ResponsiveContainer width="100%" height={380}>
            <BarChart
              layout="vertical"
              data={byCountry.slice(0, 14)}
              margin={{ top: 8, right: 24, left: 8, bottom: 8 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" horizontal={false} />
              <XAxis type="number" allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis
                type="category"
                dataKey="name"
                width={140}
                tick={{ fontSize: 11, fill: "#64748b" }}
              />
              <Tooltip formatter={(value) => [Number(value).toLocaleString(), "Leads"]} />
              <Bar dataKey="count" fill="#0ea5e9" radius={[0, 8, 8, 0]} maxBarSize={22} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard
          title="Monthly trend"
          subtitle="Longer-term lead volume by month"
          empty={!loading && byMonth.length === 0}
          wide
        >
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={byMonth} margin={{ top: 12, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
              <XAxis dataKey="label" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip
                labelFormatter={(_, payload) => payload?.[0]?.payload?.month || ""}
                formatter={(value) => [Number(value).toLocaleString(), "Leads"]}
              />
              <Bar dataKey="count" fill="#8b5cf6" radius={[8, 8, 0, 0]} maxBarSize={48} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <div className="ld-bottom-grid">
        <ChartCard title="Recent leads" subtitle="Latest inbound submissions">
          {recentLeads.length === 0 && !loading ? (
            <div className="ld-chart-empty">No recent leads</div>
          ) : (
            <div className="ld-table-wrap ld-table-wrap-tall">
              <table className="ld-rank-table ld-recent-table">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Company</th>
                    <th>Form</th>
                    <th>Country</th>
                    <th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {recentLeads.map((lead, i) => (
                    <tr key={`${lead.id}-${i}`}>
                      <td className="ld-rank-name">{lead.name || "—"}</td>
                      <td className="ld-cell-muted">{lead.email || "—"}</td>
                      <td>{lead.company || "—"}</td>
                      <td>
                        <span className="leads-pill">{formTypeLabel(lead.form_type)}</span>
                      </td>
                      <td>{lead.country || "—"}</td>
                      <td className="ld-cell-muted">{formatDate(lead.created_at)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Top source pages" subtitle="URLs driving the most leads">
          {bySourcePage.length === 0 && !loading ? (
            <div className="ld-chart-empty">No source page data</div>
          ) : (
            <div className="ld-table-wrap ld-table-wrap-tall">
              <table className="ld-rank-table">
                <thead>
                  <tr>
                    <th>Page</th>
                    <th>Leads</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {bySourcePage.map((row) => {
                    const share = pct(row.count, total);
                    return (
                      <tr key={row.name}>
                        <td className="ld-rank-name" title={row.name}>
                          {shortUrl(row.name)}
                        </td>
                        <td>{row.count}</td>
                        <td>
                          <div className="ld-share">
                            <span
                              className="ld-share-bar"
                              style={{ width: `${Math.min(share, 100)}%` }}
                            />
                            <span>{share}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>

        <ChartCard title="Company leaderboard" subtitle="Ranked by lead volume" wide>
          {byCompany.length === 0 && !loading ? (
            <div className="ld-chart-empty">No company names recorded yet</div>
          ) : (
            <div className="ld-table-wrap ld-table-wrap-tall">
              <table className="ld-rank-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Company</th>
                    <th>Leads</th>
                    <th>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {byCompany.map((row, i) => {
                    const share = pct(row.count, total);
                    return (
                      <tr key={row.name}>
                        <td>{i + 1}</td>
                        <td className="ld-rank-name">{row.name}</td>
                        <td>{row.count}</td>
                        <td>
                          <div className="ld-share">
                            <span
                              className="ld-share-bar"
                              style={{ width: `${Math.min(share, 100)}%` }}
                            />
                            <span>{share}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
