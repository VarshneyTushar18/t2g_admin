const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API = `${API_BASE}/api/testimonials`;

export async function getTestimonials() {
  const res = await fetch(API, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch testimonials");
  return res.json();
}

export async function createTestimonial(form) {
  const data = new FormData();
  data.append("name",        form.name        || "");
  data.append("stars",       form.stars       || 5);
  data.append("text",        form.text        || "");
  data.append("position",    form.position    || "");   // ✅ added
  data.append("companyName", form.companyName || "");
  data.append("link",        form.link        || "");
  data.append("status",      form.is_active ? 1 : 0);  // ✅ unified is_active → status

  // ✅ Only append files, not null/string values
  if (form.avatar instanceof File)      data.append("avatar",      form.avatar);
  if (form.companyLogo instanceof File) data.append("companyLogo", form.companyLogo);

  const res = await fetch(API, {
    method:      "POST",
    credentials: "include",
    body:        data,
  });

  if (!res.ok) throw new Error("Failed to create testimonial");
  return res.json();
}

export async function updateTestimonial(id, form) {
  const data = new FormData();
  data.append("name",        form.name        || "");
  data.append("stars",       form.stars       || 5);
  data.append("text",        form.text        || "");
  data.append("position",    form.position    || "");   // ✅ added
  data.append("companyName", form.companyName || "");
  data.append("link",        form.link        || "");
  data.append("status",      form.is_active ? 1 : 0);  // ✅ unified is_active → status

  // ✅ Only append files, not null/string values
  if (form.avatar instanceof File)      data.append("avatar",      form.avatar);
  if (form.companyLogo instanceof File) data.append("companyLogo", form.companyLogo);

  const res = await fetch(`${API}/${id}`, {
    method:      "PUT",
    credentials: "include",
    body:        data,
  });

  if (!res.ok) throw new Error("Failed to update testimonial");
  return res.json();
}

export async function deleteTestimonial(id) {
  const res = await fetch(`${API}/${id}`, {
    method:      "DELETE",
    credentials: "include",
  });

  if (!res.ok) throw new Error("Failed to delete testimonial");
  return res.json();
}