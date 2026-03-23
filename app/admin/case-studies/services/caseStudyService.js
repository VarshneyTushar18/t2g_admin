const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API = `${API_BASE}/api/case-studies`;

export async function getCaseStudies() {
  const res = await fetch(API);
  return res.json();
}

export async function createCaseStudy(form) {
  const data = new FormData();

  data.append("title", form.title);
  data.append("slug", form.slug);
  data.append("category_id", form.category_id); // ✅ FIXED
  data.append("short_description", form.short_description);
  data.append("content", form.content);
  data.append("featured_image", form.featured_image || "");
  data.append("is_featured", form.is_featured ? 1 : 0);

  const res = await fetch(API, {
    method: "POST",
    body: data,
  });

  return res.json();
}

export async function updateCaseStudy(id, form) {
  const data = new FormData();

  data.append("title", form.title);
  data.append("slug", form.slug);
  data.append("category_id", form.category_id); // ✅ FIXED
  data.append("short_description", form.short_description);
  data.append("content", form.content);
  data.append("featured_image", form.featured_image || "");
  data.append("is_featured", form.is_featured ? 1 : 0);

  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    body: data,
  });

  return res.json();
}

export async function deleteCaseStudy(id) {
  return fetch(`${API}/${id}`, {
    method: "DELETE",
  });
}