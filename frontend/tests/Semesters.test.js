/**
 * Feature 2 — Semester Management
 * Spec: features/feature-2-semester-management.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Semesters from "../src/views/Semesters.vue";
import MenuBar from "../src/components/MenuBar.vue";
import SemesterServices from "../src/services/semesterServices.js";
import router from "../src/router.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/semesterServices.js", () => ({
  default: {
    listSemesters: vi.fn(),
    createSemester: vi.fn(),
    updateSemester: vi.fn(),
    deleteSemester: vi.fn(),
  },
}));

const fall = {
  id: 1,
  semsterName: "Fall 2026",
  startDate: "2026-08-17",
  endDate: "2026-12-11",
};

function signIn(role) {
  localStorage.setItem("user", JSON.stringify({ token: `${role}-token`, role }));
}

async function mountPage() {
  const Page = { components: { Semesters }, template: "<v-app><Semesters /></v-app>" };
  const mounted = await mountWithPlugins(Page);
  await flushPromises();
  return mounted;
}

function control(wrapper, label) {
  const matches = [...wrapper.findAll("button"), ...wrapper.findAll("a")].filter((item) => item.text().includes(label));
  return matches.at(-1);
}

async function fill(wrapper, name, value) {
  const wrapped = wrapper.findAll(`[data-testid="${name}"] input`);
  const input = wrapped.length
    ? wrapped.at(-1).element
    : [...document.querySelectorAll(`[data-testid="${name}"] input`)].at(-1);
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  await flushPromises();
}

async function clickLabeled(wrapper, label) {
  const wrapped = control(wrapper, label);
  if (wrapped) {
    await wrapped.trigger("click");
  } else {
    const node = [...document.querySelectorAll("button, a")].filter((item) => item.textContent.includes(label)).at(-1);
    node.click();
  }
  await flushPromises();
}

beforeEach(async () => {
  document.body.querySelectorAll(".v-overlay-container, .v-overlay").forEach((node) => node.remove());
  localStorage.clear();
  vi.clearAllMocks();
  SemesterServices.listSemesters.mockResolvedValue({ data: [fall] });
  await router.push({ name: "login" });
  await router.isReady();
});

describe("Feature 2 — Semester Management", () => {
  describe("US-2.1 — Create a semester", () => {
    it("Admin creates a semester from the Semesters page", async () => {
      signIn("admin");
      SemesterServices.listSemesters
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValue({ data: [fall] });
      SemesterServices.createSemester.mockResolvedValue({ data: fall });
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Add semester");
      await fill(wrapper, "semsterName", "Fall 2026");
      await fill(wrapper, "startDate", "2026-08-17");
      await fill(wrapper, "endDate", "2026-12-11");
      await clickLabeled(wrapper, "Save");

      expect(SemesterServices.createSemester).toHaveBeenCalledWith({
        semsterName: "Fall 2026",
        startDate: "2026-08-17",
        endDate: "2026-12-11",
      });
      expect(document.querySelector(".v-overlay--active")).toBeNull();
      expect(wrapper.text()).toContain("Fall 2026");
    });

    it("Semester form blocks submit when a required field is empty", async () => {
      signIn("admin");
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Add semester");
      await clickLabeled(wrapper, "Save");

      expect(document.body.textContent).toContain("Semester name is required.");
      expect(SemesterServices.createSemester).not.toHaveBeenCalled();
      expect(SemesterServices.updateSemester).not.toHaveBeenCalled();
    });

    it("Save shows a loading state while saving", async () => {
      signIn("admin");
      SemesterServices.createSemester.mockReturnValue(new Promise(() => {}));
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Add semester");
      await fill(wrapper, "semsterName", "Fall 2026");
      await fill(wrapper, "startDate", "2026-08-17");
      await fill(wrapper, "endDate", "2026-12-11");
      const save = [...document.querySelectorAll('[data-testid="save-semester"]')].at(-1);
      save.click();
      await flushPromises();

      expect(save.classList.contains("v-btn--loading")).toBe(true);
    });

    it("Semesters page shows the API error when a save fails", async () => {
      signIn("admin");
      SemesterServices.createSemester.mockRejectedValue({
        response: { data: { message: "Semester could not be created." } },
      });
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Add semester");
      await fill(wrapper, "semsterName", "Fall 2026");
      await fill(wrapper, "startDate", "2026-08-17");
      await fill(wrapper, "endDate", "2026-12-11");
      await clickLabeled(wrapper, "Save");

      expect(document.body.textContent).toContain("Semester could not be created.");
    });

    it("Semesters page shows a fallback error when a save fails without a message", async () => {
      signIn("admin");
      SemesterServices.createSemester.mockRejectedValue(new Error("Network Error"));
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Add semester");
      await fill(wrapper, "semsterName", "Fall 2026");
      await fill(wrapper, "startDate", "2026-08-17");
      await fill(wrapper, "endDate", "2026-12-11");
      await clickLabeled(wrapper, "Save");

      expect(document.body.textContent).toContain("Semester could not be saved.");
    });
  });

  describe("US-2.2 — View semesters", () => {
    it("Semesters page shows a loading state", async () => {
      signIn("admin");
      SemesterServices.listSemesters.mockReturnValue(new Promise(() => {}));
      const { wrapper } = await mountPage();

      expect(wrapper.text()).toContain("Loading semesters...");
    });

    it("Semesters page shows a message when no semesters exist", async () => {
      signIn("admin");
      SemesterServices.listSemesters.mockResolvedValue({ data: [] });
      const { wrapper } = await mountPage();

      expect(wrapper.text()).toContain("No semesters found.");
    });

    it("Semesters page shows the API error when the list fails", async () => {
      signIn("admin");
      SemesterServices.listSemesters.mockRejectedValue({
        response: { data: { message: "Semesters are unavailable." } },
      });
      const { wrapper } = await mountPage();

      expect(wrapper.text()).toContain("Semesters are unavailable.");
      expect(wrapper.text()).not.toContain("No semesters found.");
    });

    it("Semesters page shows a fallback error when the API gives no message", async () => {
      signIn("admin");
      SemesterServices.listSemesters.mockRejectedValue(new Error("Network Error"));
      const { wrapper } = await mountPage();

      expect(wrapper.text()).toContain("Semesters could not be loaded.");
      expect(wrapper.text()).not.toContain("No semesters found.");
    });

    it("Signed-in user sees the Semesters link", async () => {
      signIn("student");
      const shell = { components: { MenuBar }, template: "<v-app><MenuBar /></v-app>" };
      const { wrapper } = await mountWithPlugins(shell);

      const link = wrapper.findAll("a").find((item) => item.text() === "Semesters");
      expect(link).toBeTruthy();
      expect(link.attributes("href")).toBe("/semesters");
    });

    it("Signed-out user is sent to Login", async () => {
      await router.push({ name: "semesters" });
      expect(router.currentRoute.value.name).toBe("login");
    });
  });

  describe("US-2.3 — Update a semester", () => {
    it("Admin edits a semester from the Semesters page", async () => {
      signIn("admin");
      SemesterServices.updateSemester.mockResolvedValue({ data: {} });
      SemesterServices.listSemesters
        .mockResolvedValueOnce({ data: [fall] })
        .mockResolvedValue({
          data: [{ ...fall, semsterName: "Spring 2027", startDate: "2027-01-11", endDate: "2027-05-07" }],
        });
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Edit");
      await fill(wrapper, "semsterName", "Spring 2027");
      await clickLabeled(wrapper, "Save");

      expect(SemesterServices.updateSemester).toHaveBeenCalledWith(1, {
        semsterName: "Spring 2027",
        startDate: "2026-08-17",
        endDate: "2026-12-11",
      });
      expect(document.querySelector(".v-overlay--active")).toBeNull();
      expect(wrapper.text()).toContain("Spring 2027");
    });
  });

  describe("US-2.4 — Delete a semester", () => {
    it("Admin deletes a semester from the Semesters page", async () => {
      signIn("admin");
      SemesterServices.deleteSemester.mockResolvedValue({ data: { message: "Semester deleted successfully." } });
      SemesterServices.listSemesters
        .mockResolvedValueOnce({ data: [fall] })
        .mockResolvedValue({ data: [] });
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Delete");

      expect(SemesterServices.deleteSemester).toHaveBeenCalledWith(1);
      expect(wrapper.text()).not.toContain("Fall 2026");
      expect(wrapper.text()).toContain("No semesters found.");
    });

    it("Semesters page shows the API error when a delete fails", async () => {
      signIn("admin");
      SemesterServices.deleteSemester.mockRejectedValue({
        response: { data: { message: "Semester could not be removed." } },
      });
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Delete");

      expect(wrapper.text()).toContain("Semester could not be removed.");
      expect(wrapper.text()).toContain("Fall 2026");
    });

    it("Semesters page shows a fallback error when a delete fails without a message", async () => {
      signIn("admin");
      SemesterServices.deleteSemester.mockRejectedValue(new Error("Network Error"));
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Delete");

      expect(wrapper.text()).toContain("Semester could not be deleted.");
      expect(wrapper.text()).toContain("Fall 2026");
    });
  });

  describe("US-2.5 — Restrict semester changes to admins", () => {
    it("Admin sees semester change actions", async () => {
      signIn("admin");
      const { wrapper } = await mountPage();

      expect(wrapper.find('[data-testid="create-semester"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="edit-semester"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="delete-semester"]').exists()).toBe(true);
    });

    it("Student does not see semester change actions", async () => {
      signIn("student");
      const { wrapper } = await mountPage();

      expect(wrapper.text()).toContain("Fall 2026");
      expect(wrapper.find('[data-testid="create-semester"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="edit-semester"]').exists()).toBe(false);
      expect(wrapper.find('[data-testid="delete-semester"]').exists()).toBe(false);
    });
  });
});
