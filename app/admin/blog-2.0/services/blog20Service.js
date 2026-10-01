import { api } from "@/lib/api";

const BASE = "/api/blog-2.0";
const AGENT = "/api/blog-2.0/agent";

export async function getOverview() {
  return api.get(`${BASE}/overview`);
}

export async function getChecklist() {
  return api.get(`${BASE}/checklist`);
}

export async function getSettings() {
  const data = await api.get(`${BASE}/settings`);
  return data.settings;
}

export async function saveSettings(payload) {
  const data = await api.put(`${BASE}/settings`, payload);
  return data.settings;
}

export async function testMailerLite(payload = {}) {
  return api.post(`${BASE}/mailerlite/test`, payload);
}

export async function testMailerLiteBot() {
  return api.post(`${BASE}/mailerlite/bot/test`, {});
}

export async function getMailerLiteBotStatus() {
  return api.get(`${BASE}/mailerlite/bot/status`);
}

export async function submitMailerLiteBotOtp(code) {
  return api.post(`${BASE}/mailerlite/bot/otp`, { code });
}

export async function listDrafts() {
  const data = await api.get(`${BASE}/drafts`);
  return data.drafts || [];
}

export async function getDraft(id) {
  const data = await api.get(`${BASE}/drafts/${id}`);
  return data.draft;
}

export async function deleteDraft(id) {
  return api.delete(`${BASE}/drafts/${id}`);
}

export async function deleteDraftsBulk(ids) {
  return api.post(`${BASE}/drafts/bulk-delete`, { ids });
}

export async function pushDraftToMailerLite(id, { publishLive = false } = {}) {
  return api.post(`${BASE}/drafts/${id}/push-mailerlite`, {
    publish_live: publishLive,
  });
}

export async function testApprovalEmail(payload = {}) {
  return api.post(`${BASE}/approvals/test-email`, payload);
}

export async function requestDraftApproval(id) {
  return api.post(`${BASE}/drafts/${id}/request-approval`, {});
}

export async function getAgentStatus() {
  return api.get(`${AGENT}/status`);
}

export async function listThreads() {
  const data = await api.get(`${AGENT}/threads`);
  return data.threads || [];
}

export async function createThread(title = null) {
  const data = await api.post(`${AGENT}/threads`, title ? { title } : {});
  return data.thread;
}

export async function deleteThread(threadId) {
  return api.delete(`${AGENT}/threads/${threadId}`);
}

export async function getMessages(threadId) {
  const data = await api.get(`${AGENT}/threads/${threadId}/messages`);
  return data.messages || [];
}

export async function sendMessage(threadId, message) {
  return api.post(`${AGENT}/threads/${threadId}/messages`, { message });
}
