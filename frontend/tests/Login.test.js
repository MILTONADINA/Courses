/**
 * Feature 1 — User Authentication & Authorization
 * Spec: features/feature-1-user-authentication.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Login from "../src/views/Login.vue";
import AuthServices from "../src/services/authServices.js";
import { mountWithPlugins, createTestRouter } from "./testUtils.js";

vi.mock("../src/services/authServices.js", () => ({
  default: { registerUser: vi.fn(), loginUser: vi.fn(), logoutUser: vi.fn() },
}));

beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

describe("Feature 1 — User Authentication & Authorization", () => {
  describe("US-1.2 — Log in", () => {
    it("User logs in successfully", async () => {
      const user = { userId: 1, userName: "jdoe", firstName: "Jane", lastName: "Doe", role: "student", token: "session-token" };
      AuthServices.loginUser.mockResolvedValue({ data: user });
      const { wrapper, router } = await mountWithPlugins(Login, { router: await createTestRouter("/login") });
      await wrapper.find('[data-testid="userName"] input').setValue("jdoe");
      await wrapper.find('[data-testid="password"] input').setValue("password123");
      await wrapper.find("form").trigger("submit");
      await flushPromises();
      expect(AuthServices.loginUser).toHaveBeenCalledWith({ userName: "jdoe", password: "password123" });
      expect(JSON.parse(localStorage.getItem("user"))).toEqual(user);
      expect(router.currentRoute.value.name).toBe("home");
    });

    it("User cannot log in with incorrect information", async () => {
      AuthServices.loginUser.mockRejectedValue({ response: { status: 401, data: { message: "Invalid username or password." } } });
      const { wrapper, router } = await mountWithPlugins(Login, { router: await createTestRouter("/login") });
      await wrapper.find('[data-testid="userName"] input').setValue("jdoe");
      await wrapper.find('[data-testid="password"] input').setValue("wrong-password");
      await wrapper.find("form").trigger("submit");
      await flushPromises();
      expect(wrapper.text()).toContain("Invalid username or password.");
      expect(localStorage.getItem("user")).toBeNull();
      expect(router.currentRoute.value.name).not.toBe("home");
    });
  });
});
