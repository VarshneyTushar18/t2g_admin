import { api } from "@/lib/api";

const BASE = "/api/agents/automations";

export async function getSettings() {
  const data = await api.get(`${BASE}/settings`);
  return data.settings;
}

export async function saveSettings(payload) {
  const data = await api.put(`${BASE}/settings`, payload);
  return data.settings;
}

export async function listTopics() {
  const data = await api.get(`${BASE}/topics`);
  return data.topics || [];
}

export async function createTopic(payload) {
  const data = await api.post(`${BASE}/topics`, payload);
  return data.topic;
}

export async function updateTopic(id, payload) {
  const data = await api.put(`${BASE}/topics/${id}`, payload);
  return data.topic;
}

export async function deleteTopic(id) {
  return api.delete(`${BASE}/topics/${id}`);
}

export async function runNow() {
  const data = await api.post(`${BASE}/run-now`, {});
  return data.result;
}

export async function sendTestEmail(approval_emails) {
  return api.post(`${BASE}/test-email`, { approval_emails });
}
