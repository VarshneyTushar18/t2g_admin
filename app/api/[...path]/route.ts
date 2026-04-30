import type { NextRequest } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type RouteContext = {
  params: Promise<{
    path: string[];
  }>;
};

const backendBaseUrl = () => {
  const url = process.env.API_BASE_URL;

  if (!url) {
    throw new Error("API_BASE_URL is not configured");
  }

  return url.replace(/\/$/, "");
};

const buildBackendUrl = async (request: NextRequest, context: RouteContext) => {
  const { path } = await context.params;
  const requestUrl = new URL(request.url);
  const backendUrl = new URL(`${backendBaseUrl()}/api/${path.join("/")}`);

  backendUrl.search = requestUrl.search;

  return backendUrl;
};

const proxy = async (request: NextRequest, context: RouteContext) => {
  try {
    const backendUrl = await buildBackendUrl(request, context);
    const headers = new Headers(request.headers);

    headers.delete("host");
    headers.delete("content-length");
    headers.delete("connection");

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
