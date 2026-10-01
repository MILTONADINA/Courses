/**
 * Feature 2 — Semester Management
 * Spec: features/feature-2-semester-management.md
 */
import request from "supertest";
import app from "../server.js";
import db from "../app/models/index.js";
import { seedAdmin } from "../app/scripts/seed.mjs";

const semester = {
  semesterName: "Fall 2026",
  startDate: "2026-08-17",
  endDate: "2026-12-11",
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

async function createSemester(token, body = semester) {
  return request(app).post("/course-t6/semesters").set(authed(token)).send(body);
}

describe("Feature 2 — Semester Management", () => {
  describe("US-2.1 — Create a semester", () => {
    it("Admin creates a semester with valid information", async () => {
      const token = await adminToken();
      const response = await createSemester(token);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject(semester);
      expect(response.body.id).toEqual(expect.any(Number));
    });

    it("Admin creates a semester without a required field", async () => {
      const token = await adminToken();
      for (const [field, message] of [
        ["semesterName", "Semester name is required."],
        ["startDate", "Start date is required."],
        ["endDate", "End date is required."],
      ]) {
        const response = await createSemester(token, { ...semester, [field]: "" });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message });
        expect(await db.semester.count()).toBe(0);
      }
    });

    it("Admin submits a whitespace-only semester name", async () => {
      const token = await adminToken();
      const response = await createSemester(token, { ...semester, semesterName: "   " });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Semester name is required." });
      expect(await db.semester.count()).toBe(0);
    });

    it("Admin submits an invalid start date", async () => {
      const token = await adminToken();
      const response = await createSemester(token, { ...semester, startDate: "August 17, 2026" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Enter a valid start date." });
      expect(await db.semester.count()).toBe(0);
    });

    it("Admin submits an invalid end date", async () => {
      const token = await adminToken();
      const response = await createSemester(token, { ...semester, endDate: "December 11, 2026" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Enter a valid end date." });
      expect(await db.semester.count()).toBe(0);
    });
  });

  describe("US-2.2 — View semesters", () => {
    it("Signed-in user views the semester list", async () => {
      const token = await adminToken();
      await createSemester(token, {
        semesterName: "Winter 2027",
        startDate: "2027-01-11",
        endDate: "2027-05-07",
      });
      await createSemester(token, {
        semesterName: "Summer 2026",
        startDate: "2026-01-12",
        endDate: "2026-05-08",
      });
      await createSemester(token, {
        semesterName: "Spring 2026",
        startDate: "2026-01-12",
        endDate: "2026-05-08",
      });
      await createSemester(token);

      const response = await request(app).get("/course-t6/semesters").set(authed(token));

      expect(response.status).toBe(200);
      expect(response.body.map((item) => item.semesterName)).toEqual([
        "Spring 2026",
        "Summer 2026",
        "Fall 2026",
        "Winter 2027",
      ]);
    });

    it("Signed-in user views an empty semester list", async () => {
      const token = await adminToken();
      const response = await request(app).get("/course-t6/semesters").set(authed(token));

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe("US-2.3 — Update a semester", () => {
    it("Admin updates a semester", async () => {
      const token = await adminToken();
      const created = await createSemester(token);
      const updated = {
        semesterName: "Spring 2027",
        startDate: "2027-01-11",
        endDate: "2027-05-07",
      };
      const response = await request(app)
        .put(`/course-t6/semesters/${created.body.id}`)
        .set(authed(token))
        .send(updated);

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject(updated);
    });

    it("Admin updates a semester without a required field", async () => {
      const token = await adminToken();
      const created = await createSemester(token);
      const response = await request(app)
        .put(`/course-t6/semesters/${created.body.id}`)
        .set(authed(token))
        .send({ ...semester, semesterName: "" });
      const stored = await db.semester.findByPk(created.body.id);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Semester name is required." });
      expect(stored.semesterName).toBe("Fall 2026");
    });

    it("Admin updates a semester that does not exist", async () => {
      const token = await adminToken();
      const response = await request(app)
        .put("/course-t6/semesters/99999")
        .set(authed(token))
        .send(semester);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Semester with id=99999 not found." });
    });

    it("Admin updates a semester using a non-numeric id", async () => {
      const token = await adminToken();
      const response = await request(app)
        .put("/course-t6/semesters/abc")
        .set(authed(token))
        .send(semester);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Semester id must be a number." });
    });
  });

  describe("US-2.4 — Delete a semester", () => {
    it("Admin deletes a semester", async () => {
      const token = await adminToken();
      const created = await createSemester(token);
      const response = await request(app)
        .delete(`/course-t6/semesters/${created.body.id}`)
        .set(authed(token));

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Semester deleted successfully." });
    });

    it("Deleted semester is no longer in the list", async () => {
      const token = await adminToken();
      const created = await createSemester(token);
      await request(app).delete(`/course-t6/semesters/${created.body.id}`).set(authed(token));
      const response = await request(app).get("/course-t6/semesters").set(authed(token));

      expect(response.status).toBe(200);
      expect(response.body.map((item) => item.id)).not.toContain(created.body.id);
    });

    it("Admin deletes a semester that does not exist", async () => {
      const token = await adminToken();
      const response = await request(app).delete("/course-t6/semesters/99999").set(authed(token));

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Semester with id=99999 not found." });
    });

    it("Admin deletes a semester using a non-numeric id", async () => {
      const token = await adminToken();
      const response = await request(app).delete("/course-t6/semesters/abc").set(authed(token));

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Semester id must be a number." });
    });
  });

  describe("US-2.5 — Restrict semester changes to admins", () => {
    it("Student cannot create a semester", async () => {
      const token = await studentToken();
      const response = await createSemester(token);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Admin role required." });
      expect(await db.semester.count()).toBe(0);
    });

    it("Student cannot update a semester", async () => {
      const admin = await adminToken();
      const created = await createSemester(admin);
      const token = await studentToken();
      const response = await request(app)
        .put(`/course-t6/semesters/${created.body.id}`)
        .set(authed(token))
        .send({ ...semester, semesterName: "Spring 2027" });
      const stored = await db.semester.findByPk(created.body.id);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Admin role required." });
      expect(stored.semesterName).toBe("Fall 2026");
    });

    it("Student cannot delete a semester", async () => {
      const admin = await adminToken();
      const created = await createSemester(admin);
      const token = await studentToken();
      const response = await request(app)
        .delete(`/course-t6/semesters/${created.body.id}`)
        .set(authed(token));

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Admin role required." });
      expect(await db.semester.findByPk(created.body.id)).not.toBeNull();
    });

    it("Student can view semesters", async () => {
      const admin = await adminToken();
      const created = await createSemester(admin);
      const token = await studentToken();
      const list = await request(app).get("/course-t6/semesters").set(authed(token));

      expect(list.status).toBe(200);
      expect(list.body.map((item) => item.id)).toContain(created.body.id);
    });

    it("Unauthenticated user cannot use semester endpoints", async () => {
      const admin = await adminToken();
      const created = await createSemester(admin);
      const requests = [
        request(app).get("/course-t6/semesters"),
        request(app).post("/course-t6/semesters").send(semester),
        request(app).put(`/course-t6/semesters/${created.body.id}`).send(semester),
        request(app).delete(`/course-t6/semesters/${created.body.id}`),
      ];

      for (const pending of requests) {
        const response = await pending;
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "Unauthorized." });
      }
    });
  });
});
