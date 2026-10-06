/**
 * Feature 8 — Section Student Listing
 * Spec: features/feature-8-section-student-listing.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import { RouterView } from "vue-router";
import SectionServices from "../src/services/sectionServices.js";
import router from "../src/router.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/sectionServices.js", () => ({
  default: {
    listSections: vi.fn(), listSectionStudents: vi.fn(),
    createSection: vi.fn(), updateSection: vi.fn(), deleteSection: vi.fn(),
  },
}));
vi.mock("../src/services/enrollmentServices.js", () => ({
  default: { listEnrollments: vi.fn(), createEnrollment: vi.fn(), updateEnrollment: vi.fn(), deleteEnrollment: vi.fn() },
}));

const section = { id: 3, sectionNumber: "01", courseNumber: "CMSC 4113", courseName: "Software Engineering IV", semsterName: "Fall 2026" };
const grace = { id: 8, firstName: "Grace", lastName: "Hopper", universityId: "100200", email: "grace.hopper@example.com" };
const alan = { id: 7, firstName: "Alan", lastName: "Turing", universityId: "100100", email: "alan.turing@example.com" };
let page;

function signIn(role) {
  localStorage.setItem("user", JSON.stringify({ token: `${role}-token`, role }));
}

async function mountPage(path = "/sections/3/students", flush = true) {
  await router.push(path);
  const shell = { components: { RouterView }, template: "<v-app><RouterView /></v-app>" };
  ({ wrapper: page } = await mountWithPlugins(shell, { router }));
  if (flush) await flushPromises();
  return page;
}

beforeEach(async () => {
  vi.resetAllMocks();
  localStorage.clear();
  signIn("admin");
  await router.push("/");
  SectionServices.listSectionStudents.mockResolvedValue({ data: { section, students: [grace, alan] } });
  SectionServices.listSections.mockResolvedValue({ data: [
    { id: 3, sectionNumber: "01", semester: { semsterName: "Fall 2026" },
      course: { courseNumber: "CMSC 4113", courseName: "Software Engineering IV" },
      faculty: { firstName: "Ada", lastName: "Lovelace" }, daysOfWeek: "MWF", startTime: "09:00", endTime: "09:50" },
    { id: 4, sectionNumber: "02", semester: { semsterName: "Fall 2026" },
      course: { courseNumber: "CMSC 4113", courseName: "Software Engineering IV" },
      faculty: { firstName: "Ada", lastName: "Lovelace" }, daysOfWeek: "TR", startTime: "10:00", endTime: "11:15" },
  ] });
});

afterEach(() => { page?.unmount(); page = null; });

describe("Feature 8 — Section Student Listing", () => {
  describe("US-8.1 — View the students enrolled in a section", () => {
    it("Admin opens a section's student list from the Sections page", async () => {
      await mountPage("/sections");
      const actions = page.findAll('[data-testid="section-students"]');
      expect(actions.map(action => action.text())).toEqual(["Students", "Students"]);
      expect(actions.map(action => action.attributes("href"))).toEqual(["/sections/3/students", "/sections/4/students"]);
      await actions[0].trigger("click", { button: 0 });
      await vi.waitFor(() => expect(router.currentRoute.value.path).toBe("/sections/3/students"));
      await flushPromises();
      expect(router.currentRoute.value.path).toBe("/sections/3/students");
      expect(router.currentRoute.value.name).toBe("section-students");
      expect(SectionServices.listSectionStudents).toHaveBeenCalledWith("3");
      expect(page.text()).toContain("grace.hopper@example.com");
    });

    it("Section students page shows the enrolled students", async () => {
      await mountPage();
      expect(SectionServices.listSectionStudents).toHaveBeenCalledWith("3");
      expect(page.find("h1").text()).toBe("CMSC 4113 Software Engineering IV — Section 01 (Fall 2026)");
      expect(page.findAll("th").map(cell => cell.text())).toEqual(["Last name", "First name", "University ID", "Email"]);
      expect(page.findAll('[data-testid="section-student-row"]').map(row => row.findAll("td").map(cell => cell.text())))
        .toEqual([["Hopper", "Grace", "100200", "grace.hopper@example.com"], ["Turing", "Alan", "100100", "alan.turing@example.com"]]);
      SectionServices.listSectionStudents.mockResolvedValueOnce({ data: { section: { ...section, id: 4, sectionNumber: "02" }, students: [] } });
      await router.push("/sections/4/students");
      await flushPromises();
      expect(SectionServices.listSectionStudents).toHaveBeenLastCalledWith("4");
      expect(page.find("h1").text()).toContain("Section 02");
      expect(page.findAll('[data-testid="section-student-row"]')).toHaveLength(0);
    });

    it("Section students page shows a loading state", async () => {
      let resolve;
      SectionServices.listSectionStudents.mockImplementationOnce(() => new Promise(done => { resolve = done; }));
      await mountPage(undefined, false);
      expect(page.find('[data-testid="section-students-loading"]').exists()).toBe(true);
      expect(page.text()).not.toContain("No students enrolled.");
      expect(page.findAll('[data-testid="section-student-row"]')).toHaveLength(0);
      resolve({ data: { section, students: [grace] } });
      await flushPromises();
      expect(page.find('[data-testid="section-students-loading"]').exists()).toBe(false);
      expect(page.text()).toContain("grace.hopper@example.com");
    });

    it("Section students page shows a message when no students are enrolled", async () => {
      SectionServices.listSectionStudents.mockResolvedValueOnce({ data: { section, students: [] } });
      await mountPage();
      expect(page.text()).toContain("No students enrolled.");
      expect(page.find("h1").text()).toContain("Section 01 (Fall 2026)");
      expect(page.find("table").exists()).toBe(false);
      expect(page.find('[data-testid="section-students-loading"]').exists()).toBe(false);
    });

    it("Section students page shows the API error when the list fails", async () => {
      SectionServices.listSectionStudents.mockRejectedValueOnce({ response: { data: { message: "Section with id=3 not found." } } });
      await mountPage();
      expect(page.find('[role="alert"]').text()).toBe("Section with id=3 not found.");
      expect(page.text()).not.toContain("No students enrolled.");
      expect(page.find('[data-testid="section-students-loading"]').exists()).toBe(false);
    });

    it("Section students page shows a fallback error when the API gives no message", async () => {
      SectionServices.listSectionStudents.mockRejectedValueOnce(new Error("Network error"));
      await mountPage();
      expect(page.find('[role="alert"]').text()).toBe("Request failed.");
      expect(page.text()).not.toContain("No students enrolled.");
      expect(page.find('[data-testid="section-students-loading"]').exists()).toBe(false);
    });

    it("Section students page does not offer enrollment actions", async () => {
      const { default: EnrollmentServices } = await import("../src/services/enrollmentServices.js");
      await mountPage();
      expect(page.findAll('[data-testid="section-student-row"]')).toHaveLength(2);
      expect(page.findAll("button, form, input, select")).toHaveLength(0);
      for (const method of Object.values(EnrollmentServices)) expect(method).not.toHaveBeenCalled();
      for (const method of [SectionServices.createSection, SectionServices.updateSection, SectionServices.deleteSection]) {
        expect(method).not.toHaveBeenCalled();
      }
    });
  });

  describe("US-8.2 — Restrict section student lists to admins", () => {
    it("Student is sent to Home from the Section students page", async () => {
      signIn("student");
      await mountPage();
      expect(router.currentRoute.value.name).toBe("home");
      expect(SectionServices.listSectionStudents).not.toHaveBeenCalled();
      expect(page.text()).not.toContain("grace.hopper@example.com");
    });

    it("Signed-out user is sent to Login from the Section students page", async () => {
      localStorage.clear();
      await mountPage();
      expect(router.currentRoute.value.name).toBe("login");
      expect(SectionServices.listSectionStudents).not.toHaveBeenCalled();
      expect(page.text()).not.toContain("grace.hopper@example.com");
    });
  });
});
