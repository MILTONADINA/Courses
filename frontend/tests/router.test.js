/**
 * Feature 1 — User Authentication & Authorization
 * Spec: features/feature-1-user-authentication-authorization.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import router from "../src/router.js";
import apiClient from "../src/services/services.js";

beforeEach(async () => {
  localStorage.clear();
  await router.push({ name: "login" });
  await router.isReady();
});

async function rejectProtectedRequest() {
  await expect(apiClient.get("health", {
    adapter: () => Promise.reject({ response: { status: 401, data: { message: "Unauthorized." } } }),
  })).rejects.toBeDefined();
  await flushPromises();
}

describe("Feature 1 — User Authentication & Authorization", () => {
  describe("US-1.3 — Keep my session active", () => {
    it("Session survives a page refresh", async () => {
      localStorage.setItem("user", JSON.stringify({ token: "valid-session", role: "student" }));
      await router.push({ name: "home" });
      expect(router.currentRoute.value.name).toBe("home");
      await router.push({ name: "login" });
      await router.push({ name: "home" });
      expect(router.currentRoute.value.name).toBe("home");
      expect(localStorage.getItem("user")).not.toBeNull();
    });

    it("Expired session is rejected", async () => {
      localStorage.setItem("user", JSON.stringify({ token: "expired-session", role: "student" }));
      await router.push({ name: "home" });
      const loggedOut = vi.fn();
      window.addEventListener("user-logged-out", loggedOut);
      await rejectProtectedRequest();
      window.removeEventListener("user-logged-out", loggedOut);
      expect(loggedOut).toHaveBeenCalledOnce();
      expect(localStorage.getItem("user")).toBeNull();
      expect(router.currentRoute.value.name).toBe("login");
    });

    it("Invalid session is rejected", async () => {
      localStorage.setItem("user", JSON.stringify({ token: "invalid-session", role: "student" }));
      await router.push({ name: "home" });
      await rejectProtectedRequest();
      expect(localStorage.getItem("user")).toBeNull();
      expect(router.currentRoute.value.name).toBe("login");
    });
  });

  describe("US-1.6 — Restrict users by their user type", () => {
    it("Unauthenticated user cannot access a protected endpoint", async () => {
      await router.push({ name: "home" });
      expect(router.currentRoute.value.name).toBe("login");
    });
  });
});
