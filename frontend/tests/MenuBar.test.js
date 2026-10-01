/**
 * Feature 1 — User Authentication & Authorization
 * Spec: features/feature-1-user-authentication.md
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
      expect(wrapper.text()).toContain("Sign out");
      await wrapper.find('[data-testid="sign-out"]').trigger("click");
      await flushPromises();
      expect(AuthServices.logoutUser).toHaveBeenCalledOnce();
      expect(localStorage.getItem("user")).toBeNull();
      expect(router.currentRoute.value.name).toBe("login");
      expect(wrapper.text()).not.toContain("Sign out");
    });
  });
});
