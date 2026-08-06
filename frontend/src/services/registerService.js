import api from "./api";

export const register = async (user) => {
  const { data } = await api.post("/users/register", user);
  return data;
};