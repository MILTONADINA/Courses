import apiClient from "./services.js";

export default {
  listFaculty() { return apiClient.get("faculty"); },
  createFaculty(data) { return apiClient.post("faculty", data); },
  updateFaculty(id, data) { return apiClient.put(`faculty/${id}`, data); },
  deleteFaculty(id) { return apiClient.delete(`faculty/${id}`); },
};
