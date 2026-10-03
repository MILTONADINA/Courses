/**
 * Feature 3 — Course Management
 * Spec: features/feature-3-course-management.md
 */
import request from "supertest";
import app from "../server.js";
import db from "../app/models/index.js";
import { seedAdmin } from "../app/scripts/seed.mjs";

const course = {
  courseNumber: "CMSC-4123",
  courseName: "Software Engineering IV",
  courseDescription: "Team project course",
  courseSemesters: "Fall",
  courseFrequency: "Every year",
  courseHours: "3",
  courseDept: "CMSC",
};

const studentRegistration = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  universityId: "123456",
  userName: "jdoe",
  password: "password123",
  confirmPassword: "password123",
};

const requiredFields = [
  ["courseNumber", "Course number is required."],
  ["courseName", "Course name is required."],
  ["courseDescription", "Course description is required."],
  ["courseSemesters", "Course semesters is required."],
  ["courseFrequency", "Course frequency is required."],
  ["courseHours", "Course hours is required."],
  ["courseDept", "Course department is required."],
];

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

function createCourse(token, body = course) {
  return request(app).post("/course-t6/courses").set(authed(token)).send(body);
}

describe("Feature 3 — Course Management", () => {
  describe("US-3.1 — Create a course", () => {
    it("Admin creates a course with valid information", async () => {
      const token = await adminToken();
      const response = await createCourse(token);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(course);
      expect(response.body.id).toEqual(expect.any(Number));
    });

    it("Admin creates a course without a required field", async () => {
      const token = await adminToken();
      for (const [field, message] of requiredFields) {
        const response = await createCourse(token, { ...course, [field]: "" });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message });
      }
      expect(await db.course.count()).toBe(0);
    });

    it("Admin submits a whitespace-only course name", async () => {
      const token = await adminToken();
      const response = await createCourse(token, { ...course, courseName: "   " });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Course name is required." });
      expect(await db.course.count()).toBe(0);
    });
  });

  describe("US-3.2 — View courses", () => {
    it("Signed-in admin views the course list", async () => {
      const token = await adminToken();
      const created = await createCourse(token);
      const response = await request(app).get("/course-t6/courses").set(authed(token));

      expect(response.status).toBe(200);
      expect(response.body.map((item) => item.id)).toContain(created.body.id);
    });

    it("Signed-in admin views an empty course list", async () => {
      const token = await adminToken();
      const response = await request(app).get("/course-t6/courses").set(authed(token));

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe("US-3.3 — Update a course", () => {
    it("Admin updates a course", async () => {
      const token = await adminToken();
      const created = await createCourse(token);
      const updated = {
        ...course,
        courseNumber: "CMSC-1111",
        courseName: "Intro",
        courseDescription: "Basics",
        courseSemesters: "Spring",
        courseFrequency: "Every semester",
        courseHours: "4",
        courseDept: "MATH",
      };
      const response = await request(app)
        .put(`/course-t6/courses/${created.body.id}`)
        .set(authed(token))
        .send(updated);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(updated);
    });

    it("Admin updates a course without a required field", async () => {
      const token = await adminToken();
      const created = await createCourse(token);
      const response = await request(app)
        .put(`/course-t6/courses/${created.body.id}`)
        .set(authed(token))
        .send({ ...course, courseName: "" });
      const stored = await db.course.findByPk(created.body.id);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Course name is required." });
      expect(stored.courseName).toBe("Software Engineering IV");
    });

    it("Admin updates a course that does not exist", async () => {
      const token = await adminToken();
      const response = await request(app)
        .put("/course-t6/courses/99999")
        .set(authed(token))
        .send(course);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Course with id=99999 not found." });
    });

    it("Admin updates a course using a non-numeric id", async () => {
      const token = await adminToken();
      const response = await request(app)
        .put("/course-t6/courses/abc")
        .set(authed(token))
        .send(course);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Course id must be a number." });
    });
  });

  describe("US-3.4 — Delete a course", () => {
    it("Admin deletes a course", async () => {
      const token = await adminToken();
      const created = await createCourse(token);
      const response = await request(app)
        .delete(`/course-t6/courses/${created.body.id}`)
        .set(authed(token));

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Course deleted successfully." });
    });

    it("Deleted course is no longer in the list", async () => {
      const token = await adminToken();
      const created = await createCourse(token);
      await request(app).delete(`/course-t6/courses/${created.body.id}`).set(authed(token));
      const response = await request(app).get("/course-t6/courses").set(authed(token));

      expect(response.status).toBe(200);
      expect(response.body.map((item) => item.id)).not.toContain(created.body.id);
    });

    it("Admin deletes a course that does not exist", async () => {
      const token = await adminToken();
      const response = await request(app).delete("/course-t6/courses/99999").set(authed(token));

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Course with id=99999 not found." });
    });

    it("Admin deletes a course using a non-numeric id", async () => {
      const token = await adminToken();
      const response = await request(app).delete("/course-t6/courses/abc").set(authed(token));

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Course id must be a number." });
    });
  });

  describe("US-3.5 — Restrict course management to admins", () => {
    it("Student cannot create a course", async () => {
      const token = await studentToken();
      const response = await createCourse(token);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Admin role required." });
      expect(await db.course.count()).toBe(0);
    });

    it("Student cannot update a course", async () => {
      const admin = await adminToken();
      const created = await createCourse(admin);
      const token = await studentToken();
      const response = await request(app)
        .put(`/course-t6/courses/${created.body.id}`)
        .set(authed(token))
        .send({ ...course, courseName: "Changed" });
      const stored = await db.course.findByPk(created.body.id);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Admin role required." });
      expect(stored.courseName).toBe("Software Engineering IV");
    });

    it("Student cannot delete a course", async () => {
      const admin = await adminToken();
      const created = await createCourse(admin);
      const token = await studentToken();
      const response = await request(app)
        .delete(`/course-t6/courses/${created.body.id}`)
        .set(authed(token));

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Admin role required." });
      expect(await db.course.findByPk(created.body.id)).not.toBeNull();
    });

    it("Student cannot list courses", async () => {
      const token = await studentToken();
      const response = await request(app).get("/course-t6/courses").set(authed(token));

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Admin role required." });
    });

    it("Unauthenticated user cannot use course endpoints", async () => {
      const requests = [
        request(app).get("/course-t6/courses"),
        request(app).post("/course-t6/courses").send(course),
        request(app).put("/course-t6/courses/1").send(course),
        request(app).delete("/course-t6/courses/1"),
      ];

      for (const pending of requests) {
        const response = await pending;
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "Unauthorized." });
      }
    });
  });
});
