/**
 * Feature 1 — User Authentication & Authorization
 * Spec: features/feature-1-user-authentication-authorization.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Login from "../src/views/Login.vue";
import AuthServices from "../src/services/authServices.js";
import { mountWithPlugins, createTestRouter } from "./testUtils.js";

vi.mock("../src/services/authServices.js", () => ({
  default: { registerUser: vi.fn(), loginUser: vi.fn(), logoutUser: vi.fn() },
}));

const studentUser = { userId: 1, userName: "jdoe", firstName: "Jane", lastName: "Doe", role: "student", token: "session-token" };

async function submitLogin(userName = "jdoe", password = "password123") {
  const { wrapper, router } = await mountWithPlugins(Login, { router: await createTestRouter("/login") });
  await wrapper.find('[data-testid="userName"] input').setValue(userName);
  await wrapper.find('[data-testid="password"] input').setValue(password);
  await wrapper.find("form").trigger("submit");
  await flushPromises();
  return { wrapper, router };
}

beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

describe("Feature 1 — User Authentication & Authorization", () => {
  describe("US-1.2 — Log in", () => {
    it("User logs in successfully", async () => {
      AuthServices.loginUser.mockResolvedValue({ data: studentUser });
      const loggedIn = vi.fn();
      window.addEventListener("user-logged-in", loggedIn);
      const { router } = await submitLogin();
      window.removeEventListener("user-logged-in", loggedIn);
      expect(AuthServices.loginUser).toHaveBeenCalledWith({ userName: "jdoe", password: "password123" });
      expect(JSON.parse(localStorage.getItem("user"))).toEqual(studentUser);
      expect(loggedIn).toHaveBeenCalledOnce();
      expect(router.currentRoute.value.name).toBe("home");
    });

    it("User cannot log in with incorrect information", async () => {
      AuthServices.loginUser.mockRejectedValue({ response: { status: 401, data: { message: "Invalid username or password." } } });
      const { wrapper, router } = await submitLogin("jdoe", "wrong-password");
      expect(wrapper.text()).toContain("Invalid username or password.");
      expect(localStorage.getItem("user")).toBeNull();
      expect(router.currentRoute.value.name).not.toBe("home");
    });

    it("Sign in button shows a loading state while signing in", async () => {
      AuthServices.loginUser.mockReturnValue(new Promise(() => {}));
      const { wrapper } = await submitLogin();
      expect(wrapper.find('button[type="submit"]').classes()).toContain("v-btn--loading");
    });

    it("Login page shows a fallback error when the API gives no message", async () => {
      AuthServices.loginUser.mockRejectedValue(new Error("Network Error"));
      const { wrapper } = await submitLogin();
      expect(wrapper.find(".v-alert").text()).toContain("Login failed.");
    });
  });

  describe("US-1.5 — Use the system as my user type", () => {
    it("Admin logs in", async () => {
      AuthServices.loginUser.mockResolvedValue({ data: { ...studentUser, userName: "admin", role: "admin" } });
      const { router } = await submitLogin("admin", "admin-password");
      expect(JSON.parse(localStorage.getItem("user")).role).toBe("admin");
      expect(router.currentRoute.value.name).toBe("home");
    });

    it("Student logs in", async () => {
      AuthServices.loginUser.mockResolvedValue({ data: studentUser });
      const { router } = await submitLogin();
      expect(JSON.parse(localStorage.getItem("user")).role).toBe("student");
      expect(router.currentRoute.value.name).toBe("home");
    });
  });
});
