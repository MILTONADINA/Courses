/**
 * Feature 3 — Course Management
 * Spec: features/feature-3-course-management.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Courses from "../src/views/Courses.vue";
import MenuBar from "../src/components/MenuBar.vue";
import CourseServices from "../src/services/courseServices.js";
import router from "../src/router.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/courseServices.js", () => ({
  default: {
    listCourses: vi.fn(),
    createCourse: vi.fn(),
    updateCourse: vi.fn(),
    deleteCourse: vi.fn(),
  },
}));

const course = {
  id: 1,
  courseNumber: "CMSC-4123",
  courseName: "Software Engineering IV",
  courseDescription: "Team project course",
  courseSemesters: "Fall",
  courseFrequency: "Every year",
  courseHours: "3",
  courseDept: "CMSC",
};

function signIn(role) {
  localStorage.setItem("user", JSON.stringify({ token: `${role}-token`, role }));
}

async function mountPage() {
  const Page = { components: { Courses }, template: "<v-app><Courses /></v-app>" };
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

async function fillCourse(wrapper) {
  await fill(wrapper, "courseNumber", course.courseNumber);
  await fill(wrapper, "courseName", course.courseName);
  await fill(wrapper, "courseDescription", course.courseDescription);
  await fill(wrapper, "courseSemesters", course.courseSemesters);
  await fill(wrapper, "courseFrequency", course.courseFrequency);
  await fill(wrapper, "courseHours", course.courseHours);
  await fill(wrapper, "courseDept", course.courseDept);
}

beforeEach(async () => {
  document.body.querySelectorAll(".v-overlay-container, .v-overlay").forEach((node) => node.remove());
  localStorage.clear();
  vi.clearAllMocks();
  CourseServices.listCourses.mockResolvedValue({ data: [course] });
  await router.push({ name: "login" });
  await router.isReady();
});

describe("Feature 3 — Course Management", () => {
  describe("US-3.1 — Create a course", () => {
    it("Admin creates a course from the Courses page", async () => {
      signIn("admin");
      CourseServices.listCourses
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValue({ data: [course] });
      CourseServices.createCourse.mockResolvedValue({ data: course });
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Add course");
      await fillCourse(wrapper);
      await clickLabeled(wrapper, "Save");

      expect(CourseServices.createCourse).toHaveBeenCalledWith({
        courseNumber: course.courseNumber,
        courseName: course.courseName,
        courseDescription: course.courseDescription,
        courseSemesters: course.courseSemesters,
        courseFrequency: course.courseFrequency,
        courseHours: course.courseHours,
        courseDept: course.courseDept,
      });
      expect(document.querySelector(".v-overlay--active")).toBeNull();
      expect(wrapper.text()).toContain("Software Engineering IV");
    });

    it("Course form blocks submit when a required field is empty", async () => {
      signIn("admin");
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Add course");
      await clickLabeled(wrapper, "Save");

      expect(document.body.textContent).toContain("Course number is required.");
      expect(CourseServices.createCourse).not.toHaveBeenCalled();
      expect(CourseServices.updateCourse).not.toHaveBeenCalled();
    });

    it("Save shows a loading state while saving", async () => {
      signIn("admin");
      CourseServices.createCourse.mockReturnValue(new Promise(() => {}));
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Add course");
      await fillCourse(wrapper);
      const save = [...document.querySelectorAll('[data-testid="save-course"]')].at(-1);
      save.click();
      await flushPromises();

      expect(save.classList.contains("v-btn--loading")).toBe(true);
    });

    it("Courses page shows the API error when a save fails", async () => {
      signIn("admin");
      CourseServices.createCourse.mockRejectedValue({
        response: { data: { message: "Course number is required." } },
      });
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Add course");
      await fillCourse(wrapper);
      await clickLabeled(wrapper, "Save");

      expect(document.body.textContent).toContain("Course number is required.");
    });

    it("Courses page shows a fallback error when a save fails without a message", async () => {
      signIn("admin");
      CourseServices.createCourse.mockRejectedValue(new Error("Network Error"));
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Add course");
      await fillCourse(wrapper);
      await clickLabeled(wrapper, "Save");

      expect(document.body.textContent).toContain("Request failed.");
    });
  });

  describe("US-3.2 — View courses", () => {
    it("Courses page shows a loading state", async () => {
      signIn("admin");
      CourseServices.listCourses.mockReturnValue(new Promise(() => {}));
      const { wrapper } = await mountPage();

      expect(wrapper.text()).toContain("Loading courses...");
    });

    it("Courses page shows a message when no courses exist", async () => {
      signIn("admin");
      CourseServices.listCourses.mockResolvedValue({ data: [] });
      const { wrapper } = await mountPage();

      expect(wrapper.text()).toContain("No courses found.");
    });

    it("Courses page shows the API error when the list fails", async () => {
      signIn("admin");
      CourseServices.listCourses.mockRejectedValue({
        response: { data: { message: "Courses are unavailable." } },
      });
      const { wrapper } = await mountPage();

      expect(wrapper.text()).toContain("Courses are unavailable.");
    });

    it("Courses page shows a fallback error when the API gives no message", async () => {
      signIn("admin");
      CourseServices.listCourses.mockRejectedValue(new Error("Network Error"));
      const { wrapper } = await mountPage();

      expect(wrapper.text()).toContain("Request failed.");
    });
  });

  describe("US-3.3 — Update a course", () => {
    it("Admin edits a course from the Courses page", async () => {
      signIn("admin");
      CourseServices.updateCourse.mockResolvedValue({ data: {} });
      CourseServices.listCourses
        .mockResolvedValueOnce({ data: [course] })
        .mockResolvedValue({ data: [{ ...course, courseName: "Intro" }] });
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Edit");
      await fill(wrapper, "courseName", "Intro");
      await clickLabeled(wrapper, "Save");

      expect(CourseServices.updateCourse).toHaveBeenCalledWith(1, {
        courseNumber: course.courseNumber,
        courseName: "Intro",
        courseDescription: course.courseDescription,
        courseSemesters: course.courseSemesters,
        courseFrequency: course.courseFrequency,
        courseHours: course.courseHours,
        courseDept: course.courseDept,
      });
      expect(document.querySelector(".v-overlay--active")).toBeNull();
      expect(wrapper.text()).toContain("Intro");
    });
  });

  describe("US-3.4 — Delete a course", () => {
    it("Admin deletes a course from the Courses page", async () => {
      signIn("admin");
      CourseServices.deleteCourse.mockResolvedValue({ data: { message: "Course deleted successfully." } });
      CourseServices.listCourses
        .mockResolvedValueOnce({ data: [course] })
        .mockResolvedValue({ data: [] });
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Delete");

      expect(CourseServices.deleteCourse).toHaveBeenCalledWith(1);
      expect(wrapper.text()).not.toContain("Software Engineering IV");
      expect(wrapper.text()).toContain("No courses found.");
    });

    it("Courses page shows the API error when a delete fails", async () => {
      signIn("admin");
      CourseServices.deleteCourse.mockRejectedValue({
        response: { data: { message: "Course with id=1 not found." } },
      });
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Delete");

      expect(wrapper.text()).toContain("Course with id=1 not found.");
      expect(wrapper.text()).toContain("Software Engineering IV");
    });

    it("Courses page shows a fallback error when a delete fails without a message", async () => {
      signIn("admin");
      CourseServices.deleteCourse.mockRejectedValue(new Error("Network Error"));
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Delete");

      expect(wrapper.text()).toContain("Request failed.");
      expect(wrapper.text()).toContain("Software Engineering IV");
    });
  });

  describe("US-3.5 — Restrict course management to admins", () => {
    it("Admin sees course change actions", async () => {
      signIn("admin");
      const { wrapper } = await mountPage();

      expect(wrapper.find('[data-testid="create-course"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="edit-course"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="delete-course"]').exists()).toBe(true);
    });

    it("Admin sees the Courses link", async () => {
      signIn("admin");
      const shell = { components: { MenuBar }, template: "<v-app><MenuBar /></v-app>" };
      const { wrapper } = await mountWithPlugins(shell);

      const link = wrapper.findAll("a").find((item) => item.text() === "Courses");
      expect(link).toBeTruthy();
      expect(link.attributes("href")).toBe("/courses");
    });

    it("Student does not see the Courses link", async () => {
      signIn("student");
      const shell = { components: { MenuBar }, template: "<v-app><MenuBar /></v-app>" };
      const { wrapper } = await mountWithPlugins(shell);

      expect(wrapper.findAll("a").some((item) => item.text() === "Courses")).toBe(false);
    });

    it("Student is sent to Home", async () => {
      signIn("student");
      await router.push({ name: "courses" });
      expect(router.currentRoute.value.name).toBe("home");
    });

    it("Signed-out user is sent to Login", async () => {
      await router.push({ name: "courses" });
      expect(router.currentRoute.value.name).toBe("login");
    });
  });
});
