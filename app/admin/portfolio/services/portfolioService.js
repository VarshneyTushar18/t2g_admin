import { api } from "@/lib/api";

// ── Categories ─────────────────────────────────────────────────
export const getCategories = () =>
  api.get("/api/portfolio/categories").then(d => Array.isArray(d) ? d : []).catch(() => []);

export const createCategory = (name) =>
  api.post("/api/portfolio/categories", { name });

export const updateCategory = (id, name) =>
  api.put(`/api/portfolio/categories/${id}`, { name });

export const deleteCategory = (id) =>
  api.delete(`/api/portfolio/categories/${id}`);

// ── Subcategories ──────────────────────────────────────────────
export const getSubcategories = (categoryId) =>
  api.get(`/api/portfolio/subcategories/${categoryId}`).then(d => Array.isArray(d) ? d : []).catch(() => []);

export const createSubcategory = (name, category_id) =>
  api.post("/api/portfolio/subcategories", { name, category_id });

export const updateSubcategory = (id, name, category_id) =>
  api.put(`/api/portfolio/subcategories/${id}`, { name, category_id });

export const deleteSubcategory = (id) =>
  api.delete(`/api/portfolio/subcategories/${id}`);

// ── Projects ───────────────────────────────────────────────────
export const getProjects = (subcategoryId) =>
  api.get(`/api/portfolio/projects/${subcategoryId}`).then(d => Array.isArray(d) ? d : []).catch(() => []);

export const createProject = (fd) =>
  api.upload("/api/portfolio/projects", fd);

export const updateProject = (id, fd) =>
  api.upload(`/api/portfolio/projects/${id}`, fd, "PUT");

export const deleteProject = (id) =>
  api.delete(`/api/portfolio/projects/${id}`);