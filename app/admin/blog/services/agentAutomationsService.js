import { api } from "@/lib/api";

const BASE = "/api/agents/automations";

export async function getSettings() {
  const data = await api.get(`${BASE}/settings`);
  return {
    settings: data.settings,
    scheduleStatus: data.scheduleStatus || null,
    publicApiConfigured: Boolean(data.publicApiConfigured),
    publicApiBase: data.publicApiBase || null,
  };
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

export async function requeueTopic(id) {
  const data = await api.post(`${BASE}/topics/${id}/requeue`, {});
  return data.topic;
}

export async function runNow() {
  return api.post(`${BASE}/run-now`, {});
}

export async function sendTestEmail(approval_emails) {
  return api.post(`${BASE}/test-email`, { approval_emails });
}

export async function getAgentMemory() {
  const data = await api.get(`${BASE}/agent-memory`);
  return data.guidelines || { content: "" };
}

export async function saveAgentMemory(content) {
  const data = await api.put(`${BASE}/agent-memory`, { content });
  return data.guidelines;
}
