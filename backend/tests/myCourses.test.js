/**
 * Feature 7 — Student Course Listing
 * Spec: features/feature-7-student-course-listing.md
 */
import request from "supertest";
import jwt from "jsonwebtoken";
import app from "../server.js";
import db from "../app/models/index.js";

let student, other, token, adminToken;
const url = "/course-t6/my-courses";

async function makeUser(userName, role = "student") {
  const user = await db.user.create({
    firstName: userName, lastName: "Test", email: `${userName}@example.test`,
    universityId: userName, userName, password: "unused-test-hash", role,
  });
  const sessionToken = jwt.sign({ userId: user.id }, process.env.AUTH_SECRET, { expiresIn: 3600 });
  await db.session.create({ userId: user.id, email: user.email, token: sessionToken, expirationDate: new Date(Date.now() + 3600000) });
  return { user, token: sessionToken };
}

beforeEach(async () => {
  if (!/test/i.test(process.env.DB_NAME)) throw new Error("Expected a dedicated test database");
  await db.sequelize.sync({ force: true });
  ({ user: student, token } = await makeUser("student"));
  ({ user: other } = await makeUser("other"));
  ({ token: adminToken } = await makeUser("admin", "admin"));
  await db.semester.create({ id: 1, semsterName: "Fall 2026", startDate: "2026-08-17", endDate: "2026-12-11" });
  await db.course.create({ id: 1, courseNumber: "CMSC-4123", courseName: "Software Engineering IV", courseDescription: "Team project", courseSemesters: "Fall", courseFrequency: "Yearly", courseHours: "3", courseDept: "CMSC" });
  await db.course.create({ id: 2, courseNumber: "CMSC-1111", courseName: "Programming I", courseDescription: "Intro", courseSemesters: "Fall", courseFrequency: "Yearly", courseHours: "3", courseDept: "CMSC" });
  await db.faculty.create({ id: 1, firstName: "Ada", lastName: "Lovelace", dept: "CMSC" });
  await db.section.create({ id: 1, semesterId: 1, courseId: 1, facultyId: 1, sectionNumber: "01", daysOfWeek: "MWF", startTime: "09:00", endTime: "09:50" });
  await db.section.create({ id: 2, semesterId: 1, courseId: 2, facultyId: 1, sectionNumber: "02", daysOfWeek: "TR", startTime: "10:00", endTime: "11:15" });
});
afterAll(() => db.sequelize.close());

function get(auth = token, query = "") {
  const req = request(app).get(`${url}${query}`);
  if (auth) req.set("Authorization", `Bearer ${auth}`);
  return req;
}

describe("Feature 7 — Student Course Listing", () => {
  describe("US-7.1 — View my enrolled sections", () => {
    it("Student views an enrolled section", async () => {
      const enrollment = await db.enrollment.create({ sectionId: 1, studentId: student.id });
      const response = await get();
      expect(response.status).toBe(200);
      expect(response.body).toEqual([{
        enrollmentId: enrollment.id,
        courseNumber: "CMSC-4123",
        courseName: "Software Engineering IV",
        sectionNumber: "01",
        semsterName: "Fall 2026",
        daysOfWeek: "MWF",
        startTime: "09:00",
        endTime: "09:50",
        instructorName: "Ada Lovelace",
      }]);
    });

    it("Student views an empty course list", async () => {
      const response = await get();
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("Student views more than one enrolled section", async () => {
      await db.enrollment.create({ sectionId: 1, studentId: student.id });
      await db.enrollment.create({ sectionId: 2, studentId: student.id });
      const response = await get();
      expect(response.status).toBe(200);
      expect(response.body.map((item) => item.sectionNumber).sort()).toEqual(["01", "02"]);
    });

    it("Student does not see another student's section", async () => {
      await db.enrollment.create({ sectionId: 1, studentId: other.id });
      const response = await get();
      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });

    it("Supplied student id does not change the list", async () => {
      const mine = await db.enrollment.create({ sectionId: 1, studentId: student.id });
      await db.enrollment.create({ sectionId: 2, studentId: other.id });
      const response = await get(token, `?studentId=${other.id}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual([expect.objectContaining({ enrollmentId: mine.id, sectionNumber: "01" })]);
    });
  });

  describe("US-7.2 — Keep the course list private to the student", () => {
    it("Admin cannot view the course list", async () => {
      const response = await get(adminToken);
      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Student role required." });
    });

    it("Unauthenticated user cannot view the course list", async () => {
      const response = await get(null);
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Unauthorized." });
    });
  });
});
