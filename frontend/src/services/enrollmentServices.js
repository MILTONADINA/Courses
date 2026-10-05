import apiClient from "./services.js";

export default {
  listEnrollments() { return apiClient.get("enrollments"); },
  createEnrollment(data) { return apiClient.post("enrollments", data); },
  updateEnrollment(id, data) { return apiClient.put(`enrollments/${id}`, data); },
  deleteEnrollment(id) { return apiClient.delete(`enrollments/${id}`); },
};
