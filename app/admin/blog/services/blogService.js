import { api } from "@/lib/api";

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

const buildFormData = (form) => {
  const data = new FormData();
  data.append("title", form.title || "");
  data.append("slug", form.slug || "");
  data.append("excerpt", form.excerpt || "");
  data.append("content", form.content || "");
  data.append("status", form.status || "publish");
  data.append("author_name", form.author_name || "");
  data.append("categories", JSON.stringify(form.categories || []));
  data.append("tags", JSON.stringify(form.tags || []));
  data.append("seo", JSON.stringify(form.seo || emptyBlogSeo));

  if (form.featuredImageFile instanceof File) {
    data.append("featured_image", form.featuredImageFile);
  } else if (form.featured_image) {
    data.append("featured_image", form.featured_image);
  }

  return data;
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
  return api.upload("/api/blog", buildFormData(form));
}

export async function updateBlogPost(id, form) {
  return api.upload(`/api/blog/${id}`, buildFormData(form), "PUT");
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
