const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API = `${API_BASE}/api/life/admin/items`;

export async function getLifeItems() {
  const res = await fetch(API, { credentials: "include" });
  return res.json();
}

export async function createLifeItem(form) {
  const data = new FormData();
  data.append("category",       form.category);
  data.append("category_title", form.category_title);
  data.append("year",           form.year);
  data.append("description",    form.description || "");
  data.append("sort_order",     form.sort_order  || 0);
  data.append("is_active",      form.is_active ? 1 : 0);

  if (form.banner) {
    data.append("banner", form.banner);  // single banner
  }

  // Multiple gallery images
  if (form.galleryFiles?.length) {
    form.galleryFiles.forEach(file => data.append("gallery", file));
  }

  return fetch(API, { method: "POST", credentials: "include", body: data });
}

export async function updateLifeItem(id, form) {
  const data = new FormData();
  data.append("category",       form.category);
  data.append("category_title", form.category_title);
  data.append("year",           form.year);
  data.append("description",    form.description || "");
  data.append("sort_order",     form.sort_order  || 0);
  data.append("is_active",      form.is_active ? 1 : 0);

  if (form.banner) {
    data.append("banner", form.banner);
  }

  if (form.galleryFiles?.length) {
    form.galleryFiles.forEach(file => data.append("gallery", file));
  }

  return fetch(`${API}/${id}`, { method: "PUT", credentials: "include", body: data });
}

export async function deleteLifeItem(id) {
  return fetch(`${API}/${id}`, { method: "DELETE", credentials: "include" });
}