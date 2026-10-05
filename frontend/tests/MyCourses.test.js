/**
 * Feature 7 — Student Course Listing
 * Spec: features/feature-7-student-course-listing.md
 */
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import MyCourses from "../src/views/MyCourses.vue";
import MenuBar from "../src/components/MenuBar.vue";
import MyCoursesServices from "../src/services/myCoursesServices.js";
import router from "../src/router.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/myCoursesServices.js", () => ({ default: { listMyCourses: vi.fn() } }));

const course = {
  enrollmentId: 5,
  courseNumber: "CMSC-4123",
  courseName: "Software Engineering IV",
  sectionNumber: "01",
  semsterName: "Fall 2026",
  daysOfWeek: "MWF",
  startTime: "09:00",
  endTime: "09:50",
  instructorName: "Ada Lovelace",
};
let page;

function signIn(role = "student") {
  localStorage.setItem("user", JSON.stringify({ token: "token", role, userId: 7 }));
}
function failure(message) {
  return { response: { data: { message } } };
}
function deferred() {
  let resolve, reject;
  const promise = new Promise((yes, no) => { resolve = yes; reject = no; });
  return { promise, resolve, reject };
}
async function mountPage() {
  ({ wrapper: page } = await mountWithPlugins({ components: { MyCourses }, template: "<v-app><MyCourses /></v-app>" }));
  await flushPromises();
  return page;
}

beforeEach(async () => {
  vi.resetAllMocks();
  localStorage.clear();
  MyCoursesServices.listMyCourses.mockResolvedValue({ data: [] });
  await router.push({ name: "login" });
});
afterEach(() => {
  page?.unmount();
  page = null;
});

describe("Feature 7 — Student Course Listing", () => {
  describe("US-7.1 — View my enrolled sections", () => {
    it("My courses page shows an enrolled section", async () => {
      signIn();
      MyCoursesServices.listMyCourses.mockResolvedValue({ data: [course] });
      await mountPage();
      expect(page.text()).toContain("Software Engineering IV");
      expect(page.text()).toContain("CMSC-4123");
      expect(page.text()).toContain("01");
      expect(page.text()).toContain("Fall 2026");
      expect(page.text()).toContain("MWF");
      expect(page.text()).toContain("09:00");
      expect(page.text()).toContain("09:50");
      expect(page.text()).toContain("Ada Lovelace");
    });

    it("My courses page shows a loading state", async () => {
      signIn();
      const pending = deferred();
      MyCoursesServices.listMyCourses.mockReturnValue(pending.promise);
      ({ wrapper: page } = await mountWithPlugins({ components: { MyCourses }, template: "<v-app><MyCourses /></v-app>" }));
      expect(page.text()).toContain("Loading...");
      pending.resolve({ data: [] });
      await flushPromises();
    });

    it("My courses page shows a message when the student has no enrollments", async () => {
      signIn();
      await mountPage();
      expect(page.text()).toContain("No enrolled sections.");
    });

    it("My courses page shows the API error when the list fails", async () => {
      signIn();
      MyCoursesServices.listMyCourses.mockRejectedValue(failure("Courses could not be loaded."));
      await mountPage();
      expect(page.text()).toContain("Courses could not be loaded.");
    });

    it("My courses page shows a fallback error when the API gives no message", async () => {
      signIn();
      MyCoursesServices.listMyCourses.mockRejectedValue(new Error("Network Error"));
      await mountPage();
      expect(page.text()).toContain("Request failed.");
    });

    it("My courses page does not offer enrollment actions", async () => {
      signIn();
      MyCoursesServices.listMyCourses.mockResolvedValue({ data: [course] });
      await mountPage();
      expect(page.text()).not.toContain("Enroll");
      expect(page.text()).not.toContain("Drop");
      expect(page.text()).not.toContain("Change section");
    });
  });

  describe("US-7.2 — Keep the course list private to the student", () => {
    async function mountMenu(role) {
      signIn(role);
      ({ wrapper: page } = await mountWithPlugins({ components: { MenuBar }, template: "<v-app><MenuBar /></v-app>" }));
    }
    it("Student sees the My courses link", async () => {
      await mountMenu("student");
      const link = page.findAll("a").find((item) => item.text() === "My courses");
      expect(link).toBeTruthy();
      expect(link.attributes("href")).toBe("/my-courses");
    });
    it("Admin does not see the My courses link", async () => {
      await mountMenu("admin");
      expect(page.findAll("a").some((item) => item.text() === "My courses")).toBe(false);
    });
    it("Student can open the My courses page", async () => {
      signIn();
      await router.push("/my-courses");
      expect(router.currentRoute.value.name).toBe("my-courses");
      expect(router.currentRoute.value.matched[0].components.default).toBe(MyCourses);
    });
    it("Signed-out user is sent to Login", async () => {
      await router.push("/my-courses");
      expect(router.currentRoute.value.name).toBe("login");
    });
    it("Admin is sent to Home", async () => {
      signIn("admin");
      await router.push("/my-courses");
      expect(router.currentRoute.value.name).toBe("home");
    });
  });
});
