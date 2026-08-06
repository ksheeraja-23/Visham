import api from "./api";

export const getMyProfile = async () => {
  const { data } = await api.get("/users/me");
  return data;
};

export const updateMyProfile = async (payload) => {
  const { data } = await api.put("/users/me", payload);
  return data;
};

export const changeMyPassword = async (payload) => {
  const { data } = await api.post("/users/change-password", payload);
  return data;
};

export const logoutAllDevices = async () => {
  const { data } = await api.post("/users/logout-all");
  return data;
};
