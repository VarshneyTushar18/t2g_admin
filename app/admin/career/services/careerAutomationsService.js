import { api } from "@/lib/api";

const BASE = "/api/career/admin/automations";

export async function getDashboard() {
  return api.get(BASE);
}

export async function saveSettings(payload) {
  return api.put(`${BASE}/settings`, payload);
}

export async function listTopics() {
  const data = await api.get(`${BASE}/topics`);
  return data.topics || [];
}

export async function createTopic(payload) {
  return api.post(`${BASE}/topics`, payload);
}

export async function deleteTopic(id) {
  return api.delete(`${BASE}/topics/${id}`);
}

export async function runNow() {
  return api.post(`${BASE}/run-now`, {});
}

export async function sendTestScheduleEmail() {
  return api.post(`${BASE}/test-schedule-email`, {});
}
