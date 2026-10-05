/**
 * Feature 8 — Section Student Listing
 * Spec: features/feature-8-section-student-listing.md
 */
import request from "supertest";
import app from "../server.js";
import db from "../app/models/index.js";
import { seedAdmin } from "../app/scripts/seed.mjs";

let token;
let grace;

async function registerStudent(firstName, lastName) {
  const userName = `${firstName}.${lastName}`.toLowerCase();
  const response = await request(app).post("/course-t6/register").send({
    firstName, lastName, userName, email: `${userName}@example.com`,
    universityId: firstName === "Grace" ? "100200" : userName,
    password: "password123",
  });
  expect(response.status).toBe(201);
  return response.body;
}

function listStudents(id = 3, sessionToken = token) {
  const req = request(app).get(`/course-t6/sections/${id}/students`);
  return sessionToken ? req.set("Authorization", `Bearer ${sessionToken}`) : req;
}

beforeEach(async () => {
  await db.sequelize.sync({ force: true });
  await seedAdmin();
  const login = await request(app).post("/course-t6/login").send({
    userName: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD,
  });
  expect(login.status).toBe(200);
  token = login.body.token;
  await db.semester.create({ id: 1, semsterName: "Fall 2026", startDate: "2026-08-17", endDate: "2026-12-11" });
  await db.course.create({
    id: 1, courseNumber: "CMSC 4113", courseName: "Software Engineering IV",
    courseDescription: "Team project", courseSemesters: "Fall", courseFrequency: "Every year",
    courseHours: "3", courseDept: "CMSC",
  });
  await db.faculty.create({ id: 1, firstName: "Ada", lastName: "Lovelace", dept: "CMSC" });
  for (const id of [3, 4]) {
    await db.section.create({ id, sectionNumber: id === 3 ? "01" : "02", semesterId: 1,
      courseId: 1, facultyId: 1, daysOfWeek: "MWF", startTime: "09:00", endTime: "09:50" });
  }
  grace = await registerStudent("Grace", "Hopper");
});

afterAll(async () => { await db.sequelize.close(); });

describe("Feature 8 — Section Student Listing", () => {
  describe("US-8.1 — View the students enrolled in a section", () => {
    it("Admin views the students enrolled in a section", async () => {
      await db.enrollment.create({ sectionId: 3, studentId: grace.id });
      const response = await listStudents();
      expect(response.status).toBe(200);
      expect(response.body).toEqual({
        section: { id: 3, sectionNumber: "01", courseNumber: "CMSC 4113", courseName: "Software Engineering IV", semsterName: "Fall 2026" },
        students: [{ id: grace.id, firstName: "Grace", lastName: "Hopper", universityId: "100200", email: "grace.hopper@example.com" }],
      });
    });

    it("Section students are sorted by last name, then first name", async () => {
      const alan = await registerStudent("Alan", "Turing");
      const ada = await registerStudent("Ada", "Hopper");
      for (const student of [alan, grace, ada]) await db.enrollment.create({ sectionId: 3, studentId: student.id });
      const before = await db.enrollment.findAll({ raw: true, order: [["id", "ASC"]] });
      const response = await listStudents();
      expect(response.status).toBe(200);
      expect(response.body.students.map(student => `${student.firstName} ${student.lastName}`))
        .toEqual(["Ada Hopper", "Grace Hopper", "Alan Turing"]);
      expect(await db.enrollment.findAll({ raw: true, order: [["id", "ASC"]] })).toEqual(before);
    });

    it("Section student list does not include students from other sections", async () => {
      const alan = await registerStudent("Alan", "Turing");
      await db.enrollment.create({ sectionId: 3, studentId: grace.id });
      await db.enrollment.create({ sectionId: 4, studentId: alan.id });
      const response = await listStudents();
      expect(response.status).toBe(200);
      expect(response.body.students.map(student => student.id)).toEqual([grace.id]);
    });

    it("Section student list does not include passwords", async () => {
      await db.enrollment.create({ sectionId: 3, studentId: grace.id });
      expect((await db.user.unscoped().findByPk(grace.id)).password).toBeTruthy();
      const response = await listStudents();
      expect(response.status).toBe(200);
      expect(response.body.students).toHaveLength(1);
      for (const student of response.body.students) {
        expect(student).not.toHaveProperty("password");
        expect(Object.keys(student).sort()).toEqual(["email", "firstName", "id", "lastName", "universityId"]);
      }
    });

    it("Admin views a section with no students", async () => {
      const response = await listStudents();
      expect(response.status).toBe(200);
      expect(response.body.section.id).toBe(3);
      expect(response.body.students).toEqual([]);
    });

    it("Admin views the students of a section that does not exist", async () => {
      for (const id of [999, -1, 0]) {
        const response = await listStudents(id);
        expect(response.status).toBe(404);
        expect(response.body).toEqual({ message: `Section with id=${id} not found.` });
      }
    });

    it("Admin views the students of a section with an id that is not a number", async () => {
      for (const id of ["abc", "3abc", "1.5"]) {
        const response = await listStudents(id);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message: "Section id must be a number." });
      }
    });
  });

  describe("US-8.2 — Restrict section student lists to admins", () => {
    it("Student cannot view a section's students", async () => {
      await db.enrollment.create({ sectionId: 3, studentId: grace.id });
      const login = await request(app).post("/course-t6/login").send({ userName: "grace.hopper", password: "password123" });
      for (const id of [3, 4, 999, "abc"]) {
        const response = await listStudents(id, login.body.token).query({ role: "admin" });
        expect(response.status).toBe(403);
        expect(response.body).toEqual({ message: "Admin role required." });
      }
    });

    it("Unauthenticated user cannot view a section's students", async () => {
      for (const sessionToken of [null, "invalid-token"]) {
        const response = await listStudents(3, sessionToken);
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "Unauthorized." });
      }
      await db.session.update({ expirationDate: new Date(Date.now() - 1000) }, { where: { token } });
      const expired = await listStudents();
      expect(expired.status).toBe(401);
      expect(expired.body).toEqual({ message: "Unauthorized." });
    });
  });
});
