const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API = `${API_BASE}/api/testimonials`;

export async function getTestimonials() {
  const res = await fetch(API, { credentials: "include" });
  return res.json();
}

export async function createTestimonial(form) {
  const data = new FormData();
  data.append("name",        form.name);
  data.append("stars",       form.stars);
  data.append("text",        form.text);
  data.append("companyName", form.companyName);
  data.append("link",        form.link || "");
  if (form.avatar)      data.append("avatar",      form.avatar);
  if (form.companyLogo) data.append("companyLogo", form.companyLogo);

  return fetch(API, { method: "POST", credentials: "include", body: data });
}

export async function updateTestimonial(id, form) {
  const data = new FormData();
  data.append("name",        form.name);
  data.append("stars",       form.stars);
  data.append("text",        form.text);
  data.append("companyName", form.companyName);
  data.append("link",        form.link || "");
  data.append("status",      form.status ? 1 : 0);
  if (form.avatar)      data.append("avatar",      form.avatar);
  if (form.companyLogo) data.append("companyLogo", form.companyLogo);

  return fetch(`${API}/${id}`, { method: "PUT", credentials: "include", body: data });
}

export async function deleteTestimonial(id) {
  return fetch(`${API}/${id}`, { method: "DELETE", credentials: "include" });
}