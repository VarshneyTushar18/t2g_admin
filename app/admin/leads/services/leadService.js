const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const API = `${API_BASE}/api/leads`;

export async function getLeads() {
  const res = await fetch(API, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch leads");
  return res.json();
}

export async function updateLead(id, form) {
  const res = await fetch(`${API}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({
      name: form.name?.trim(),
      email: form.email?.trim(),
      country: form.country?.trim(),
      phone: form.phone?.trim(),
      message: form.message?.trim(),
      form_type: form.form_type?.trim(),
      source_page: form.source_page?.trim()
    }),
  });
  if (!res.ok) throw new Error("Update failed");
  return res.json();
}

export async function deleteLead(id) {
  const res = await fetch(`${API}/${id}`, { 
    method: "DELETE", 
    credentials: "include" 
  });
  if (!res.ok) throw new Error("Delete failed");
  return res.json();
}
