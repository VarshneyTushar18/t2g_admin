import { api } from "@/lib/api";

const BASE_URL = "/api/testimonials";

const buildFormData = (form) => {
  const data = new FormData();
  data.append("name",        form.name        || "");
  data.append("stars",       form.stars       || 5);
  data.append("text",        form.text        || "");
  data.append("position",    form.position    || "");
  data.append("companyName", form.companyName || "");
  data.append("link",        form.link        || "");
  data.append("status",      form.is_active ? 1 : 0);

  if (form.avatar      instanceof File) data.append("avatar",      form.avatar);
  if (form.companyLogo instanceof File) data.append("companyLogo", form.companyLogo);

  return data;
};

export async function getTestimonials() {
  return api.get(BASE_URL);
}

export async function createTestimonial(form) {
  return api.upload(BASE_URL, buildFormData(form));
}

export async function updateTestimonial(id, form) {
  return api.upload(`${BASE_URL}/${id}`, buildFormData(form), "PUT");
}

export async function deleteTestimonial(id) {
  return api.delete(`${BASE_URL}/${id}`);
}