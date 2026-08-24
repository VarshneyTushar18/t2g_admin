import { api } from "@/lib/api";

const BASE = "/api/agents/career";

export async function getAgentStatus() {
  return api.get(`${BASE}/status`);
}

export async function listThreads() {
  const data = await api.get(`${BASE}/threads`);
  return data.threads || [];
}

export async function createThread(title = null) {
  const data = await api.post(`${BASE}/threads`, title ? { title } : {});
  return data.thread;
}

export async function deleteThread(threadId) {
  return api.delete(`${BASE}/threads/${threadId}`);
}

export async function getMessages(threadId) {
  const data = await api.get(`${BASE}/threads/${threadId}/messages`);
  return data.messages || [];
}

export async function sendMessage(threadId, message) {
  return api.post(`${BASE}/threads/${threadId}/messages`, { message });
}

export async function sendFeedback(threadId, { messageId, rating, comment }) {
  return api.post(`${BASE}/threads/${threadId}/feedback`, {
    messageId,
    rating,
    comment,
  });
}

export async function getGuidelines() {
  const data = await api.get(`${BASE}/guidelines`);
  return data.guidelines;
}

export async function updateGuidelines(content) {
  const data = await api.put(`${BASE}/guidelines`, { content });
  return data.guidelines;
}
