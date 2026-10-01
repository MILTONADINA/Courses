/**
 * Feature 1 — User Authentication & Authorization
 * Spec: features/feature-1-user-authentication.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Register from "../src/views/Register.vue";
import AuthServices from "../src/services/authServices.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/authServices.js", () => ({
  default: { registerUser: vi.fn(), loginUser: vi.fn(), logoutUser: vi.fn() },
}));

const valid = {
  firstName: "Jane", lastName: "Doe", email: "jane@example.com",
  universityId: "123456", userName: "jdoe",
  password: "password123", confirmPassword: "password123",
};

async function fill(wrapper, values = valid) {
  for (const [field, value] of Object.entries(values)) {
    await wrapper.find(`[data-testid="${field}"] input`).setValue(value);
  }
}

async function submit(wrapper) {
  await wrapper.find("form").trigger("submit");
  await flushPromises();
}

beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

describe("Feature 1 — User Authentication & Authorization", () => {
  describe("US-1.1 — Register an account", () => {
    it("User registers successfully", async () => {
      const user = { userId: 1, ...valid, role: "student", token: "session-token" };
      AuthServices.registerUser.mockResolvedValue({ data: user });
      const { wrapper, router } = await mountWithPlugins(Register);
      expect(wrapper.html()).not.toContain("role selector");
      expect(wrapper.find('[data-testid="role"]').exists()).toBe(false);
      await fill(wrapper);
      await submit(wrapper);
      expect(AuthServices.registerUser).toHaveBeenCalledWith(valid);
      expect(JSON.parse(localStorage.getItem("user"))).toEqual(user);
      expect(router.currentRoute.value.name).toBe("home");
    });

    it("User registers without a required field", async () => {
      for (const field of Object.keys(valid)) {
        const { wrapper } = await mountWithPlugins(Register);
        await fill(wrapper, { ...valid, [field]: "" });
        await submit(wrapper);
        expect(wrapper.find(".v-alert").exists()).toBe(true);
        expect(AuthServices.registerUser).not.toHaveBeenCalled();
      }
    });

    it("User submits whitespace-only required information", async () => {
      for (const field of Object.keys(valid)) {
        const { wrapper } = await mountWithPlugins(Register);
        await fill(wrapper, { ...valid, [field]: "   " });
        await submit(wrapper);
        expect(wrapper.find(".v-alert").exists()).toBe(true);
        expect(AuthServices.registerUser).not.toHaveBeenCalled();
      }
    });

    it("User submits an invalid email", async () => {
      const { wrapper } = await mountWithPlugins(Register);
      await fill(wrapper, { ...valid, email: "bad-email" });
      await submit(wrapper);
      expect(wrapper.text()).toContain("Enter a valid email address.");
      expect(AuthServices.registerUser).not.toHaveBeenCalled();
    });

    it("User submits a password shorter than 8 characters", async () => {
      const { wrapper } = await mountWithPlugins(Register);
      await fill(wrapper, { ...valid, password: "short", confirmPassword: "short" });
      await submit(wrapper);
      expect(wrapper.text()).toContain("Password must be at least 8 characters.");
      expect(AuthServices.registerUser).not.toHaveBeenCalled();
    });

    it("User submits mismatched passwords", async () => {
      const { wrapper } = await mountWithPlugins(Register);
      await fill(wrapper, { ...valid, confirmPassword: "different" });
      await submit(wrapper);
      expect(wrapper.text()).toContain("Passwords do not match.");
      expect(AuthServices.registerUser).not.toHaveBeenCalled();
    });
  });
});
