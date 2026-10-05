/**
 * Feature 5 — Section Management
 * Spec: features/feature-5-section-management.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Sections from "../src/views/Sections.vue";
import MenuBar from "../src/components/MenuBar.vue";
import SectionServices from "../src/services/sectionServices.js";
import SemesterServices from "../src/services/semesterServices.js";
import CourseServices from "../src/services/courseServices.js";
import FacultyServices from "../src/services/facultyServices.js";
import router from "../src/router.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/sectionServices.js", () => ({
  default: {
    listSections: vi.fn(),
    createSection: vi.fn(),
    updateSection: vi.fn(),
    deleteSection: vi.fn(),
  },
}));

vi.mock("../src/services/semesterServices.js", () => ({ default: { listSemesters: vi.fn() } }));
vi.mock("../src/services/courseServices.js", () => ({ default: { listCourses: vi.fn() } }));
vi.mock("../src/services/facultyServices.js", () => ({ default: { listFaculty: vi.fn() } }));

const spring = { id: 1, semsterName: "Spring 2026" };
const fall = { id: 2, semsterName: "Fall 2026" };
const course = { id: 3, courseNumber: "CMSC-4123", courseName: "Software Engineering IV" };
const ada = { id: 4, firstName: "Ada", lastName: "Lovelace" };

const section = {
  id: 1,
  sectionNumber: "01",
  semesterId: 2,
  courseId: 3,
  facultyId: 4,
  daysOfWeek: "MWF",
  startTime: "09:00",
  endTime: "09:50",
  semester: fall,
  course,
  faculty: ada,
};

const validForm = {
  Semester: 2,
  Course: 3,
  Instructor: 4,
  "Section number": "01",
  "Days of week": "MWF",
  "Start time": "09:00",
  "End time": "09:50",
};

const savedValues = {
  sectionNumber: "01",
  semesterId: 2,
  courseId: 3,
  facultyId: 4,
  daysOfWeek: "MWF",
  startTime: "09:00",
  endTime: "09:50",
};

const sectionRow = ["Fall 2026", "CMSC-4123 Software Engineering IV", "01", "Ada Lovelace", "MWF", "09:00–09:50"];

function signIn(role) {
  localStorage.setItem("user", JSON.stringify({ token: `${role}-token`, role }));
}

let page;

async function mountPage() {
  const Page = { components: { Sections }, template: "<v-app><Sections /></v-app>" };
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

function formField(label) {
  const selects = page.findAllComponents({ name: "VSelect" });
  const textFields = page.findAllComponents({ name: "VTextField" });
  return [...selects, ...textFields].find((field) => field.props("label") === label);
}

async function setField(label, value) {
  formField(label).vm.$emit("update:modelValue", value);
  await flushPromises();
}

async function fillForm(values) {
  for (const [label, value] of Object.entries(values)) await setField(label, value);
}

async function click(selector) {
  const onPage = page?.findAll(selector) ?? [];
  if (onPage.length) {
    await onPage.at(-1).trigger("click");
  } else {
    [...document.querySelectorAll(selector)].at(-1).click();
  }
  await flushPromises();
}

function rows(wrapper) {
  return wrapper.findAll('[data-testid="section-row"]').map((row) => row.findAll("td").slice(0, 6).map((cell) => cell.text()));
}

beforeEach(async () => {
  document.body.querySelectorAll(".v-overlay-container, .v-overlay").forEach((node) => node.remove());
  localStorage.clear();
  vi.clearAllMocks();
  page = null;
  SectionServices.listSections.mockResolvedValue({ data: [section] });
  SemesterServices.listSemesters.mockResolvedValue({ data: [spring, fall] });
  CourseServices.listCourses.mockResolvedValue({ data: [course] });
  FacultyServices.listFaculty.mockResolvedValue({ data: [ada] });
  await router.push({ name: "login" });
  await router.isReady();
});

describe("Feature 5 — Section Management", () => {
  describe("US-5.1 — Add a section", () => {
    it("Admin adds a section from the Sections page", async () => {
      signIn("admin");
      SectionServices.listSections.mockResolvedValueOnce({ data: [] }).mockResolvedValue({ data: [section] });
      SectionServices.createSection.mockResolvedValue({ status: 201, data: section });
      const { wrapper } = await mountPage();

      await click('[data-testid="add-section"]');
      expect(document.body.textContent).toContain("Add Section");
      await fillForm(validForm);
      await click('[data-testid="save-section"]');

      expect(SectionServices.createSection).toHaveBeenCalledWith(savedValues);
      expect(document.querySelector(".v-overlay--active")).toBeNull();
      expect(rows(wrapper)).toEqual([sectionRow]);
    });

    it("Section form blocks submit when a required field is empty", async () => {
      signIn("admin");
      await mountPage();

      await click('[data-testid="add-section"]');
      await fillForm({ ...validForm, "Section number": "" });
      await click('[data-testid="save-section"]');

      expect(document.body.textContent).toContain("Section number is required.");
      expect(SectionServices.createSection).not.toHaveBeenCalled();
    });

    it("Section form blocks submit when a field is only whitespace", async () => {
      signIn("admin");
      await mountPage();

      await click('[data-testid="add-section"]');
      await fillForm({ ...validForm, "Days of week": "   " });
      await click('[data-testid="save-section"]');

      expect(document.body.textContent).toContain("Days of week is required.");
      expect(SectionServices.createSection).not.toHaveBeenCalled();
    });

    it("Section form blocks submit when a time is not in HH:MM format", async () => {
      signIn("admin");
      await mountPage();

      await click('[data-testid="add-section"]');
      await fillForm({ ...validForm, "Start time": "9am" });
      await click('[data-testid="save-section"]');

      expect(document.body.textContent).toContain("Start time must be in HH:MM format.");
      expect(SectionServices.createSection).not.toHaveBeenCalled();
    });

    it("Section form shows the API error when a save fails", async () => {
      signIn("admin");
      SectionServices.createSection.mockRejectedValue({ response: { data: { message: "Semester with id=2 not found." } } });
      await mountPage();

      await click('[data-testid="add-section"]');
      await fillForm(validForm);
      await click('[data-testid="save-section"]');

      expect(document.body.textContent).toContain("Semester with id=2 not found.");
      expect(document.querySelector(".v-overlay--active")).not.toBeNull();
    });

    it("Section form shows a fallback error when a save fails without a message", async () => {
      signIn("admin");
      SectionServices.createSection.mockRejectedValue(new Error("Network Error"));
      await mountPage();

      await click('[data-testid="add-section"]');
      await fillForm(validForm);
      await click('[data-testid="save-section"]');

      expect(document.body.textContent).toContain("Request failed.");
      expect(document.querySelector(".v-overlay--active")).not.toBeNull();
    });
  });

  describe("US-5.2 — View sections", () => {
    it("Admin views the section list", async () => {
      signIn("admin");
      const later = { ...section, id: 2, sectionNumber: "02", daysOfWeek: "TR", startTime: "13:00", endTime: "14:15" };
      SectionServices.listSections.mockResolvedValue({ status: 200, data: [section, later] });
      const { wrapper } = await mountPage();

      expect(SectionServices.listSections).toHaveBeenCalledOnce();
      expect(wrapper.find("h1").text()).toBe("Sections");
      expect(wrapper.findAll("th").map((cell) => cell.text()).slice(0, 6)).toEqual([
        "Semester",
        "Course",
        "Section",
        "Instructor",
        "Days",
        "Time",
      ]);
      expect(rows(wrapper)).toEqual([
        sectionRow,
        ["Fall 2026", "CMSC-4123 Software Engineering IV", "02", "Ada Lovelace", "TR", "13:00–14:15"],
      ]);
    });

    it("Admin views the section list when no sections exist", async () => {
      signIn("admin");
      SectionServices.listSections.mockResolvedValue({ status: 200, data: [] });
      const { wrapper } = await mountPage();

      expect(wrapper.text()).toContain("No sections yet.");
      expect(rows(wrapper)).toEqual([]);
    });

    it("Sections page shows a loading state while sections load", async () => {
      signIn("admin");
      let finishLoading;
      SectionServices.listSections.mockReturnValue(new Promise((resolve) => { finishLoading = resolve; }));
      const { wrapper } = await mountPage();

      expect(wrapper.find('[data-testid="sections-loading"]').exists()).toBe(true);
      expect(wrapper.text()).toContain("Loading sections...");

      finishLoading({ data: [section] });
      await flushPromises();

      expect(wrapper.find('[data-testid="sections-loading"]').exists()).toBe(false);
      expect(rows(wrapper)).toEqual([sectionRow]);
    });

    it("Sections page shows the API error when sections fail to load", async () => {
      signIn("admin");
      SectionServices.listSections.mockRejectedValue({ response: { data: { message: "Sections could not be loaded." } } });
      const { wrapper } = await mountPage();

      expect(wrapper.find(".v-alert").text()).toContain("Sections could not be loaded.");
    });

    it("Sections page shows a fallback error when the API gives no message", async () => {
      signIn("admin");
      SectionServices.listSections.mockRejectedValue(new Error("Network Error"));
      const { wrapper } = await mountPage();

      expect(wrapper.find(".v-alert").text()).toContain("Request failed.");
    });
  });

  describe("US-5.3 — Edit a section", () => {
    it("Edit Section dialog shows the section's current values", async () => {
      signIn("admin");
      await mountPage();

      await click('[data-testid="edit-section"]');

      expect(document.body.textContent).toContain("Edit Section");
      expect(dialogInput("sectionNumber").value).toBe("01");
      expect(dialogInput("daysOfWeek").value).toBe("MWF");
    });

    it("Admin edits a section from the Sections page", async () => {
      signIn("admin");
      const updated = { ...section, daysOfWeek: "TR" };
      SectionServices.listSections.mockResolvedValueOnce({ data: [section] }).mockResolvedValue({ data: [updated] });
      SectionServices.updateSection.mockResolvedValue({ status: 200, data: updated });
      const { wrapper } = await mountPage();

      await click('[data-testid="edit-section"]');
      await setField("Days of week", "TR");
      await click('[data-testid="save-section"]');

      expect(SectionServices.updateSection).toHaveBeenCalledWith(1, { ...savedValues, daysOfWeek: "TR" });
      expect(document.querySelector(".v-overlay--active")).toBeNull();
      expect(rows(wrapper)[0][4]).toBe("TR");
    });

    it("Edit Section form blocks submit when a required field is cleared", async () => {
      signIn("admin");
      await mountPage();

      await click('[data-testid="edit-section"]');
      await setField("Section number", "");
      await click('[data-testid="save-section"]');

      expect(document.body.textContent).toContain("Section number is required.");
      expect(SectionServices.updateSection).not.toHaveBeenCalled();
    });
  });

  describe("US-5.4 — Delete a section", () => {
    it("Admin deletes a section successfully", async () => {
      signIn("admin");
      SectionServices.listSections.mockResolvedValueOnce({ data: [section] }).mockResolvedValue({ data: [] });
      SectionServices.deleteSection.mockResolvedValue({ status: 200, data: { message: "Section deleted successfully." } });
      const { wrapper } = await mountPage();

      await wrapper.find('[data-testid="delete-section"]').trigger("click");
      await flushPromises();

      expect(SectionServices.deleteSection).toHaveBeenCalledWith(1);
      expect(rows(wrapper)).toEqual([]);
      expect(wrapper.text()).not.toContain("Ada Lovelace");
    });
  });

  describe("US-5.5 — Restrict section changes to admins", () => {
    it("Student cannot open the Sections page", async () => {
      signIn("student");
      await router.push({ name: "sections" });

      expect(router.currentRoute.value.name).toBe("home");
    });

    it("Unauthenticated user cannot open the Sections page", async () => {
      await router.push("/sections");

      expect(router.currentRoute.value.name).toBe("login");
    });

    it("Admin sees the Sections link in the MenuBar", async () => {
      signIn("admin");
      const { wrapper } = await mountMenuBar();

      const link = wrapper.findAll("a").find((item) => item.text() === "Sections");
      expect(link).toBeTruthy();
      expect(link.attributes("href")).toBe("/sections");
    });

    it("Student does not see the Sections link in the MenuBar", async () => {
      signIn("student");
      const { wrapper } = await mountMenuBar();

      expect(wrapper.text()).toContain("Semesters");
      expect(wrapper.findAll("a").some((item) => item.text() === "Sections")).toBe(false);
    });
  });
});
