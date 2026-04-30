import { api } from "@/lib/api";

const BASE_URL = "/api/leads";

export async function getLeads() {
  return api.get(BASE_URL);
}

export async function deleteLead(id) {
  return api.delete(`${BASE_URL}/${id}`);
}

export async function updateLead(id, payload) {
  return api.put(`${BASE_URL}/${id}`, payload);
}