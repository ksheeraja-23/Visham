import api from "../api/axios";

export async function askAI(question) {
  const { data } = await api.post("/ai/chat", { question });
  return data;
}

export async function caseChat(caseId, question) {
  const { data } = await api.post(`/ai/case/${caseId}/chat`, { question });
  return data;
}

export async function summarizeCase(caseId) {
  const { data } = await api.post(`/ai/case/${caseId}/summarize`);
  return data;
}

export async function detectContradictions(caseId) {
  const { data } = await api.post(`/ai/case/${caseId}/contradictions`);
  return data;
}

export async function riskAnalysis(caseId) {
  const { data } = await api.post(`/ai/case/${caseId}/risk-analysis`);
  return data;
}

export async function generateReport(caseId) {
  const { data } = await api.post(`/ai/case/${caseId}/report`);
  return data;
}

export async function exportCasePdf(caseId) {
  const response = await api.get(`/ai/case/${caseId}/export-pdf`, {
    responseType: "blob",
  });
  return response.data;
}

export async function exportCaseDocx(caseId) {
  const response = await api.get(`/ai/case/${caseId}/export-docx`, {
    responseType: "blob",
  });
  return response.data;
}

export default api;
