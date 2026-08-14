import { api } from "@/lib/api";

export async function listApiKeys() {
  const res = await api.get("/api/connect/keys");
  return res.data || [];
}

export async function createApiKey({ name, modules, readOnly }) {
  return api.post("/api/connect/keys", { name, modules, readOnly });
}

export async function revokeApiKey(id) {
  return api.delete(`/api/connect/keys/${id}`);
}
