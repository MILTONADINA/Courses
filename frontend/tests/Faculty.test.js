/**
 * Feature 4 — Faculty Management
 * Spec: features/feature-4-faculty-management.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Faculty from "../src/views/Faculty.vue";
import MenuBar from "../src/components/MenuBar.vue";
import FacultyServices from "../src/services/facultyServices.js";
import router from "../src/router.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/facultyServices.js", () => ({
  default: {
    listFaculty: vi.fn(),
    createFaculty: vi.fn(),
    updateFaculty: vi.fn(),
    deleteFaculty: vi.fn(),
  },
}));

const ada = { id: 1, firstName: "Ada", lastName: "Lovelace", dept: "Computer Science" };
const grace = { id: 2, firstName: "Grace", lastName: "Hopper", dept: "Mathematics" };

const requiredFields = [
  ["firstName", "First name is required."],
  ["lastName", "Last name is required."],
  ["dept", "Department is required."],
];

function signIn(role) {
  localStorage.setItem("user", JSON.stringify({ token: `${role}-token`, role }));
}

async function mountPage() {
  const Page = { components: { Faculty }, template: "<v-app><Faculty /></v-app>" };
  const mounted = await mountWithPlugins(Page);
  page = mounted.wrapper;
  await flushPromises();
  return mounted;
}

async function mountMenuBar() {
  const shell = { components: { MenuBar }, template: "<v-app><MenuBar /></v-app>" };
  return mountWithPlugins(shell);
}

function dialogInput(name) {
  return [...document.querySelectorAll(`[data-testid="${name}"] input`)].at(-1);
}

async function fill(name, value) {
  const input = dialogInput(name);
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
  await flushPromises();
}

let page;

async function click(selector) {
  const onPage = page?.findAll(selector) ?? [];
  if (onPage.length) {
    await onPage.at(-1).trigger("click");
  } else {
    [...document.querySelectorAll(selector)].at(-1).click();
  }
  await flushPromises();
}

async function fillAll(values) {
  for (const [name, value] of Object.entries(values)) await fill(name, value);
}

function rows(wrapper) {
  return wrapper.findAll('[data-testid="faculty-row"]').map((row) => row.findAll("td").slice(0, 3).map((cell) => cell.text()));
}

beforeEach(async () => {
  document.body.querySelectorAll(".v-overlay-container, .v-overlay").forEach((node) => node.remove());
  localStorage.clear();
  vi.clearAllMocks();
  page = null;
  FacultyServices.listFaculty.mockResolvedValue({ data: [ada] });
  await router.push({ name: "login" });
  await router.isReady();
});

describe("Feature 4 — Faculty Management", () => {
  describe("US-4.1 — Add a faculty member", () => {
    it("Admin adds a faculty member successfully", async () => {
      signIn("admin");
      FacultyServices.listFaculty.mockResolvedValueOnce({ data: [] }).mockResolvedValue({ data: [ada] });
      FacultyServices.createFaculty.mockResolvedValue({ status: 201, data: ada });
      const { wrapper } = await mountPage();

      await click('[data-testid="add-faculty"]');
      expect(document.body.textContent).toContain("Add Faculty");
      await fillAll({ firstName: "Ada", lastName: "Lovelace", dept: "Computer Science" });
      await click('[data-testid="save-faculty"]');

      expect(FacultyServices.createFaculty).toHaveBeenCalledWith({
        firstName: "Ada",
        lastName: "Lovelace",
        dept: "Computer Science",
      });
      expect(document.querySelector(".v-overlay--active")).toBeNull();
      expect(rows(wrapper)).toEqual([["Ada", "Lovelace", "Computer Science"]]);
    });

    it("Add Faculty form blocks submit when a required field is empty", async () => {
      signIn("admin");
      await mountPage();

      for (const [field, message] of requiredFields) {
        await click('[data-testid="add-faculty"]');
        await fillAll({ firstName: "Ada", lastName: "Lovelace", dept: "Computer Science", [field]: "" });
        await click('[data-testid="save-faculty"]');

        expect(document.body.textContent).toContain(message);
        await click('[data-testid="cancel-faculty"]');
      }
      expect(FacultyServices.createFaculty).not.toHaveBeenCalled();
    });

    it("Add Faculty form blocks submit when a required field is only whitespace", async () => {
      signIn("admin");
      await mountPage();

      for (const [field, message] of requiredFields) {
        await click('[data-testid="add-faculty"]');
        await fillAll({ firstName: "Ada", lastName: "Lovelace", dept: "Computer Science", [field]: "   " });
        await click('[data-testid="save-faculty"]');

        expect(document.body.textContent).toContain(message);
        await click('[data-testid="cancel-faculty"]');
      }
      expect(FacultyServices.createFaculty).not.toHaveBeenCalled();
    });
  });

  describe("US-4.2 — View faculty members", () => {
    it("Admin views the faculty list", async () => {
      signIn("admin");
      FacultyServices.listFaculty.mockResolvedValue({ status: 200, data: [grace, ada] });
      const { wrapper } = await mountPage();

      expect(FacultyServices.listFaculty).toHaveBeenCalledOnce();
      expect(wrapper.find("h1").text()).toBe("Faculty");
      expect(wrapper.findAll("th").map((cell) => cell.text()).slice(0, 3)).toEqual(["First name", "Last name", "Department"]);
      expect(rows(wrapper)).toEqual([
        ["Grace", "Hopper", "Mathematics"],
        ["Ada", "Lovelace", "Computer Science"],
      ]);
    });

    it("Admin views the faculty list when no faculty members exist", async () => {
      signIn("admin");
      FacultyServices.listFaculty.mockResolvedValue({ status: 200, data: [] });
      const { wrapper } = await mountPage();

      expect(wrapper.text()).toContain("No faculty members yet.");
      expect(rows(wrapper)).toEqual([]);
    });

    it("Faculty page shows a loading state while faculty members load", async () => {
      signIn("admin");
      let finishLoading;
      FacultyServices.listFaculty.mockReturnValue(new Promise((resolve) => { finishLoading = resolve; }));
      const { wrapper } = await mountPage();

      expect(wrapper.find('[data-testid="faculty-loading"]').exists()).toBe(true);
      expect(wrapper.text()).toContain("Loading faculty members...");

      finishLoading({ data: [ada] });
      await flushPromises();

      expect(wrapper.find('[data-testid="faculty-loading"]').exists()).toBe(false);
      expect(rows(wrapper)).toEqual([["Ada", "Lovelace", "Computer Science"]]);
    });

    it("Faculty page shows the API error when faculty members fail to load", async () => {
      signIn("admin");
      FacultyServices.listFaculty.mockRejectedValue({ response: { data: { message: "Faculty members are unavailable." } } });
      const { wrapper } = await mountPage();

      expect(wrapper.find(".v-alert").text()).toContain("Faculty members are unavailable.");
    });

    it("Faculty page shows a fallback error when the API gives no message", async () => {
      signIn("admin");
      FacultyServices.listFaculty.mockRejectedValue(new Error("Network Error"));
      const { wrapper } = await mountPage();

      expect(wrapper.find(".v-alert").text()).toContain("Request failed.");
    });
  });

  describe("US-4.3 — Edit a faculty member", () => {
    it("Admin edits a faculty member successfully", async () => {
      signIn("admin");
      const updated = { id: 1, firstName: "Augusta", lastName: "King", dept: "Mathematics" };
      FacultyServices.listFaculty.mockResolvedValueOnce({ data: [ada] }).mockResolvedValue({ data: [updated] });
      FacultyServices.updateFaculty.mockResolvedValue({ status: 200, data: updated });
      const { wrapper } = await mountPage();

      await click('[data-testid="edit-faculty"]');
      expect(document.body.textContent).toContain("Edit Faculty");
      expect(dialogInput("firstName").value).toBe("Ada");
      await fillAll({ firstName: "Augusta", lastName: "King", dept: "Mathematics" });
      await click('[data-testid="save-faculty"]');

      expect(FacultyServices.updateFaculty).toHaveBeenCalledWith(1, {
        firstName: "Augusta",
        lastName: "King",
        dept: "Mathematics",
      });
      expect(document.querySelector(".v-overlay--active")).toBeNull();
      expect(rows(wrapper)).toEqual([["Augusta", "King", "Mathematics"]]);
    });

    it("Edit Faculty form blocks submit when a required field is empty", async () => {
      signIn("admin");
      await mountPage();

      for (const [field, message] of requiredFields) {
        await click('[data-testid="edit-faculty"]');
        await fill(field, "");
        await click('[data-testid="save-faculty"]');

        expect(document.body.textContent).toContain(message);
        await click('[data-testid="cancel-faculty"]');
      }
      expect(FacultyServices.updateFaculty).not.toHaveBeenCalled();
    });

    it("Edit Faculty form blocks submit when a required field is only whitespace", async () => {
      signIn("admin");
      await mountPage();

      for (const [field, message] of requiredFields) {
        await click('[data-testid="edit-faculty"]');
        await fill(field, "   ");
        await click('[data-testid="save-faculty"]');

        expect(document.body.textContent).toContain(message);
        await click('[data-testid="cancel-faculty"]');
      }
      expect(FacultyServices.updateFaculty).not.toHaveBeenCalled();
    });
  });

  describe("US-4.4 — Delete a faculty member", () => {
    it("Admin deletes a faculty member successfully", async () => {
      signIn("admin");
      FacultyServices.listFaculty.mockResolvedValueOnce({ data: [ada] }).mockResolvedValue({ data: [] });
      FacultyServices.deleteFaculty.mockResolvedValue({ status: 200, data: { message: "Faculty member deleted successfully." } });
      const { wrapper } = await mountPage();

      await wrapper.find('[data-testid="delete-faculty"]').trigger("click");
      await flushPromises();

      expect(FacultyServices.deleteFaculty).toHaveBeenCalledWith(1);
      expect(rows(wrapper)).toEqual([]);
      expect(wrapper.text()).not.toContain("Lovelace");
    });
  });

  describe("US-4.5 — Restrict faculty management to admins", () => {
    it("Student cannot open the Faculty page", async () => {
      signIn("student");
      await router.push({ name: "faculty" });

      expect(router.currentRoute.value.name).toBe("home");
    });

    it("Unauthenticated user cannot open the Faculty page", async () => {
      await router.push("/faculty");

      expect(router.currentRoute.value.name).toBe("login");
    });

    it("Admin sees the Faculty link in the MenuBar", async () => {
      signIn("admin");
      const { wrapper } = await mountMenuBar();

      const link = wrapper.findAll("a").find((item) => item.text() === "Faculty");
      expect(link).toBeTruthy();
      expect(link.attributes("href")).toBe("/faculty");
    });

    it("Student does not see the Faculty link in the MenuBar", async () => {
      signIn("student");
      const { wrapper } = await mountMenuBar();

      expect(wrapper.text()).toContain("Semesters");
      expect(wrapper.findAll("a").some((item) => item.text() === "Faculty")).toBe(false);
    });
  });
});
