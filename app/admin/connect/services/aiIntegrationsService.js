import { api } from "@/lib/api";

const BASE = "/api/agents/ai-integrations";

export async function getAiSettings() {
  const data = await api.get(`${BASE}/settings`);
  return data.settings;
}

export async function saveAiSettings(payload) {
  const data = await api.put(`${BASE}/settings`, payload);
  return data.settings;
}

export async function testAiSettings() {
  return api.post(`${BASE}/test`, {});
}
