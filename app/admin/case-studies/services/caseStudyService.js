import { api } from "@/lib/api";

// ================= GET =================
export async function getCaseStudies() {
  const data = await api.get("/api/case-studies/admin");
  return data.data || [];
}

// ================= CREATE =================
export async function createCaseStudy(form) {
  return api.post("/api/case-studies", form);
}

// ================= UPDATE =================
export async function updateCaseStudy(id, form) {
  return api.put(`/api/case-studies/${id}`, form);
}

// ================= DELETE =================
export async function deleteCaseStudy(id) {
  return api.delete(`/api/case-studies/${id}`);
}

// ================= CATEGORY =================
export async function getCategories() {
  const data = await api.get("/api/case-studies/categories");
  return data.data || [];
}

export async function createCategory(name) {
  return api.post("/api/case-studies/categories", { name });
}

export async function deleteCategory(id) {
  return api.delete(`/api/case-studies/categories/${id}`);
}