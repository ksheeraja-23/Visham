import api from "../services/api";

export const getMySettings = async () => {
  const res = await api.get("/settings/me");
  return res.data;
};

export const saveMySettings = async (payload) => {
  const res = await api.post("/settings/me", payload);
  return res.data;
};
