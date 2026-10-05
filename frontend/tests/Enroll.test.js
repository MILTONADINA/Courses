/**
 * Feature 6 — Enrollment Management
 * Spec: features/feature-6-enrollment-management.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Enroll from "../src/views/Enroll.vue";
import MenuBar from "../src/components/MenuBar.vue";
import SemesterServices from "../src/services/semesterServices.js";
import SectionServices from "../src/services/sectionServices.js";
import EnrollmentServices from "../src/services/enrollmentServices.js";
import router from "../src/router.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/semesterServices.js", () => ({ default: { listSemesters: vi.fn() } }));
vi.mock("../src/services/sectionServices.js", () => ({ default: { listSectionsBySemester: vi.fn() } }));
vi.mock("../src/services/enrollmentServices.js", () => ({ default: {
  listEnrollments: vi.fn(), createEnrollment: vi.fn(), updateEnrollment: vi.fn(), deleteEnrollment: vi.fn(),
} }));

const semester = { id: 1, semsterName: "Fall 2026" };
const section = {
  id: 1, semesterId: 1, sectionNumber: "01", daysOfWeek: "MWF", startTime: "09:00", endTime: "09:50",
  course: { courseNumber: "CMSC-4123", courseName: "Software Engineering IV" },
  faculty: { firstName: "Ada", lastName: "Lovelace" },
};
const second = { ...section, id: 2, sectionNumber: "02" };
const mine = { id: 5, studentId: 7, sectionId: 1 };
let page;
function signIn(role = "student") { localStorage.setItem("user", JSON.stringify({ token: "token", role, userId: 7 })); }
function failure(message) { return { response: { data: { message } } }; }
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
async function mountPage(select = true) {
  signIn();
  ({ wrapper: page } = await mountWithPlugins({ components: { Enroll }, template: "<v-app><Enroll /></v-app>" }));
  await flushPromises();
  if (select) await choose("Semester", 1);
  return page;
}
async function choose(label, value) {
  const field = page.findAllComponents({ name: "VSelect" }).find((item) => item.props("label") === label);
  field.vm.$emit("update:modelValue", value);
  await flushPromises();
}
async function click(id) {
  const element = page.find(`[data-testid="${id}"]`);
  if (element.exists()) await element.trigger("click");
  else document.querySelector(`[data-testid="${id}"]`).click();
  await flushPromises();
}
function rows() { return page.findAll('[data-testid="section-row"]'); }
async function openChange() {
  EnrollmentServices.listEnrollments.mockResolvedValue({ data: [mine] });
  await mountPage();
  await click("change-section");
}

beforeEach(async () => {
  vi.resetAllMocks();
  localStorage.clear();
  SemesterServices.listSemesters.mockResolvedValue({ data: [semester] });
  SectionServices.listSectionsBySemester.mockResolvedValue({ data: [section, second] });
  EnrollmentServices.listEnrollments.mockResolvedValue({ data: [] });
  EnrollmentServices.createEnrollment.mockResolvedValue({ data: mine });
  EnrollmentServices.deleteEnrollment.mockResolvedValue({ data: { message: "Enrollment deleted successfully." } });
  EnrollmentServices.updateEnrollment.mockResolvedValue({ data: { ...mine, sectionId: 2 } });
  await router.push({ name: "login" });
});
afterEach(() => {
  page?.unmount();
  page = null;
  document.body.querySelectorAll(".v-overlay-container, .v-overlay").forEach((node) => node.remove());
});

describe("Feature 6 — Enrollment Management", () => {
  describe("US-6.1 — View sections available for enrollment", () => {
    it("Student views sections for a selected semester", async () => {
      // Deliberately return reverse order to verify the page preserves API order.
      SectionServices.listSectionsBySemester.mockResolvedValue({ data: [second, section] });
      await mountPage(false);
      expect(SectionServices.listSectionsBySemester).not.toHaveBeenCalled();
      await choose("Semester", 1);
      expect(SectionServices.listSectionsBySemester).toHaveBeenCalledWith(1);
      expect(rows().map((row) => row.findAll("td").slice(0, 5).map((cell) => cell.text()))).toEqual([
        ["CMSC-4123 Software Engineering IV", "02", "Ada Lovelace", "MWF", "09:00–09:50"],
        ["CMSC-4123 Software Engineering IV", "01", "Ada Lovelace", "MWF", "09:00–09:50"],
      ]);
    });
    it("Enroll page shows a loading state while sections load", async () => {
      const pending = deferred();
      SectionServices.listSectionsBySemester.mockReturnValue(pending.promise);
      await mountPage();
      expect(page.find('[data-testid="enroll-loading"]').exists()).toBe(true);
      expect(rows()).toHaveLength(0);
      pending.resolve({ data: [section] });
      await flushPromises();
      expect(page.find('[data-testid="enroll-loading"]').exists()).toBe(false);
      expect(rows()).toHaveLength(1);
    });
    it("Enroll page shows a message when no semesters exist", async () => {
      SemesterServices.listSemesters.mockResolvedValue({ data: [] });
      await mountPage(false);
      expect(page.text()).toContain("No semesters available.");
    });
    it("Enroll page shows a message when the semester has no sections", async () => {
      SectionServices.listSectionsBySemester.mockResolvedValue({ data: [] });
      await mountPage();
      expect(page.text()).toContain("No sections for this semester.");
    });
    it("Enroll page shows the API error when sections fail to load", async () => {
      SectionServices.listSectionsBySemester.mockRejectedValue(failure("Sections unavailable."));
      await mountPage();
      expect(page.text()).toContain("Sections unavailable.");
      expect(page.text()).not.toContain("No sections for this semester.");
    });
    it("Enroll page shows the API error when semesters fail to load", async () => {
      SemesterServices.listSemesters.mockRejectedValue(failure("Semesters unavailable."));
      await mountPage(false);
      expect(page.text()).toContain("Semesters unavailable.");
    });
    it("Enroll page shows a fallback error when the API gives no message", async () => {
      SemesterServices.listSemesters.mockRejectedValue(new Error("Network error"));
      await mountPage(false);
      expect(page.text()).toContain("Request failed.");
    });
    it("Waits for semesters and enrollment state before enabling selection (screen requirements)", async () => {
      const semesters = deferred(), enrollments = deferred();
      SemesterServices.listSemesters.mockReturnValue(semesters.promise);
      EnrollmentServices.listEnrollments.mockReturnValue(enrollments.promise);
      await mountPage(false);
      expect(page.find('[data-testid="enroll-loading"]').exists()).toBe(true);
      semesters.resolve({ data: [semester] });
      await flushPromises();
      expect(page.findComponent({ name: "VSelect" }).exists()).toBe(false);
      expect(page.find('[data-testid="enroll-loading"]').exists()).toBe(true);
      enrollments.resolve({ data: [] });
      await flushPromises();
      expect(page.findComponent({ name: "VSelect" }).props("disabled")).toBe(false);
      expect(page.find('[data-testid="enroll-loading"]').exists()).toBe(false);
    });
    it("Ignores stale sections when semesters change (FR-005)", async () => {
      const old = deferred();
      SemesterServices.listSemesters.mockResolvedValue({ data: [semester, { id: 2, semsterName: "Spring 2027" }] });
      SectionServices.listSectionsBySemester.mockReturnValueOnce(old.promise).mockResolvedValueOnce({ data: [{ ...second, semesterId: 2 }] });
      await mountPage();
      await choose("Semester", 2);
      old.resolve({ data: [section] });
      await flushPromises();
      expect(rows()).toHaveLength(1);
      expect(rows()[0].findAll("td")[1].text()).toBe("02");
    });
  });

  describe("US-6.2 — Enroll in a section", () => {
    it("Section shows Drop after the student enrolls", async () => {
      await mountPage();
      await click("enroll");
      expect(EnrollmentServices.createEnrollment).toHaveBeenCalledWith({ sectionId: 1 });
      expect(rows()[0].text()).toContain("Drop");
      expect(rows()[0].text()).toContain("Change section");
    });
    it("Enroll page shows the API error when enrolling fails", async () => {
      EnrollmentServices.createEnrollment.mockRejectedValue(failure("Enrollment failed."));
      await mountPage();
      await click("enroll");
      expect(page.text()).toContain("Enrollment failed.");
      expect(rows()[0].find('[data-testid="enroll"]').exists()).toBe(true);
    });
  });

  describe("US-6.3 — View my enrollments", () => {
    it("Enroll page shows Enroll for a section I am not enrolled in", async () => {
      await mountPage();
      expect(rows()[0].find('[data-testid="enroll"]').exists()).toBe(true);
      expect(page.find('[data-testid="drop"]').exists()).toBe(false);
    });
    it("Enroll page shows Drop for a section I am enrolled in", async () => {
      EnrollmentServices.listEnrollments.mockResolvedValue({ data: [mine] });
      await mountPage();
      expect(rows()[0].find('[data-testid="drop"]').exists()).toBe(true);
      expect(rows()[1].find('[data-testid="enroll"]').exists()).toBe(true);
    });
    it("Enroll page shows the API error when enrollments fail to load", async () => {
      EnrollmentServices.listEnrollments.mockRejectedValue(failure("Enrollments unavailable."));
      await mountPage(false);
      expect(page.text()).toContain("Enrollments unavailable.");
      expect(page.findComponent({ name: "VSelect" }).props("disabled")).toBe(true);
      expect(rows()).toHaveLength(0);
    });
  });

  describe("US-6.4 — Drop my enrollment", () => {
    it("Section shows Enroll after the student drops", async () => {
      EnrollmentServices.listEnrollments.mockResolvedValue({ data: [mine] });
      await mountPage();
      await click("drop");
      expect(EnrollmentServices.deleteEnrollment).toHaveBeenCalledWith(5);
      expect(rows()[0].find('[data-testid="enroll"]').exists()).toBe(true);
      expect(rows()[0].find('[data-testid="change-section"]').exists()).toBe(false);
    });
    it("Enroll page shows the API error when dropping fails", async () => {
      EnrollmentServices.listEnrollments.mockResolvedValue({ data: [mine] });
      EnrollmentServices.deleteEnrollment.mockRejectedValue(failure("Drop failed."));
      await mountPage();
      await click("drop");
      expect(page.text()).toContain("Drop failed.");
      expect(rows()[0].find('[data-testid="drop"]').exists()).toBe(true);
    });
  });

  describe("US-6.5 — Restrict enrollment management to students", () => {
    async function mountMenu(role) {
      signIn(role);
      ({ wrapper: page } = await mountWithPlugins({ components: { MenuBar }, template: "<v-app><MenuBar /></v-app>" }));
    }
    it("Student sees Enroll in the MenuBar", async () => {
      await mountMenu("student");
      const link = page.findAll("a").find((item) => item.text() === "Enroll");
      expect(link).toBeTruthy();
      expect(link.attributes("href")).toBe("/enroll");
    });
    it("Admin does not see Enroll in the MenuBar", async () => {
      await mountMenu("admin");
      expect(page.findAll("a").some((item) => item.text() === "Enroll")).toBe(false);
    });
  });

  describe("US-6.6 — Protect the Enroll page by role", () => {
    it("Student can access the Enroll page", async () => {
      signIn();
      await router.push("/enroll");
      expect(router.currentRoute.value.name).toBe("enroll");
      expect(router.currentRoute.value.matched[0].components.default).toBe(Enroll);
    });
    it("Signed-out user is sent to Login from the Enroll page", async () => {
      await router.push("/enroll");
      expect(router.currentRoute.value.name).toBe("login");
    });
    it("Admin is sent to Home from the Enroll page", async () => {
      signIn("admin");
      await router.push("/enroll");
      expect(router.currentRoute.value.name).toBe("home");
    });
  });

  describe("US-6.8 — Change my enrollment to another section", () => {
    it("Section shows Drop after the student changes sections", async () => {
      await openChange();
      const select = page.findAllComponents({ name: "VSelect" }).find((item) => item.props("label") === "New section");
      expect(select.props("items")).toEqual([second]);
      await choose("New section", 2);
      await click("save-change");
      expect(EnrollmentServices.updateEnrollment).toHaveBeenCalledWith(5, { sectionId: 2 });
      expect(rows()[0].find('[data-testid="enroll"]').exists()).toBe(true);
      expect(rows()[1].find('[data-testid="drop"]').exists()).toBe(true);
      expect(page.findComponent({ name: "VDialog" }).props("modelValue")).toBe(false);
    });
    it("Change section dialog shows a message when no other sections are available", async () => {
      SectionServices.listSectionsBySemester.mockResolvedValue({ data: [section] });
      await openChange();
      expect(document.body.textContent).toContain("No other sections available.");
    });
    it("Change section dialog requires a new section", async () => {
      await openChange();
      await click("save-change");
      expect(document.body.textContent).toContain("Section id is required.");
      expect(EnrollmentServices.updateEnrollment).not.toHaveBeenCalled();
    });
    it("Change section dialog shows the API error when the change fails", async () => {
      EnrollmentServices.updateEnrollment.mockRejectedValue(failure("Change failed."));
      await openChange();
      await choose("New section", 2);
      await click("save-change");
      expect(document.body.textContent).toContain("Change failed.");
      expect(rows()[0].find('[data-testid="drop"]').exists()).toBe(true);
      expect(page.findComponent({ name: "VDialog" }).props("modelValue")).toBe(true);
    });
    it("Change section dialog shows a fallback error when the API gives no message", async () => {
      EnrollmentServices.updateEnrollment.mockRejectedValue(new Error("Network error"));
      await openChange();
      await choose("New section", 2);
      await click("save-change");
      expect(document.body.textContent).toContain("Request failed.");
    });
    it("Cancel closes the dialog without saving (screen requirements)", async () => {
      await openChange();
      await choose("New section", 2);
      await click("cancel-change");
      expect(EnrollmentServices.updateEnrollment).not.toHaveBeenCalled();
      expect(page.findComponent({ name: "VDialog" }).props("modelValue")).toBe(false);
      expect(rows()[0].find('[data-testid="drop"]').exists()).toBe(true);
    });
    it("Save displays a loading state until the change completes (screen requirements)", async () => {
      const pending = deferred();
      EnrollmentServices.updateEnrollment.mockReturnValue(pending.promise);
      await openChange();
      await choose("New section", 2);
      await click("save-change");
      const save = page.findAllComponents({ name: "VBtn" }).find((item) => item.attributes("data-testid") === "save-change");
      expect(save.props("loading")).toBe(true);
      pending.resolve({ data: { ...mine, sectionId: 2 } });
      await flushPromises();
      expect(page.findComponent({ name: "VDialog" }).props("modelValue")).toBe(false);
    });
  });
});
