const BASE_URL = `${process.env.NEXT_PUBLIC_API_URL}/api/leads`;

export async function getLeads() {
  const res = await fetch(BASE_URL, { credentials: "include" });
  if (!res.ok) throw new Error("Failed to fetch leads");
  return res.json();
}

export async function deleteLead(id) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "DELETE",
    credentials: "include",
  });
  if (!res.ok) throw new Error("Delete failed");
}

export async function updateLead(id, payload) {
  const res = await fetch(`${BASE_URL}/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("Update failed");
}