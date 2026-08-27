import { api } from "@/lib/api";

const BASE = "/api/career/admin/approvals";

export async function getApprovalDashboard() {
  return api.get(BASE);
}

export async function getApprovalSettings() {
  return api.get(`${BASE}/settings`);
}

export async function saveApprovalSettings(payload) {
  return api.put(`${BASE}/settings`, payload);
}

export async function sendTestApprovalEmail(approval_emails) {
  return api.post(`${BASE}/test-email`, { approval_emails });
}

export async function resendJobApproval(jobId) {
  return api.post(`${BASE}/${jobId}/resend`, {});
}
