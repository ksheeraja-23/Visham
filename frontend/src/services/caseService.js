import api from "../api/axios";

export const getCases = async () => {
  const { data } = await api.get("/cases");
  return data;
};

export const createCase = async (body) => {
  const { data } = await api.post("/cases/", body);
  return data;
};

export const updateCase = async (id, body) => {
  const { data } = await api.put(`/cases/${id}`, body);
  return data;
};

export const deleteCase = async (id) => {
  const { data } = await api.delete(`/cases/${id}`);
  return data;
};