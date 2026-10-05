import apiClient from "./services.js";

export default {
  listSections() { return apiClient.get("sections"); },
  createSection(data) { return apiClient.post("sections", data); },
  updateSection(id, data) { return apiClient.put(`sections/${id}`, data); },
  deleteSection(id) { return apiClient.delete(`sections/${id}`); },
};
