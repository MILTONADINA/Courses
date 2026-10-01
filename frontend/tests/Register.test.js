/**
 * Feature 1 — User Authentication & Authorization
 * Spec: features/feature-1-user-authentication-authorization.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Register from "../src/views/Register.vue";
import AuthServices from "../src/services/authServices.js";
import { mountWithPlugins, createTestRouter } from "./testUtils.js";

vi.mock("../src/services/authServices.js", () => ({
  default: { registerUser: vi.fn(), loginUser: vi.fn(), logoutUser: vi.fn() },
}));

const valid = {
  firstName: "Jane", lastName: "Doe", email: "jane@example.com",
  universityId: "123456", userName: "jdoe", password: "password123",
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

const mountRegister = async () => mountWithPlugins(Register, { router: await createTestRouter("/register") });

beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });

describe("Feature 1 — User Authentication & Authorization", () => {
  describe("US-1.1 — Register an account", () => {
    it("User registers successfully", async () => {
      AuthServices.registerUser.mockResolvedValue({ status: 201, data: { id: 1, ...valid, role: "student" } });
      const { wrapper, router } = await mountRegister();
      expect(wrapper.findAll("label").map((label) => label.text().toLowerCase())).not.toContain("role");
      expect(wrapper.find(".v-select").exists()).toBe(false);
      await fill(wrapper);
      await submit(wrapper);
      expect(AuthServices.registerUser).toHaveBeenCalledWith(valid);
      expect(localStorage.getItem("user")).toBeNull();
      expect(router.currentRoute.value.name).toBe("login");
    });

    it("User registers without a required field", async () => {
      for (const field of Object.keys(valid)) {
        const { wrapper } = await mountRegister();
        await fill(wrapper, { ...valid, [field]: "" });
        await submit(wrapper);
        expect(wrapper.find(".v-alert").exists()).toBe(true);
        expect(AuthServices.registerUser).not.toHaveBeenCalled();
      }
    });

    it("User submits whitespace-only required information", async () => {
      for (const field of Object.keys(valid)) {
        const { wrapper } = await mountRegister();
        await fill(wrapper, { ...valid, [field]: "   " });
        await submit(wrapper);
        expect(wrapper.find(".v-alert").exists()).toBe(true);
        expect(AuthServices.registerUser).not.toHaveBeenCalled();
      }
    });

    it("User submits a password shorter than 8 characters", async () => {
      const { wrapper } = await mountRegister();
      await fill(wrapper, { ...valid, password: "short" });
      await submit(wrapper);
      expect(wrapper.text()).toContain("Password must be at least 8 characters.");
      expect(AuthServices.registerUser).not.toHaveBeenCalled();
    });

    it("Register page shows the API error when registration fails", async () => {
      AuthServices.registerUser.mockRejectedValue({ response: { status: 400, data: { message: "Username is already taken." } } });
      const { wrapper, router } = await mountRegister();
      await fill(wrapper);
      await submit(wrapper);
      expect(wrapper.find(".v-alert").text()).toContain("Username is already taken.");
      expect(router.currentRoute.value.name).toBe("register");
    });

    it("Register button shows a loading state while registering", async () => {
      AuthServices.registerUser.mockReturnValue(new Promise(() => {}));
      const { wrapper } = await mountRegister();
      await fill(wrapper);
      await submit(wrapper);
      expect(wrapper.find('button[type="submit"]').classes()).toContain("v-btn--loading");
    });

    it("Register page shows a fallback error when the API gives no message", async () => {
      AuthServices.registerUser.mockRejectedValue(new Error("Network Error"));
      const { wrapper } = await mountRegister();
      await fill(wrapper);
      await submit(wrapper);
      expect(wrapper.find(".v-alert").text()).toContain("Registration failed.");
    });
  });
});
