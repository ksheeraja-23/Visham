import api from "../api/axios";

export const uploadEvidence = async (
  file,
  evidence,
  onUploadProgress
) => {
  const formData = new FormData();

  formData.append("case_id", evidence.case_id);
  formData.append("title", evidence.title);
  formData.append("description", evidence.description);
  formData.append("evidence_type", evidence.evidence_type);
  formData.append("uploaded_by", evidence.uploaded_by);

  formData.append("file", file);

  const response = await api.post("/evidence/", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
    onUploadProgress: (progressEvent) => {
      if (progressEvent.total && onUploadProgress) {
        const percent = Math.round(
          (progressEvent.loaded * 100) /
            progressEvent.total
        );

        onUploadProgress(percent);
      }
    },
  });

  return response.data;
};

export const getEvidence = async () => {
  const response = await api.get("/evidence/");
  return response.data;
};

export const getEvidenceByCase = async (caseId) => {
  const response = await api.get(
    `/evidence/case/${caseId}`
  );

  return response.data;
};