/**
 * Feature 9 — Student Management
 * Spec: features/feature-9-student-management.md
 */
import { describe, it, expect, vi, beforeEach } from "vitest";
import { flushPromises } from "@vue/test-utils";
import Students from "../src/views/Students.vue";
import MenuBar from "../src/components/MenuBar.vue";
import StudentServices from "../src/services/studentServices.js";
import router from "../src/router.js";
import { mountWithPlugins } from "./testUtils.js";

vi.mock("../src/services/studentServices.js", () => ({
  default: {
    listStudents: vi.fn(),
    createStudent: vi.fn(),
    updateStudent: vi.fn(),
    deleteStudent: vi.fn(),
  },
}));

const student = {
  id: 4,
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  universityId: "123456",
  userName: "jdoe",
  role: "student",
};

function signIn(role) {
  localStorage.setItem("user", JSON.stringify({ token: `${role}-token`, role }));
}

async function mountPage() {
  const Page = { components: { Students }, template: "<v-app><Students /></v-app>" };
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

async function fillStudent(wrapper, includePassword = true) {
  await fill(wrapper, "firstName", "Jane");
  await fill(wrapper, "lastName", "Doe");
  await fill(wrapper, "email", "jane@example.com");
  await fill(wrapper, "universityId", "123456");
  await fill(wrapper, "userName", "jdoe");
  if (includePassword) await fill(wrapper, "password", "password123");
}

beforeEach(async () => {
  document.body.querySelectorAll(".v-overlay-container, .v-overlay").forEach((node) => node.remove());
  localStorage.clear();
  vi.clearAllMocks();
  StudentServices.listStudents.mockResolvedValue({ data: [student] });
  await router.push({ name: "login" });
  await router.isReady();
});

describe("Feature 9 — Student Management", () => {
  describe("US-9.1 — Add a student", () => {
    it("Admin adds a student from the Students page", async () => {
      signIn("admin");
      StudentServices.listStudents
        .mockResolvedValueOnce({ data: [] })
        .mockResolvedValue({ data: [student] });
      StudentServices.createStudent.mockResolvedValue({ data: student });
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Add student");
      await fillStudent(wrapper);
      await clickLabeled(wrapper, "Save");

      expect(StudentServices.createStudent).toHaveBeenCalledWith({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        universityId: "123456",
        userName: "jdoe",
        password: "password123",
      });
      expect(document.querySelector(".v-overlay--active")).toBeNull();
      expect(wrapper.text()).toContain("jdoe");
    });

    it("Student form blocks submit when a required field is empty", async () => {
      signIn("admin");
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Add student");
      await clickLabeled(wrapper, "Save");

      expect(document.body.textContent).toContain("First name is required.");
      expect(StudentServices.createStudent).not.toHaveBeenCalled();
      expect(StudentServices.updateStudent).not.toHaveBeenCalled();
    });

    it("Save shows a loading state while saving", async () => {
      signIn("admin");
      StudentServices.createStudent.mockReturnValue(new Promise(() => {}));
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Add student");
      await fillStudent(wrapper);
      const save = [...document.querySelectorAll('[data-testid="save-student"]')].at(-1);
      save.click();
      await flushPromises();

      expect(save.classList.contains("v-btn--loading")).toBe(true);
    });

    it("Students page shows the API error when a save fails", async () => {
      signIn("admin");
      StudentServices.createStudent.mockRejectedValue({
        response: { data: { message: "Username is already taken." } },
      });
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Add student");
      await fillStudent(wrapper);
      await clickLabeled(wrapper, "Save");

      expect(document.body.textContent).toContain("Username is already taken.");
    });

    it("Students page shows a fallback error when a save fails without a message", async () => {
      signIn("admin");
      StudentServices.createStudent.mockRejectedValue(new Error("Network Error"));
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Add student");
      await fillStudent(wrapper);
      await clickLabeled(wrapper, "Save");

      expect(document.body.textContent).toContain("Request failed.");
    });
  });

  describe("US-9.2 — View students", () => {
    it("Students page shows a loading state", async () => {
      signIn("admin");
      StudentServices.listStudents.mockReturnValue(new Promise(() => {}));
      const { wrapper } = await mountPage();

      expect(wrapper.text()).toContain("Loading students...");
    });

    it("Students page shows a message when no students exist", async () => {
      signIn("admin");
      StudentServices.listStudents.mockResolvedValue({ data: [] });
      const { wrapper } = await mountPage();

      expect(wrapper.text()).toContain("No students found.");
    });

    it("Students page shows the API error when the list fails", async () => {
      signIn("admin");
      StudentServices.listStudents.mockRejectedValue({
        response: { data: { message: "Students are unavailable." } },
      });
      const { wrapper } = await mountPage();

      expect(wrapper.text()).toContain("Students are unavailable.");
      expect(wrapper.text()).not.toContain("No students found.");
    });

    it("Students page shows a fallback error when the API gives no message", async () => {
      signIn("admin");
      StudentServices.listStudents.mockRejectedValue(new Error("Network Error"));
      const { wrapper } = await mountPage();

      expect(wrapper.text()).toContain("Request failed.");
      expect(wrapper.text()).not.toContain("No students found.");
    });
  });

  describe("US-9.3 — Update a student", () => {
    it("Admin edits a student from the Students page", async () => {
      signIn("admin");
      StudentServices.updateStudent.mockResolvedValue({ data: {} });
      StudentServices.listStudents
        .mockResolvedValueOnce({ data: [student] })
        .mockResolvedValue({ data: [{ ...student, firstName: "Janet" }] });
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Edit");
      expect(document.querySelector('[data-testid="password"]')).toBeNull();
      await fill(wrapper, "firstName", "Janet");
      await clickLabeled(wrapper, "Save");

      expect(StudentServices.updateStudent).toHaveBeenCalledWith(4, {
        firstName: "Janet",
        lastName: "Doe",
        email: "jane@example.com",
        universityId: "123456",
        userName: "jdoe",
      });
      expect(document.querySelector(".v-overlay--active")).toBeNull();
      expect(wrapper.text()).toContain("Janet");
    });
  });

  describe("US-9.4 — Delete a student", () => {
    it("Admin deletes a student from the Students page", async () => {
      signIn("admin");
      StudentServices.deleteStudent.mockResolvedValue({ data: { message: "Student deleted successfully." } });
      StudentServices.listStudents
        .mockResolvedValueOnce({ data: [student] })
        .mockResolvedValue({ data: [] });
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Delete");

      expect(StudentServices.deleteStudent).toHaveBeenCalledWith(4);
      expect(wrapper.text()).not.toContain("jdoe");
      expect(wrapper.text()).toContain("No students found.");
    });

    it("Students page shows the API error when a delete fails", async () => {
      signIn("admin");
      StudentServices.deleteStudent.mockRejectedValue({
        response: { data: { message: "Student with id=4 not found." } },
      });
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Delete");

      expect(wrapper.text()).toContain("Student with id=4 not found.");
      expect(wrapper.text()).toContain("jdoe");
    });

    it("Students page shows a fallback error when a delete fails without a message", async () => {
      signIn("admin");
      StudentServices.deleteStudent.mockRejectedValue(new Error("Network Error"));
      const { wrapper } = await mountPage();

      await clickLabeled(wrapper, "Delete");

      expect(wrapper.text()).toContain("Request failed.");
      expect(wrapper.text()).toContain("jdoe");
    });
  });

  describe("US-9.5 — Restrict student management to admins", () => {
    it("Admin sees student change actions", async () => {
      signIn("admin");
      const { wrapper } = await mountPage();

      expect(wrapper.find('[data-testid="create-student"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="edit-student"]').exists()).toBe(true);
      expect(wrapper.find('[data-testid="delete-student"]').exists()).toBe(true);
    });

    it("Admin sees the Students link", async () => {
      signIn("admin");
      const shell = { components: { MenuBar }, template: "<v-app><MenuBar /></v-app>" };
      const { wrapper } = await mountWithPlugins(shell);

      const link = wrapper.findAll("a").find((item) => item.text() === "Students");
      expect(link).toBeTruthy();
      expect(link.attributes("href")).toBe("/students");
    });

    it("Student does not see the Students link", async () => {
      signIn("student");
      const shell = { components: { MenuBar }, template: "<v-app><MenuBar /></v-app>" };
      const { wrapper } = await mountWithPlugins(shell);

      expect(wrapper.findAll("a").some((item) => item.text() === "Students")).toBe(false);
    });

    it("Student is sent to Home", async () => {
      signIn("student");
      await router.push({ name: "students" });
      expect(router.currentRoute.value.name).toBe("home");
    });

    it("Signed-out user is sent to Login", async () => {
      await router.push({ name: "students" });
      expect(router.currentRoute.value.name).toBe("login");
    });
  });
});
