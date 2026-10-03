/**
 * Feature 9 — Student Management
 * Spec: features/feature-9-student-management.md
 */
import request from "supertest";
import bcrypt from "bcryptjs";
import app from "../server.js";
import db from "../app/models/index.js";
import { seedAdmin } from "../app/scripts/seed.mjs";

const student = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  universityId: "123456",
  userName: "JDoe",
  password: "password123",
};

const requiredFields = [
  ["firstName", "First name is required."],
  ["lastName", "Last name is required."],
  ["email", "Email is required."],
  ["universityId", "University ID is required."],
  ["userName", "Username is required."],
  ["password", "Password is required."],
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
  await request(app).post("/course-t6/register").send({
    firstName: "Sam",
    lastName: "Student",
    email: "sam@example.com",
    universityId: "999",
    userName: "sam",
    password: "password123",
    confirmPassword: "password123",
  });
  const response = await request(app).post("/course-t6/login").send({
    userName: "sam",
    password: "password123",
  });
  return response.body.token;
}

function authed(token) {
  return { Authorization: `Bearer ${token}` };
}

function createStudent(token, body = student) {
  return request(app).post("/course-t6/students").set(authed(token)).send(body);
}

describe("Feature 9 — Student Management", () => {
  describe("US-9.1 — Add a student", () => {
    it("Admin adds a student with valid information", async () => {
      const token = await adminToken();
      const response = await createStudent(token);

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({
        firstName: "Jane",
        lastName: "Doe",
        email: "jane@example.com",
        universityId: "123456",
        userName: "jdoe",
        role: "student",
      });
      expect(response.body.password).toBeUndefined();
    });

    it("Admin adds a student without a required field", async () => {
      const token = await adminToken();
      for (const [field, message] of requiredFields) {
        const response = await createStudent(token, { ...student, [field]: "" });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message });
      }
      expect(await db.user.count({ where: { role: "student" } })).toBe(0);
    });

    it("Admin submits a whitespace-only first name", async () => {
      const token = await adminToken();
      const response = await createStudent(token, { ...student, firstName: "   " });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "First name is required." });
      expect(await db.user.count({ where: { role: "student" } })).toBe(0);
    });

    it("Admin submits a short password", async () => {
      const token = await adminToken();
      const response = await createStudent(token, { ...student, password: "short" });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Password must be at least 8 characters." });
      expect(await db.user.count({ where: { role: "student" } })).toBe(0);
    });

    it("Admin submits a username that is already taken", async () => {
      const token = await adminToken();
      await createStudent(token);
      const response = await createStudent(token, {
        ...student,
        email: "other@example.com",
        userName: "jdoe",
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Username is already taken." });
    });

    it("Admin submits an email that is already registered", async () => {
      const token = await adminToken();
      await createStudent(token);
      const response = await createStudent(token, {
        ...student,
        email: "jane@example.com",
        userName: "other",
      });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Email is already registered." });
    });

    it("Supplied role does not create an admin", async () => {
      const token = await adminToken();
      const response = await createStudent(token, { ...student, role: "admin" });

      expect(response.status).toBe(201);
      expect(response.body.role).toBe("student");
    });

    it("Added student can sign in", async () => {
      const token = await adminToken();
      await createStudent(token);
      const response = await request(app).post("/course-t6/login").send({
        userName: "jdoe",
        password: "password123",
      });

      expect(response.status).toBe(200);
      expect(response.body.role).toBe("student");
    });
  });

  describe("US-9.2 — View students", () => {
    it("Signed-in admin views the student list", async () => {
      const token = await adminToken();
      const created = await createStudent(token);
      const response = await request(app).get("/course-t6/students").set(authed(token));

      expect(response.status).toBe(200);
      expect(response.body.map((item) => item.id)).toContain(created.body.id);
      expect(response.body.every((item) => item.password === undefined)).toBe(true);
    });

    it("Student list does not include admins", async () => {
      const token = await adminToken();
      const response = await request(app).get("/course-t6/students").set(authed(token));

      expect(response.status).toBe(200);
      expect(response.body.some((item) => item.role === "admin")).toBe(false);
    });

    it("Signed-in admin views an empty student list", async () => {
      const token = await adminToken();
      const response = await request(app).get("/course-t6/students").set(authed(token));

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe("US-9.3 — Update a student", () => {
    it("Admin updates a student", async () => {
      const token = await adminToken();
      const created = await createStudent(token);
      const response = await request(app)
        .put(`/course-t6/students/${created.body.id}`)
        .set(authed(token))
        .send({
          firstName: "Janet",
          lastName: "Doe",
          email: "janet@example.com",
          universityId: "123456",
          userName: "jdoe",
        });

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({
        firstName: "Janet",
        email: "janet@example.com",
        role: "student",
      });
      expect(response.body.password).toBeUndefined();
    });

    it("Admin updates a student without a required field", async () => {
      const token = await adminToken();
      const created = await createStudent(token);
      const response = await request(app)
        .put(`/course-t6/students/${created.body.id}`)
        .set(authed(token))
        .send({
          firstName: "",
          lastName: "Doe",
          email: "jane@example.com",
          universityId: "123456",
          userName: "jdoe",
        });
      const stored = await db.user.findByPk(created.body.id);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "First name is required." });
      expect(stored.firstName).toBe("Jane");
    });

    it("Update does not change the password", async () => {
      const token = await adminToken();
      const created = await createStudent(token);
      const before = await db.user.unscoped().findByPk(created.body.id);
      await request(app)
        .put(`/course-t6/students/${created.body.id}`)
        .set(authed(token))
        .send({
          firstName: "Janet",
          lastName: "Doe",
          email: "janet@example.com",
          universityId: "654321",
          userName: "jdoe",
          password: "newpassword",
          role: "admin",
        });
      const after = await db.user.unscoped().findByPk(created.body.id);
      const login = await request(app).post("/course-t6/login").send({
        userName: "jdoe",
        password: "password123",
      });

      expect(after.password).toBe(before.password);
      expect(after.role).toBe("student");
      expect(login.status).toBe(200);
    });

    it("Admin updates a student that does not exist", async () => {
      const token = await adminToken();
      const response = await request(app)
        .put("/course-t6/students/99999")
        .set(authed(token))
        .send({
          firstName: "Janet",
          lastName: "Doe",
          email: "janet@example.com",
          universityId: "123456",
          userName: "jdoe",
        });

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Student with id=99999 not found." });
    });

    it("Admin updates a student using a non-numeric id", async () => {
      const token = await adminToken();
      const response = await request(app)
        .put("/course-t6/students/abc")
        .set(authed(token))
        .send({
          firstName: "Janet",
          lastName: "Doe",
          email: "janet@example.com",
          universityId: "123456",
          userName: "jdoe",
        });

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Student id must be a number." });
    });

    it("Admin updates an admin account through the student route", async () => {
      const token = await adminToken();
      const admin = await db.user.findOne({ where: { role: "admin" } });
      const response = await request(app)
        .put(`/course-t6/students/${admin.id}`)
        .set(authed(token))
        .send({
          firstName: "Changed",
          lastName: "Admin",
          email: "changed@example.com",
          universityId: "1",
          userName: "changed",
        });
      const stored = await db.user.findByPk(admin.id);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: `Student with id=${admin.id} not found.` });
      expect(stored.firstName).toBe(admin.firstName);
    });
  });

  describe("US-9.4 — Delete a student", () => {
    it("Admin deletes a student", async () => {
      const token = await adminToken();
      const created = await createStudent(token);
      const response = await request(app)
        .delete(`/course-t6/students/${created.body.id}`)
        .set(authed(token));

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Student deleted successfully." });
    });

    it("Deleted student is no longer in the list", async () => {
      const token = await adminToken();
      const created = await createStudent(token);
      await request(app).delete(`/course-t6/students/${created.body.id}`).set(authed(token));
      const response = await request(app).get("/course-t6/students").set(authed(token));

      expect(response.status).toBe(200);
      expect(response.body.map((item) => item.id)).not.toContain(created.body.id);
    });

    it("Deleted student can no longer sign in", async () => {
      const token = await adminToken();
      const created = await createStudent(token);
      await request(app).post("/course-t6/login").send({ userName: "jdoe", password: "password123" });
      await request(app).delete(`/course-t6/students/${created.body.id}`).set(authed(token));
      const response = await request(app).post("/course-t6/login").send({
        userName: "jdoe",
        password: "password123",
      });

      expect(response.status).toBe(401);
    });

    it("Admin deletes a student that does not exist", async () => {
      const token = await adminToken();
      const response = await request(app).delete("/course-t6/students/99999").set(authed(token));

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Student with id=99999 not found." });
    });

    it("Admin deletes a student using a non-numeric id", async () => {
      const token = await adminToken();
      const response = await request(app).delete("/course-t6/students/abc").set(authed(token));

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Student id must be a number." });
    });

    it("Admin deletes an admin account through the student route", async () => {
      const token = await adminToken();
      const other = await db.user.create({
        firstName: "Other",
        lastName: "Admin",
        email: "other-admin@example.com",
        universityId: "2",
        userName: "otheradmin",
        password: await bcrypt.hash("password123", 10),
        role: "admin",
      });
      const response = await request(app)
        .delete(`/course-t6/students/${other.id}`)
        .set(authed(token));
      const stored = await db.user.findByPk(other.id);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: `Student with id=${other.id} not found.` });
      expect(stored).not.toBeNull();
      expect(stored.userName).toBe("otheradmin");
    });
  });

  describe("US-9.5 — Restrict student management to admins", () => {
    it("Student cannot create a student", async () => {
      const token = await studentToken();
      const before = await db.user.count({ where: { role: "student" } });
      const response = await createStudent(token);

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Admin role required." });
      expect(await db.user.count({ where: { role: "student" } })).toBe(before);
    });

    it("Student cannot update a student", async () => {
      const admin = await adminToken();
      const created = await createStudent(admin);
      const token = await studentToken();
      const response = await request(app)
        .put(`/course-t6/students/${created.body.id}`)
        .set(authed(token))
        .send({
          firstName: "Changed",
          lastName: "Doe",
          email: "jane@example.com",
          universityId: "123456",
          userName: "jdoe",
        });
      const list = await request(app).get("/course-t6/students").set(authed(admin));

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Admin role required." });
      expect(list.body.some((item) => item.firstName === "Jane")).toBe(true);
    });

    it("Student cannot delete a student", async () => {
      const admin = await adminToken();
      const created = await createStudent(admin);
      const token = await studentToken();
      const response = await request(app)
        .delete(`/course-t6/students/${created.body.id}`)
        .set(authed(token));
      const list = await request(app).get("/course-t6/students").set(authed(admin));

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Admin role required." });
      expect(list.body.some((item) => item.userName === "jdoe")).toBe(true);
    });

    it("Student cannot list students", async () => {
      const token = await studentToken();
      const response = await request(app).get("/course-t6/students").set(authed(token));

      expect(response.status).toBe(403);
      expect(response.body).toEqual({ message: "Admin role required." });
    });

    it("Unauthenticated user cannot use student endpoints", async () => {
      const requests = [
        request(app).get("/course-t6/students"),
        request(app).post("/course-t6/students").send(student),
        request(app).put("/course-t6/students/1").send(student),
        request(app).delete("/course-t6/students/1"),
      ];

      for (const pending of requests) {
        const response = await pending;
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "Unauthorized." });
      }
    });
  });
});
