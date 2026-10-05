/**
 * Feature 6 — Enrollment Management
 * Spec: features/feature-6-enrollment-management.md
 */
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../server.js";
import db from "../app/models/index.js";

let student, other, admin, token, adminToken;
const url = "/course-t6/enrollments";
const duplicate = "You are already enrolled in this section.";

async function makeUser(userName, role = "student") {
  const user = await db.user.create({
    firstName: userName, lastName: "Test", email: `${userName}@example.test`,
    universityId: userName, userName, password: "unused-test-hash", role,
  });
  const token = jwt.sign({ userId: user.id }, process.env.AUTH_SECRET, { expiresIn: 3600 });
  await db.session.create({ userId: user.id, email: user.email, token, expirationDate: new Date(Date.now() + 3600000) });
  return { user, token };
}

beforeEach(async () => {
  if (!/test/i.test(process.env.DB_NAME)) throw new Error("Expected a dedicated test database");
  await db.sequelize.sync({ force: true });
  ({ user: student, token } = await makeUser("student"));
  ({ user: other } = await makeUser("other"));
  ({ user: admin, token: adminToken } = await makeUser("admin", "admin"));
  await db.semester.create({ id: 1, semsterName: "Fall 2026", startDate: "2026-08-17", endDate: "2026-12-11" });
  await db.course.create({ id: 1, courseNumber: "CMSC-4123", courseName: "Software Engineering IV", courseDescription: "Team project", courseSemesters: "Fall", courseFrequency: "Yearly", courseHours: "3", courseDept: "CMSC" });
  await db.faculty.create({ id: 1, firstName: "Ada", lastName: "Lovelace", dept: "CMSC" });
  for (const id of [1, 2, 3]) {
    await db.section.create({ id, semesterId: 1, courseId: 1, facultyId: 1, sectionNumber: `0${id}`, daysOfWeek: "MWF", startTime: "09:00", endTime: "09:50" });
  }
});
afterAll(() => db.sequelize.close());

function api(method, path = url, body = {}, auth = token) {
  const req = request(app)[method](path);
  if (auth) req.set("Authorization", `Bearer ${auth}`);
  return req.send(body);
}
function seed(sectionId = 1, studentId = student.id) {
  return db.enrollment.create({ sectionId, studentId });
}
function expectError(response, status, message) {
  expect(response.status).toBe(status);
  expect(response.body).toEqual({ message });
}

// Every named acceptance scenario below matches the specification's coverage map.
describe("Feature 6 — Enrollment Management", () => {
  describe("US-6.2 — Enroll in a section", () => {
    it("Student enrolls in a section successfully", async () => {
      const response = await api("post", url, { sectionId: 1 });
      expect(response.status).toBe(201);
      expect(response.body).toEqual({ id: expect.any(Number), sectionId: 1, studentId: student.id, createdAt: expect.any(String), updatedAt: expect.any(String) });
      expect((await db.enrollment.findByPk(response.body.id)).sectionId).toBe(1);
      expect(await db.enrollment.count()).toBe(1);
    });
    it("Supplied student ID does not override authenticated student", async () => {
      const response = await api("post", url, { sectionId: 1, studentId: other.id });
      expect(response.status).toBe(201);
      expect(response.body.studentId).toBe(student.id);
      expect(await db.enrollment.count({ where: { studentId: other.id } })).toBe(0);
    });
    it.each([
      ["Student submits enrollment without section ID", {}, 400, "Section id is required."],
      ["Student submits a non-numeric section ID", { sectionId: "abc" }, 400, "Section id must be a number."],
      ["Student enrolls in a section that does not exist", { sectionId: 999 }, 404, "Section with id=999 not found."],
    ])("%s", async (_name, body, status, message) => {
      expectError(await api("post", url, body), status, message);
      expect(await db.enrollment.count()).toBe(0);
    });
    it("Student tries to enroll in the same section twice", async () => {
      await seed();
      expectError(await api("post", url, { sectionId: 1 }), 400, duplicate);
      expect(await db.enrollment.count()).toBe(1);
    });
    it("Concurrent enroll requests create only one enrollment (FR-013)", async () => {
      const responses = await Promise.all([api("post", url, { sectionId: 1 }), api("post", url, { sectionId: 1 })]);
      expect(responses.map((r) => r.status).sort()).toEqual([201, 400]);
      expect(responses.find((r) => r.status === 400).body).toEqual({ message: duplicate });
      expect(await db.enrollment.count()).toBe(1);
    });
    it.each([true, [], [1], {}, "1.5", "1abc"])("Rejects malformed section id %j (FR-011)", async (sectionId) => {
      expectError(await api("post", url, { sectionId }), 400, "Section id must be a number.");
      expect(await db.enrollment.count()).toBe(0);
    });
  });

  describe("US-6.3 — View my enrollments", () => {
    it("Student retrieves their own enrollments", async () => {
      const mine = await seed();
      await seed(2, other.id);
      const response = await api("get");
      expect(response.status).toBe(200);
      expect(response.body).toEqual([expect.objectContaining({ id: mine.id, sectionId: 1, studentId: student.id })]);
    });
  });

  describe("US-6.4 — Drop my enrollment", () => {
    it("Student drops their own enrollment", async () => {
      const mine = await seed();
      expectError(await api("delete", `${url}/${mine.id}`), 200, "Enrollment deleted successfully.");
      expect(await db.enrollment.findByPk(mine.id)).toBeNull();
    });
    it("Student submits a non-numeric enrollment ID", async () => {
      expectError(await api("delete", `${url}/abc`), 400, "Enrollment id must be a number.");
    });
    it("Student tries to drop an enrollment that does not exist", async () => {
      expectError(await api("delete", `${url}/999`), 404, "Enrollment with id=999 not found.");
    });
    it("Student tries to drop another student's enrollment", async () => {
      const theirs = await seed(1, other.id);
      expectError(await api("delete", `${url}/${theirs.id}`), 404, `Enrollment with id=${theirs.id} not found.`);
      expect(await db.enrollment.findByPk(theirs.id)).not.toBeNull();
    });
  });

  describe("US-6.5 — Restrict enrollment management to students", () => {
    async function checkRoutes(auth, status, message) {
      const mine = await seed();
      for (const [method, path] of [["post", url], ["get", url], ["put", `${url}/${mine.id}`], ["delete", `${url}/${mine.id}`]]) {
        expectError(await api(method, path, { sectionId: 2 }, auth), status, message);
      }
      expect(await db.enrollment.count()).toBe(1);
      expect((await mine.reload()).sectionId).toBe(1);
    }
    it("Admin cannot access enrollment routes", () => checkRoutes(adminToken, 403, "Student role required."));
    it("Unauthenticated user cannot access enrollment routes", () => checkRoutes(null, 401, "Unauthorized."));
    it("Expired sessions cannot access enrollment routes (FR-023)", async () => {
      await db.session.update({ expirationDate: new Date(0) }, { where: { userId: student.id } });
      await checkRoutes(token, 401, "Unauthorized.");
    });
  });

  describe("US-6.7 — Remove enrollments when their section or student is deleted", () => {
    it("Deleting a section deletes its enrollments", async () => {
      await seed();
      await seed(1, other.id);
      const remaining = await seed(2);
      const response = await api("delete", "/course-t6/sections/1", {}, adminToken);
      expect(response.status).toBe(200);
      expect(await db.enrollment.count({ where: { sectionId: 1 } })).toBe(0);
      expect((await db.enrollment.findAll()).map((row) => row.id)).toEqual([remaining.id]);
    });
    it("Deleting a student deletes their enrollments", async () => {
      await seed();
      await seed(2);
      const remaining = await seed(1, other.id);
      const response = await api("delete", `/course-t6/students/${student.id}`, {}, adminToken);
      expect(response.status).toBe(200);
      expect(await db.enrollment.count({ where: { studentId: student.id } })).toBe(0);
      expect((await db.enrollment.findAll()).map((row) => row.id)).toEqual([remaining.id]);
    });
    it("Database constraints protect uniqueness and cascade direct deletions (data model)", async () => {
      await seed();
      await expect(seed()).rejects.toMatchObject({ name: "SequelizeUniqueConstraintError" });
      await db.section.destroy({ where: { id: 1 } });
      expect(await db.enrollment.count()).toBe(0);
      await seed(2);
      await db.user.destroy({ where: { id: student.id } });
      expect(await db.enrollment.count()).toBe(0);
    });
  });

  describe("US-6.8 — Change my enrollment to another section", () => {
    it("Student changes their enrollment to another section", async () => {
      const mine = await seed();
      const response = await api("put", `${url}/${mine.id}`, { sectionId: 2 });
      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ id: mine.id, studentId: student.id, sectionId: 2 });
      expect((await mine.reload()).sectionId).toBe(2);
      expect(await db.enrollment.count()).toBe(1);
    });
    it("Supplied student ID does not change the enrollment owner", async () => {
      const mine = await seed();
      const response = await api("put", `${url}/${mine.id}`, { sectionId: 2, studentId: other.id });
      expect(response.status).toBe(200);
      expect(response.body.studentId).toBe(student.id);
      expect((await mine.reload()).studentId).toBe(student.id);
    });
    it.each([
      ["Student changes an enrollment without section ID", {}, 400, "Section id is required."],
      ["Student changes an enrollment to a non-numeric section ID", { sectionId: "abc" }, 400, "Section id must be a number."],
      ["Student changes an enrollment to a section that does not exist", { sectionId: 999 }, 404, "Section with id=999 not found."],
    ])("%s", async (_name, body, status, message) => {
      const mine = await seed();
      expectError(await api("put", `${url}/${mine.id}`, body), status, message);
      expect((await mine.reload()).sectionId).toBe(1);
    });
    it("Student changes an enrollment to a section they are already enrolled in", async () => {
      const mine = await seed();
      await seed(2);
      expectError(await api("put", `${url}/${mine.id}`, { sectionId: 2 }), 400, duplicate);
      expect((await mine.reload()).sectionId).toBe(1);
      expect(await db.enrollment.count()).toBe(2);
    });
    it("Student changes an enrollment using a non-numeric enrollment ID", async () => {
      expectError(await api("put", `${url}/abc`, { sectionId: 2 }), 400, "Enrollment id must be a number.");
    });
    it("Student tries to change an enrollment that does not exist", async () => {
      expectError(await api("put", `${url}/999`, { sectionId: 2 }), 404, "Enrollment with id=999 not found.");
    });
    it("Student tries to change another student's enrollment", async () => {
      const theirs = await seed(1, other.id);
      expectError(await api("put", `${url}/${theirs.id}`, { sectionId: 2 }), 404, `Enrollment with id=${theirs.id} not found.`);
      expect((await theirs.reload()).sectionId).toBe(1);
    });
  });
});
