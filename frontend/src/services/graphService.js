import api from "../api/axios";

export const getGraph = async (caseId) => {
  const response = await api.get("/graph", {
    params: {
      case_id: caseId,
    },
  });

  return response.data;
};