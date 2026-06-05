import { api } from "@/lib/api";

export async function getBlogPosts(params = {}) {
  const search = new URLSearchParams();
  if (params.page) search.set("page", String(params.page));
  if (params.limit) search.set("limit", String(params.limit));
  if (params.search) search.set("search", params.search);

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
  return api.post("/api/blog", form);
}

export async function updateBlogPost(id, form) {
  return api.put(`/api/blog/${id}`, form);
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
