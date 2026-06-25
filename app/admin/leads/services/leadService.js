import { api } from "@/lib/api";

const BASE_URL = "/api/leads";
const SHOPIFY_URL = "/api/leads/shopify-intake";

export async function getLeads({
  page = 1,
  limit = 10,
  search = "",
  form_type = "",
  source_site = "",
  date_from = "",
  date_to = "",
} = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search.trim()) params.set("search", search.trim());
  if (form_type) params.set("form_type", form_type);
  if (source_site) params.set("source_site", source_site);
  if (date_from) params.set("date_from", date_from);
  if (date_to) params.set("date_to", date_to);
  return api.get(`${BASE_URL}?${params.toString()}`);
}

export async function getShopifyIntakes({
  page = 1,
  limit = 10,
  search = "",
  date_from = "",
  date_to = "",
} = {}) {
  const params = new URLSearchParams();
  params.set("page", String(page));
  params.set("limit", String(limit));
  if (search.trim()) params.set("search", search.trim());
  if (date_from) params.set("date_from", date_from);
  if (date_to) params.set("date_to", date_to);
  return api.get(`${SHOPIFY_URL}?${params.toString()}`);
}

export async function deleteLead(id) {
  return api.delete(`${BASE_URL}/${id}`);
}

export async function deleteShopifyIntake(id) {
  return api.delete(`${SHOPIFY_URL}/${id}`);
}

export async function exportLeadsCsv({
  search = "",
  form_type = "",
  source_site = "",
  date_from = "",
  date_to = "",
} = {}) {
  const params = new URLSearchParams();
  if (search.trim()) params.set("search", search.trim());
  if (form_type) params.set("form_type", form_type);
  if (source_site) params.set("source_site", source_site);
  if (date_from) params.set("date_from", date_from);
  if (date_to) params.set("date_to", date_to);

  const res = await fetch(`${BASE_URL}/export?${params.toString()}`, {
    credentials: "include",
  });

  if (!res.ok) {
    let message = "Export failed";
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      /* csv error body */
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `leads-export-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

export async function exportShopifyIntakesCsv({
  search = "",
  date_from = "",
  date_to = "",
} = {}) {
  const params = new URLSearchParams();
  if (search.trim()) params.set("search", search.trim());
  if (date_from) params.set("date_from", date_from);
  if (date_to) params.set("date_to", date_to);

  const res = await fetch(`${SHOPIFY_URL}/export?${params.toString()}`, {
    credentials: "include",
  });

  if (!res.ok) {
    let message = "Export failed";
    try {
      const data = await res.json();
      message = data.message || message;
    } catch {
      /* csv error body */
    }
    throw new Error(message);
  }

  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `shopify-intake-export-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
