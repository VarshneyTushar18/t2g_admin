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
  return source;
};

const fetchLeadsFromBackend = async ({
  base,
  requestUrl,
  headers,
  sourceFallback,
}: {
  base: string;
  requestUrl: URL;
  headers: Headers;
  sourceFallback: string;
}) => {
  const url = withApiRoot(base, "leads");
  const params = new URLSearchParams(requestUrl.search);
  params.set("page", "1");
  params.set("limit", "1000");
  params.delete("source_site");
  url.search = params.toString();

  const res = await fetch(url, {
    method: "GET",
    headers,
    redirect: "manual",
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Leads backend failed (${res.status}): ${text.slice(0, 160)}`);
  }

  const json = await res.json();
  const rows = Array.isArray(json?.data) ? json.data : [];
  return rows.map((row: LeadRow) => ({
    ...row,
    source_site: normalizeSourceSite(row.source_site, sourceFallback),
  }));
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

  // If a specific source is selected, fetch only that backend.
  if (sourceSite === "t2gca" || sourceSite === "t2g") {
    const base = sourceSite === "t2gca" ? leadsBackendBaseUrl() : authBackendBaseUrl();
    const rows = await fetchLeadsFromBackend({
      base,
      requestUrl,
      headers,
      sourceFallback: sourceSite,
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

  // All sources: fetch both and merge.
  const [mainRows, caRows] = await Promise.all([
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
  ]);

  const merged = [...mainRows, ...caRows].sort((a: LeadRow, b: LeadRow) => {
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

const proxy = async (request: NextRequest, context: RouteContext) => {
  try {
    const { path } = await context.params;
    if (request.method === "GET" && path[0] === "leads" && path.length === 1) {
      return await handleCombinedLeadsList(request);
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
