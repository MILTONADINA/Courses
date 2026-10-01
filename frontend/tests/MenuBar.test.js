/**
 * Feature 1 — User Authentication & Authorization
 * Spec: features/feature-1-user-authentication-authorization.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import MenuBar from "../src/components/MenuBar.vue";
import AuthServices from "../src/services/authServices.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/authServices.js", () => ({
  default: { registerUser: vi.fn(), loginUser: vi.fn(), logoutUser: vi.fn() },
}));

beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

describe("Feature 1 — User Authentication & Authorization", () => {
  describe("US-1.4 — Log out", () => {
    it("User logs out successfully", async () => {
      localStorage.setItem("user", JSON.stringify({ userId: 1, role: "student", token: "session-token" }));
      AuthServices.logoutUser.mockResolvedValue({ status: 200, data: { message: "Signed out successfully." } });
      const shell = { components: { MenuBar }, template: "<v-app><MenuBar /></v-app>" };
      const { wrapper, router } = await mountWithPlugins(shell);
      const loggedOut = vi.fn();
      window.addEventListener("user-logged-out", loggedOut);
      expect(wrapper.text()).toContain("Sign out");
      await wrapper.find('[data-testid="sign-out"]').trigger("click");
      await flushPromises();
      window.removeEventListener("user-logged-out", loggedOut);
      expect(AuthServices.logoutUser).toHaveBeenCalledOnce();
      expect(loggedOut).toHaveBeenCalledOnce();
      expect(localStorage.getItem("user")).toBeNull();
      expect(router.currentRoute.value.name).toBe("login");
      expect(wrapper.text()).not.toContain("Sign out");
    });

    it("Sign out shows an error when it fails", async () => {
      const user = { userId: 1, role: "student", token: "session-token" };
      localStorage.setItem("user", JSON.stringify(user));
      AuthServices.logoutUser.mockRejectedValue({ response: { status: 503, data: { message: "Service unavailable." } } });
      const shell = { components: { MenuBar }, template: "<v-app><MenuBar /></v-app>" };
      const { wrapper } = await mountWithPlugins(shell);
      await wrapper.find('[data-testid="sign-out"]').trigger("click");
      await flushPromises();
      expect(wrapper.find(".v-alert").text()).toContain("Service unavailable.");
      expect(JSON.parse(localStorage.getItem("user"))).toEqual(user);
      expect(wrapper.text()).toContain("Sign out");
    });

    it("Sign out shows a fallback error when the API gives no message", async () => {
      localStorage.setItem("user", JSON.stringify({ userId: 1, role: "student", token: "session-token" }));
      AuthServices.logoutUser.mockRejectedValue(new Error("Network Error"));
      const shell = { components: { MenuBar }, template: "<v-app><MenuBar /></v-app>" };
      const { wrapper } = await mountWithPlugins(shell);
      await wrapper.find('[data-testid="sign-out"]').trigger("click");
      await flushPromises();
      expect(wrapper.find(".v-alert").text()).toContain("Logout failed.");
    });
  });
});
