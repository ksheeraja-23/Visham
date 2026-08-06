import api from "../api/axios";

export const getSuspects = async () => {
  const { data } = await api.get("/suspects/");
  return data;
};

export const getSuspectsByCase = async (caseId) => {
  const { data } = await api.get(`/suspects/case/${caseId}`);
  return data;
};

export const getSuspect = async (id) => {
  const { data } = await api.get(`/suspects/${id}`);
  return data;
};

export const createSuspect = async (body) => {
  const { data } = await api.post("/suspects/", body);
  return data;
};

export const updateSuspect = async (id, body) => {
  const { data } = await api.put(`/suspects/${id}`, body);
  return data;
};

export const deleteSuspect = async (id) => {
  const { data } = await api.delete(`/suspects/${id}`);
  return data;
};
