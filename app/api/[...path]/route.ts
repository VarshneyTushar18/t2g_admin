import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

type LeadRow = {
  id: number;
  source_site?: string;
  created_at?: string;
  [key: string]: unknown;
};

const backendBaseUrl = () => {
  const url = process.env.API_BASE_URL;

  if (!url) {
    throw new Error("API_BASE_URL is not configured");
  }

  return url.replace(/\/$/, "");
};

const authBackendBaseUrl = () => {
  const url = process.env.AUTH_API_BASE_URL || process.env.API_BASE_URL;
  if (!url) {
    throw new Error("AUTH_API_BASE_URL (or API_BASE_URL) is not configured");
  }
  return url.replace(/\/$/, "");
};

const leadsBackendBaseUrl = () => {
  const url = process.env.LEADS_API_BASE_URL || process.env.API_BASE_URL;
  if (!url) {
    throw new Error("LEADS_API_BASE_URL (or API_BASE_URL) is not configured");
  }
  return url.replace(/\/$/, "");
};

const aiLeadsBackendBaseUrl = () => {
  const url =
    process.env.AI_LEADS_API_BASE_URL ||
    process.env.T2G_AI_API_BASE_URL ||
    process.env.API_BASE_URL;
  if (!url) {
    throw new Error(
      "AI_LEADS_API_BASE_URL (or T2G_AI_API_BASE_URL / API_BASE_URL) is not configured"
    );
  }
  return url.replace(/\/$/, "");
};

const adminInternalApiKey = () =>
  process.env.ADMIN_INTERNAL_API_KEY?.trim() || "";

const pickBackendBase = (path: string[]) => {
  // /api/auth/* -> auth backend
  if (path[0] === "auth") {
    return authBackendBaseUrl();
  }

  // /api/leads* -> leads backend
  if (path[0] === "leads") {
    return leadsBackendBaseUrl();
  }

  // fallback for existing modules
  return backendBaseUrl();
};

const buildBackendUrl = async (request: NextRequest, context: RouteContext) => {
  const { path } = await context.params;
  const requestUrl = new URL(request.url);

  // *_API_BASE_URL may be "http://localhost:5000" OR "https://host/api" — avoid /api/api/...
  const base = pickBackendBase(path);
  const apiRoot = base.endsWith("/api") ? base : `${base}/api`;
  const backendUrl = new URL(`${apiRoot}/${path.join("/")}`);

  backendUrl.search = requestUrl.search;

  return backendUrl;
};

const withApiRoot = (base: string, path: string) => {
  const apiRoot = base.endsWith("/api") ? base : `${base}/api`;
  return new URL(`${apiRoot}/${path}`);
};

const buildForwardHeaders = (request: NextRequest) => {
  const headers = new Headers(request.headers);
  headers.delete("host");
  headers.delete("content-length");
  headers.delete("connection");
  headers.delete("expect");
  return headers;
};

const normalizeSourceSite = (value: unknown, fallback: string) => {
  const source = String(value || "").trim().toLowerCase();
  if (!source) return fallback;
  if (source === "tech2globeca") return "t2gca";
  if (source === "tech2globe" || source === "t2g_original") return "t2g";
  if (
    source === "t2g_ai" ||
    source === "t2g-ai" ||
    source === "tech2globe_ai" ||
    source === "ai"
  ) {
    return "t2gai";
  }
  return source;
};

type LeadSource = "t2g" | "t2gca" | "t2gai";

const leadSourceBaseUrl = (source: LeadSource) => {
  if (source === "t2gca") return leadsBackendBaseUrl();
  if (source === "t2gai") return aiLeadsBackendBaseUrl();
  return authBackendBaseUrl();
};

const parseCompositeLeadId = (rawId: string) => {
  const match = String(rawId).match(/^(t2g|t2gca|t2gai|shopify|amazon)-(\d+)$/i);
  if (!match) return null;
  return {
    source: normalizeSourceSite(match[1], "") as LeadSource | "shopify" | "amazon",
    numericId: match[2],
  };
};

const toCompositeLeadId = (source: LeadSource | "shopify" | "amazon", id: unknown) =>
  `${source}-${String(id)}`;

const fetchLeadsFromBackend = async ({
  base,
  requestUrl,
  headers,
  sourceFallback,
  useInternalKey = false,
  idPrefix,
  limit = 1000,
}: {
  base: string;
  requestUrl: URL;
  headers: Headers;
  sourceFallback: LeadSource | "shopify" | "amazon";
  useInternalKey?: boolean;
  idPrefix?: LeadSource | "shopify" | "amazon";
  limit?: number;
}) => {
  const url = withApiRoot(base, "leads");
  const params = new URLSearchParams(requestUrl.search);
  params.set("page", "1");
  params.set("limit", String(limit));
  params.delete("source_site");
  url.search = params.toString();

  const forwardHeaders = new Headers(headers);
  const internalKey = adminInternalApiKey();
  if (useInternalKey && internalKey) {
    forwardHeaders.set("x-admin-internal-key", internalKey);
  }

  const res = await fetch(url, {
    method: "GET",
    headers: forwardHeaders,
    redirect: "manual",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Leads backend failed (${res.status}): ${text.slice(0, 160)}`);
  }

  const json = await res.json();
  const rows = Array.isArray(json?.data) ? json.data : [];
  const compositePrefix = idPrefix || sourceFallback;
  return rows.map((row: LeadRow) => {
    const source = normalizeSourceSite(row.source_site, sourceFallback) as
      | LeadSource
      | "shopify"
      | "amazon";
    const numericId = row.id;
    return {
      ...row,
      id: toCompositeLeadId(compositePrefix, numericId),
      source_site: source,
      lead_source: row.lead_source || row.form_type || compositePrefix,
      created_at:
        (row.created_at as string | undefined) ||
        (row.submitted_at as string | undefined) ||
        row.created_at,
    };
  });
};

const csvEscape = (value: unknown) => {
  const s = value == null ? "" : String(value);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const buildLeadsExportCsv = (rows: LeadRow[]) => {
  const headers = [
    "ID",
    "Source Site",
    "Name",
    "Email",
    "Country",
    "Phone",
    "Message",
    "Form Type",
    "Source Page",
    "Sender IP",
    "Location",
    "Created At",
  ];

  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      [
        row.id,
        row.source_site || "",
        row.name || "",
        row.email || "",
        row.country || "",
        row.phone || "",
        row.message || "",
        row.form_type || row.lead_source || "",
        row.source_page || "",
        row.sender_ip || row.ip || "",
        row.location || "",
        row.created_at || "",
      ]
        .map(csvEscape)
        .join(","),
    ),
  ];

  return `\uFEFF${lines.join("\n")}`;
};

const collectLeadsForExport = async (request: NextRequest) => {
  const requestUrl = new URL(request.url);
  const headers = buildForwardHeaders(request);
  const sourceSite = normalizeSourceSite(
    requestUrl.searchParams.get("source_site"),
    "",
  );
  const formType = requestUrl.searchParams.get("form_type") || "";
  const exportLimit = 10000;

  if (formType === "shopify_intake") {
    return fetchLeadsFromBackend({
      base: authBackendBaseUrl(),
      requestUrl,
      headers,
      sourceFallback: "shopify",
      idPrefix: "shopify",
      limit: exportLimit,
    });
  }

  if (formType === "amazon_onboarding") {
    return fetchLeadsFromBackend({
      base: authBackendBaseUrl(),
      requestUrl,
      headers,
      sourceFallback: "amazon",
      idPrefix: "amazon",
      limit: exportLimit,
    });
  }

  if (sourceSite === "t2gca" || sourceSite === "t2g" || sourceSite === "t2gai") {
    const base = leadSourceBaseUrl(sourceSite as LeadSource);
    return fetchLeadsFromBackend({
      base,
      requestUrl,
      headers,
      sourceFallback: sourceSite as LeadSource,
      useInternalKey: sourceSite === "t2gai",
      limit: exportLimit,
    });
  }

  const [mainRows, caRows, aiRows] = await Promise.all([
    fetchLeadsFromBackend({
      base: authBackendBaseUrl(),
      requestUrl,
      headers,
      sourceFallback: "t2g",
      limit: exportLimit,
    }),
    fetchLeadsFromBackend({
      base: leadsBackendBaseUrl(),
      requestUrl,
      headers,
      sourceFallback: "t2gca",
      limit: exportLimit,
    }),
    fetchLeadsFromBackend({
      base: aiLeadsBackendBaseUrl(),
      requestUrl,
      headers,
      sourceFallback: "t2gai",
      useInternalKey: true,
      limit: exportLimit,
    }).catch((err) => {
      console.error("AI leads backend export fetch failed:", err);
      return [] as LeadRow[];
    }),
  ]);

  return [...mainRows, ...caRows, ...aiRows].sort((a: LeadRow, b: LeadRow) => {
    const ta = new Date(String(a.created_at || 0)).getTime();
    const tb = new Date(String(b.created_at || 0)).getTime();
    return tb - ta;
  });
};

const handleCombinedLeadsExport = async (request: NextRequest) => {
  const requestUrl = new URL(request.url);
  const formType = requestUrl.searchParams.get("form_type") || "";

  if (formType === "shopify_intake") {
    const backendUrl = withApiRoot(authBackendBaseUrl(), "leads/export");
    backendUrl.search = requestUrl.search;
    const headers = buildForwardHeaders(request);
    const response = await fetch(backendUrl, {
      method: "GET",
      headers,
      redirect: "manual",
      cache: "no-store",
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  if (formType === "amazon_onboarding") {
    const backendUrl = withApiRoot(authBackendBaseUrl(), "leads/export");
    backendUrl.search = requestUrl.search;
    const headers = buildForwardHeaders(request);
    const response = await fetch(backendUrl, {
      method: "GET",
      headers,
      redirect: "manual",
      cache: "no-store",
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  const rows = await collectLeadsForExport(request);
  const csv = buildLeadsExportCsv(rows);
  const stamp = new Date().toISOString().slice(0, 10);

  return new Response(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="leads-export-${stamp}.csv"`,
    },
  });
};

const handleCombinedLeadsList = async (request: NextRequest) => {
  const requestUrl = new URL(request.url);
  const headers = buildForwardHeaders(request);
  const sourceSite = normalizeSourceSite(
    requestUrl.searchParams.get("source_site"),
    ""
  );
  const page = Math.max(Number(requestUrl.searchParams.get("page") || 1), 1);
  const limit = Math.min(
    Math.max(Number(requestUrl.searchParams.get("limit") || 10), 1),
    100
  );

  const formType = requestUrl.searchParams.get("form_type") || "";

  if (formType === "shopify_intake") {
    const rows = await fetchLeadsFromBackend({
      base: authBackendBaseUrl(),
      requestUrl,
      headers,
      sourceFallback: "shopify",
      idPrefix: "shopify",
    });

    const total = rows.length;
    const offset = (page - 1) * limit;
    const data = rows.slice(offset, offset + limit);
    return Response.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  }

  if (formType === "amazon_onboarding") {
    const rows = await fetchLeadsFromBackend({
      base: authBackendBaseUrl(),
      requestUrl,
      headers,
      sourceFallback: "amazon",
      idPrefix: "amazon",
    });

    const total = rows.length;
    const offset = (page - 1) * limit;
    const data = rows.slice(offset, offset + limit);
    return Response.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  }

  // If a specific source is selected, fetch only that backend.
  if (sourceSite === "t2gca" || sourceSite === "t2g" || sourceSite === "t2gai") {
    const base = leadSourceBaseUrl(sourceSite as LeadSource);
    const rows = await fetchLeadsFromBackend({
      base,
      requestUrl,
      headers,
      sourceFallback: sourceSite as LeadSource,
      useInternalKey: sourceSite === "t2gai",
    });

    const total = rows.length;
    const offset = (page - 1) * limit;
    const data = rows.slice(offset, offset + limit);
    return Response.json({
      success: true,
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.max(1, Math.ceil(total / limit)),
      },
    });
  }

  // All sources: fetch all backends and merge.
  const [mainRows, caRows, aiRows] = await Promise.all([
    fetchLeadsFromBackend({
      base: authBackendBaseUrl(),
      requestUrl,
      headers,
      sourceFallback: "t2g",
    }),
    fetchLeadsFromBackend({
      base: leadsBackendBaseUrl(),
      requestUrl,
      headers,
      sourceFallback: "t2gca",
    }),
    fetchLeadsFromBackend({
      base: aiLeadsBackendBaseUrl(),
      requestUrl,
      headers,
      sourceFallback: "t2gai",
      useInternalKey: true,
    }).catch((err) => {
      console.error("AI leads backend fetch failed:", err);
      return [] as LeadRow[];
    }),
  ]);

  const merged = [...mainRows, ...caRows, ...aiRows].sort((a: LeadRow, b: LeadRow) => {
    const ta = new Date(String(a.created_at || 0)).getTime();
    const tb = new Date(String(b.created_at || 0)).getTime();
    return tb - ta;
  });

  const total = merged.length;
  const offset = (page - 1) * limit;
  const data = merged.slice(offset, offset + limit);

  return Response.json({
    success: true,
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
};

const handleLeadDelete = async (request: NextRequest, rawId: string) => {
  const parsed = parseCompositeLeadId(rawId);
  if (!parsed) {
    return Response.json(
      { success: false, message: "Invalid lead id (expected source-id format)" },
      { status: 400 }
    );
  }

  if (parsed.source === "shopify" || parsed.source === "amazon") {
    const backendUrl = withApiRoot(
      authBackendBaseUrl(),
      `leads/${parsed.numericId}`,
    );
    const headers = buildForwardHeaders(request);
    const response = await fetch(backendUrl, {
      method: "DELETE",
      headers,
      redirect: "manual",
      cache: "no-store",
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  }

  const base = leadSourceBaseUrl(parsed.source as LeadSource);
  const backendUrl = withApiRoot(base, `leads/${parsed.numericId}`);
  const headers = buildForwardHeaders(request);
  const internalKey = adminInternalApiKey();
  if (parsed.source === "t2gai" && internalKey) {
    headers.set("x-admin-internal-key", internalKey);
  }

  const response = await fetch(backendUrl, {
    method: "DELETE",
    headers,
    redirect: "manual",
    cache: "no-store",
  });

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
};

const proxy = async (request: NextRequest, context: RouteContext) => {
  try {
    const { path } = await context.params;
    if (request.method === "GET" && path[0] === "leads" && path.length === 1) {
      return await handleCombinedLeadsList(request);
    }

    if (
      request.method === "GET" &&
      path[0] === "leads" &&
      path[1] === "export"
    ) {
      return await handleCombinedLeadsExport(request);
    }

    if (request.method === "DELETE" && path[0] === "leads" && path.length === 2) {
      return await handleLeadDelete(request, path[1]);
    }

    const backendUrl = await buildBackendUrl(request, context);
    const headers = buildForwardHeaders(request);

    const method = request.method;
    const hasBody = method !== "GET" && method !== "HEAD";

    const response = await fetch(backendUrl, {
      method,
      headers,
      body: hasBody ? await request.arrayBuffer() : undefined,
      redirect: "manual",
      cache: "no-store",
    });

    return new Response(response.body, {
      status: response.status,
      statusText: response.statusText,
      headers: response.headers,
    });
  } catch (error) {
    console.error("API proxy error:", error);

    return Response.json(
      { error: "Unable to reach backend API" },
      { status: 502 }
    );
  }
};

export const GET = proxy;
export const HEAD = proxy;
export const OPTIONS = proxy;
export const POST = proxy;
export const PUT = proxy;
export const PATCH = proxy;
export const DELETE = proxy;
