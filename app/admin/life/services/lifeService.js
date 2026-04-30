import { api } from "@/lib/api";

const BASE_URL = "/api/life/admin/items";

const buildFormData = (form) => {
  const data = new FormData();
  data.append("category",       form.category);
  data.append("category_title", form.category_title);
  data.append("year",           form.year);
  data.append("description",    form.description || "");
  data.append("sort_order",     form.sort_order  || 0);
  data.append("is_active",      form.is_active ? 1 : 0);

  if (form.banner) data.append("banner", form.banner);

  if (form.galleryFiles?.length) {
    form.galleryFiles.forEach(file => data.append("gallery", file));
  }

  return data;
};

export async function getLifeItems() {
  return api.get(BASE_URL);
}

export async function createLifeItem(form) {
  return api.upload(BASE_URL, buildFormData(form));
}

export async function updateLifeItem(id, form) {
  return api.upload(`${BASE_URL}/${id}`, buildFormData(form), "PUT");
}

export async function deleteLifeItem(id) {
  return api.delete(`${BASE_URL}/${id}`);
}