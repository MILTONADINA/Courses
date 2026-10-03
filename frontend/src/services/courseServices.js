import apiClient from "./services.js";

export default {
  listCourses() { return apiClient.get("courses"); },
  createCourse(data) { return apiClient.post("courses", data); },
  updateCourse(id, data) { return apiClient.put(`courses/${id}`, data); },
  deleteCourse(id) { return apiClient.delete(`courses/${id}`); },
};
