import apiClient from "./services.js";

export default {
  registerUser(data) { return apiClient.post("register", data); },
  loginUser(data) { return apiClient.post("login", data); },
  logoutUser() { return apiClient.post("logout"); },
};
