import { api, uploadWithProgress } from "@/lib/api";
import { compressImageFile } from "../../life/utils/compressImage";
import { packBlogContent } from "../lib/blogContentCompression";

export const emptyBlogSeo = {
  meta_title: "",
  meta_description: "",
  focus_keyword: "",
  canonical_url: "",
  robots_noindex: false,
  robots_nofollow: false,
  og_title: "",
  og_description: "",
  og_image: "",
  twitter_title: "",
  twitter_description: "",
  twitter_image: "",
};

/** Max featured image before client compression (must match backend BLOG_UPLOAD_LIMITS.fileSize). */
export const BLOG_FEATURED_IMAGE_MAX_BYTES = 10 * 1024 * 1024;

const buildJsonPayload = async (form, featured_image) => {
  const packed = await packBlogContent(form.content || "");

  return {
    title: form.title || "",
    slug: form.slug || "",
    excerpt: form.excerpt || "",
    status: form.status || "publish",
    author_name: form.author_name || "",
    featured_image: featured_image || "",
    categories: form.categories || [],
    tags: form.tags || [],
    seo: form.seo || emptyBlogSeo,
    content_encoding: packed.content_encoding,
    content: packed.content,
  };
};

const resolveFeaturedImage = async (form) => {
  if (!(form.featuredImageFile instanceof File)) {
    return form.featured_image || "";
  }

  try {
    const compressed = await compressImageFile(form.featuredImageFile, { force: true });
    const data = new FormData();
    data.append("featured_image", compressed);
    const res = await uploadWithProgress("/api/blog/admin/upload-featured", data);
    return res.url || res.data?.url || "";
  } catch (err) {
    throw new Error(
      `Featured image upload failed: ${err.message || "unknown error"}`,
    );
  }
};

const saveBlogPost = async (form, method, path) => {
  const featured_image = await resolveFeaturedImage(form);
  let payload;
  try {
    payload = await buildJsonPayload(form, featured_image);
  } catch (err) {
    throw new Error(`Could not prepare post content: ${err.message || "unknown error"}`);
  }

  try {
    return method === "PUT" ? await api.put(path, payload) : await api.post(path, payload);
  } catch (err) {
    throw new Error(`Saving post failed: ${err.message || "unknown error"}`);
  }
};

export async function getBlogPosts(params = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.search) search.set("search", params.search);
  if (params.category) search.set("category", String(params.category));

  const qs = search.toString();
  const data = await api.get(`/api/blog/admin/list${qs ? `?${qs}` : ""}`);
  return {
    items: data.data || [],
    pagination: data.pagination || {},
  };
}

export async function getBlogPost(id) {
  const data = await api.get(`/api/blog/admin/${id}`);
  return data.data;
}

export async function createBlogPost(form) {
  return saveBlogPost(form, "POST", "/api/blog");
}

export async function updateBlogPost(id, form) {
  return saveBlogPost(form, "PUT", `/api/blog/${id}`);
}

export async function deleteBlogPost(id) {
  return api.delete(`/api/blog/${id}`);
}

export async function getCategories() {
  const data = await api.get("/api/blog/categories");
  return data.data || [];
}

export async function createCategory(name) {
  return api.post("/api/blog/categories", { name });
}

export async function deleteCategory(id) {
  return api.delete(`/api/blog/categories/${id}`);
}

export async function getTags() {
  const data = await api.get("/api/blog/tags");
  return data.data || [];
}

export async function getEditorSchema() {
  const data = await api.get("/api/blog/editor-schema");
  return data;
}

export async function exportBlogSeoCsv({ search = "", status = "" } = {}) {
  const params = new URLSearchParams();
  if (search.trim()) params.set("search", search.trim());
  if (status) params.set("status", status);

  const qs = params.toString();
  const res = await fetch(`/api/blog/admin/export${qs ? `?${qs}` : ""}`, {
    credentials: "include",
  });

  if (!res.ok) {
    let message = "Export failed";
    try {
      const data = await res.json();
      message = data.error || data.message || message;
    } catch {
      /* ignore */
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `blog-seo-export-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
