/**
 * Feature 5 - Section Management
 * Spec: features/feature-5-section-management.md
 */
import request from "supertest";
import app from "../server.js";
import db from "../app/models/index.js";
import { seedAdmin } from "../app/scripts/seed.mjs";

const studentRegistration = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  universityId: "123456",
  userName: "jdoe",
  password: "password123",
};

const courseDetails = {
  courseDescription: "Team project course",
  courseSemesters: "Fall",
  courseFrequency: "Every year",
  courseHours: "3",
  courseDept: "CMSC",
};

const section = {
  sectionNumber: "01",
  semesterId: 2,
  courseId: 3,
  facultyId: 4,
  daysOfWeek: "MWF",
  startTime: "09:00",
  endTime: "09:50",
};

beforeEach(async () => {
  await db.sequelize.sync({ force: true });
});

afterAll(async () => {
  await db.sequelize.close();
});

async function adminToken() {
  await seedAdmin();
  const response = await request(app).post("/course-t6/login").send({
    userName: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD,
  });
  return response.body.token;
}

async function studentToken() {
  await request(app).post("/course-t6/register").send(studentRegistration);
  const response = await request(app).post("/course-t6/login").send({
    userName: studentRegistration.userName,
    password: studentRegistration.password,
  });
  return response.body.token;
}

function authed(token) {
  return { Authorization: `Bearer ${token}` };
}

async function seedReferences() {
  await db.semester.create({ id: 1, semsterName: "Spring 2026", startDate: "2026-01-12", endDate: "2026-05-08" });
  await db.semester.create({ id: 2, semsterName: "Fall 2026", startDate: "2026-08-17", endDate: "2026-12-11" });
  await db.course.create({ id: 3, courseNumber: "CMSC-4123", courseName: "Software Engineering IV", ...courseDetails });
  await db.course.create({ id: 5, courseNumber: "CMSC-1113", courseName: "Programming I", ...courseDetails });
  await db.faculty.create({ id: 4, firstName: "Ada", lastName: "Lovelace", dept: "Computer Science" });
}

async function seedSection(values = {}) {
  return db.section.create({ ...section, ...values });
}

function createSection(token, body = section) {
  return request(app).post("/course-t6/sections").set(authed(token)).send(body);
}

describe("Feature 5 - Section Management", () => {
  describe("US-5.1 - Add a section", () => {
    it("Admin adds a section successfully", async () => {
      const token = await adminToken();
      await seedReferences();
      const response = await createSection(token);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        id: expect.any(Number),
        ...section,
        semester: { id: 2, semsterName: "Fall 2026" },
        course: { id: 3, courseNumber: "CMSC-4123", courseName: "Software Engineering IV" },
        faculty: { id: 4, firstName: "Ada", lastName: "Lovelace" },
      });
      expect(await db.section.count()).toBe(1);
    });

    it("Admin adds a section without a required field", async () => {
      const token = await adminToken();
      await seedReferences();
      const { sectionNumber, ...rest } = section;
      const response = await createSection(token, rest);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Section number is required." });
      expect(await db.section.count()).toBe(0);
    });

    it("Admin adds a section with a whitespace-only section number", async () => {
      const token = await adminToken();
      await seedReferences();
      const response = await createSection(token, { ...section, sectionNumber: "   " });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Section number is required." });
      expect(await db.section.count()).toBe(0);
    });

    it("Admin adds a section with a semester id that is not a number", async () => {
      const token = await adminToken();
      await seedReferences();
      const response = await createSection(token, { ...section, semesterId: "abc" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Semester id must be a number." });
      expect(await db.section.count()).toBe(0);
    });

    it("Admin adds a section with a course id that is not a number", async () => {
      const token = await adminToken();
      await seedReferences();
      const response = await createSection(token, { ...section, courseId: "abc" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Course id must be a number." });
      expect(await db.section.count()).toBe(0);
    });

    it("Admin adds a section with a faculty member id that is not a number", async () => {
      const token = await adminToken();
      await seedReferences();
      const response = await createSection(token, { ...section, facultyId: "abc" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Faculty member id must be a number." });
      expect(await db.section.count()).toBe(0);
    });

    it("Admin adds a section for a semester that does not exist", async () => {
      const token = await adminToken();
      await seedReferences();
      const response = await createSection(token, { ...section, semesterId: 999 });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Semester with id=999 not found." });
      expect(await db.section.count()).toBe(0);
    });

    it("Admin adds a section for a course that does not exist", async () => {
      const token = await adminToken();
      await seedReferences();
      const response = await createSection(token, { ...section, courseId: 999 });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Course with id=999 not found." });
      expect(await db.section.count()).toBe(0);
    });

    it("Admin adds a section for a faculty member that does not exist", async () => {
      const token = await adminToken();
      await seedReferences();
      const response = await createSection(token, { ...section, facultyId: 999 });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Faculty member with id=999 not found." });
      expect(await db.section.count()).toBe(0);
    });

    it("Admin adds a section with a time that is not in HH:MM format", async () => {
      const token = await adminToken();
      await seedReferences();
      const response = await createSection(token, { ...section, startTime: "9am" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Start time must be in HH:MM format." });
      expect(await db.section.count()).toBe(0);
    });
  });

  describe("US-5.2 - View sections", () => {
    it("Admin views the section list", async () => {
      const token = await adminToken();
      await seedReferences();
      await seedSection({ semesterId: 2, courseId: 3, sectionNumber: "02" });
      await seedSection({ semesterId: 1, courseId: 3, sectionNumber: "01" });
      await seedSection({ semesterId: 2, courseId: 3, sectionNumber: "01" });
      await seedSection({ semesterId: 1, courseId: 5, sectionNumber: "01" });
      const response = await request(app).get("/course-t6/sections").set(authed(token));

      expect(response.status).toBe(200);
      expect(
        response.body.map((item) => [item.semester.semsterName, item.course.courseNumber, item.sectionNumber]),
      ).toEqual([
        ["Spring 2026", "CMSC-1113", "01"],
        ["Spring 2026", "CMSC-4123", "01"],
        ["Fall 2026", "CMSC-4123", "01"],
        ["Fall 2026", "CMSC-4123", "02"],
      ]);
      expect(response.body[0]).toMatchObject({
        course: { courseName: "Programming I" },
        faculty: { firstName: "Ada", lastName: "Lovelace" },
        daysOfWeek: "MWF",
        startTime: "09:00",
        endTime: "09:50",
      });
    });

    it("Admin views the section list when no sections exist", async () => {
      const token = await adminToken();
      const response = await request(app).get("/course-t6/sections").set(authed(token));

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("Student views the sections of a semester", async () => {
      const token = await studentToken();
      await seedReferences();
      await seedSection({ semesterId: 1, sectionNumber: "01" });
      await seedSection({ semesterId: 2, sectionNumber: "02" });
      const response = await request(app).get("/course-t6/sections?semesterId=1").set(authed(token));

      expect(response.status).toBe(200);
      expect(response.body).toHaveLength(1);
      expect(response.body[0]).toMatchObject({
        semesterId: 1,
        sectionNumber: "01",
        daysOfWeek: "MWF",
        startTime: "09:00",
        endTime: "09:50",
        course: { courseNumber: "CMSC-4123", courseName: "Software Engineering IV" },
        faculty: { firstName: "Ada", lastName: "Lovelace" },
      });
    });

    it("User filters sections by a semester id that is not a number", async () => {
      const token = await studentToken();
      const response = await request(app).get("/course-t6/sections?semesterId=abc").set(authed(token));

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Semester id must be a number." });
    });
  });

  describe("US-5.3 - Edit a section", () => {
    it("Admin edits a section successfully", async () => {
      const token = await adminToken();
      await seedReferences();
      await seedSection();
      const changes = { ...section, sectionNumber: "02", daysOfWeek: "TR", startTime: "13:00", endTime: "14:15" };
      const response = await request(app).put("/course-t6/sections/1").set(authed(token)).send(changes);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ id: 1, ...changes });
    });

    it("Admin edits a section without a required field", async () => {
      const token = await adminToken();
      await seedReferences();
      await seedSection();
      const { daysOfWeek, ...rest } = section;
      const response = await request(app).put("/course-t6/sections/1").set(authed(token)).send(rest);
      const saved = await db.section.findByPk(1);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Days of week is required." });
      expect(saved.daysOfWeek).toBe("MWF");
    });

    it("Admin edits a section that does not exist", async () => {
      const token = await adminToken();
      await seedReferences();
      const response = await request(app).put("/course-t6/sections/999").set(authed(token)).send(section);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Section with id=999 not found." });
    });

    it("Admin edits a section with an id that is not a number", async () => {
      const token = await adminToken();
      await seedReferences();
      const response = await request(app).put("/course-t6/sections/abc").set(authed(token)).send(section);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Section id must be a number." });
    });
  });

  describe("US-5.4 - Delete a section", () => {
    it("Admin deletes a section successfully", async () => {
      const token = await adminToken();
      await seedReferences();
      await seedSection();
      const response = await request(app).delete("/course-t6/sections/1").set(authed(token));
      const list = await request(app).get("/course-t6/sections").set(authed(token));

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Section deleted successfully." });
      expect(list.body).toEqual([]);
    });

    it("Admin deletes a section that does not exist", async () => {
      const token = await adminToken();
      const response = await request(app).delete("/course-t6/sections/999").set(authed(token));

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Section with id=999 not found." });
    });

    it("Admin deletes a section with an id that is not a number", async () => {
      const token = await adminToken();
      const response = await request(app).delete("/course-t6/sections/abc").set(authed(token));

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Section id must be a number." });
    });
  });

  describe("US-5.5 - Restrict section changes to admins", () => {
    it("Student cannot add, edit, or delete sections", async () => {
      const token = await studentToken();
      await seedReferences();
      await seedSection();
      const changes = { ...section, daysOfWeek: "TR" };
      const responses = [
        await request(app).post("/course-t6/sections").set(authed(token)).send(section),
        await request(app).put("/course-t6/sections/1").set(authed(token)).send(changes),
        await request(app).delete("/course-t6/sections/1").set(authed(token)),
      ];
      const saved = await db.section.findByPk(1);

      for (const response of responses) {
        expect(response.status).toBe(403);
        expect(response.body).toEqual({ message: "Admin role required." });
      }
      expect(await db.section.count()).toBe(1);
      expect(saved.daysOfWeek).toBe("MWF");
    });

    it("Unauthenticated user cannot view or manage sections", async () => {
      await seedReferences();
      await seedSection();
      const changes = { ...section, daysOfWeek: "TR" };
      const responses = [
        await request(app).get("/course-t6/sections"),
        await request(app).post("/course-t6/sections").send(section),
        await request(app).put("/course-t6/sections/1").send(changes),
        await request(app).delete("/course-t6/sections/1"),
      ];
      const saved = await db.section.findByPk(1);

      for (const response of responses) {
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "Unauthorized." });
      }
      expect(await db.section.count()).toBe(1);
      expect(saved.daysOfWeek).toBe("MWF");
    });
  });

  describe("US-5.6 - Keep sections linked to their semester, course, and faculty member", () => {
    it("Admin cannot delete a semester that has sections", async () => {
      const token = await adminToken();
      await seedReferences();
      await seedSection();
      const response = await request(app).delete("/course-t6/semesters/2").set(authed(token));

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Semester has sections and cannot be deleted." });
      expect(await db.semester.findByPk(2)).not.toBeNull();
      expect(await db.section.findByPk(1)).not.toBeNull();
    });

    it("Admin cannot delete a course that has sections", async () => {
      const token = await adminToken();
      await seedReferences();
      await seedSection();
      const response = await request(app).delete("/course-t6/courses/3").set(authed(token));

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Course has sections and cannot be deleted." });
      expect(await db.course.findByPk(3)).not.toBeNull();
      expect(await db.section.findByPk(1)).not.toBeNull();
    });

    it("Admin cannot delete a faculty member who has sections", async () => {
      const token = await adminToken();
      await seedReferences();
      await seedSection();
      const response = await request(app).delete("/course-t6/faculty/4").set(authed(token));

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Faculty member has sections and cannot be deleted." });
      expect(await db.faculty.findByPk(4)).not.toBeNull();
      expect(await db.section.findByPk(1)).not.toBeNull();
    });
  });
});
