/**
 * Feature 4 — Faculty Management
 * Spec: features/feature-4-faculty-management.md
 */
import request from "supertest";
import app from "../server.js";
import db from "../app/models/index.js";
import { seedAdmin } from "../app/scripts/seed.mjs";

const ada = { firstName: "Ada", lastName: "Lovelace", dept: "Computer Science" };

const requiredMessages = [
  ["firstName", "First name is required."],
  ["lastName", "Last name is required."],
  ["dept", "Department is required."],
];

const studentRegistration = {
  firstName: "Jane",
  lastName: "Doe",
  email: "jane@example.com",
  universityId: "123456",
  userName: "jdoe",
  password: "password123",
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

async function createFaculty(token, body = ada) {
  return request(app).post("/course-t6/faculty").set(authed(token)).send(body);
}

describe("Feature 4 — Faculty Management", () => {
  describe("US-4.1 — Add a faculty member", () => {
    it("Admin adds a faculty member successfully", async () => {
      const token = await adminToken();
      const response = await createFaculty(token);
      const list = await request(app).get("/course-t6/faculty").set(authed(token));

      expect(response.status).toBe(201);
      expect(response.body).toMatchObject({ id: expect.any(Number), ...ada });
      expect(list.body.map((item) => item.id)).toContain(response.body.id);
    });

    it("Admin adds a faculty member without a required field", async () => {
      const token = await adminToken();
      for (const [field, message] of requiredMessages) {
        const response = await createFaculty(token, { ...ada, [field]: "" });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message });
        expect(await db.faculty.count()).toBe(0);
      }
    });

    it("Admin submits whitespace-only faculty information", async () => {
      const token = await adminToken();
      for (const [field, message] of requiredMessages) {
        const response = await createFaculty(token, { ...ada, [field]: "   " });

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message });
        expect(await db.faculty.count()).toBe(0);
      }
    });
  });

  describe("US-4.2 — View faculty members", () => {
    it("Admin views the faculty list", async () => {
      const token = await adminToken();
      await createFaculty(token, { firstName: "Grace", lastName: "Hopper", dept: "Mathematics" });
      await createFaculty(token, ada);
      await createFaculty(token, { firstName: "Alan", lastName: "Hopper", dept: "Physics" });

      const response = await request(app).get("/course-t6/faculty").set(authed(token));

      expect(response.status).toBe(200);
      expect(response.body.map(({ firstName, lastName, dept }) => ({ firstName, lastName, dept }))).toEqual([
        { firstName: "Alan", lastName: "Hopper", dept: "Physics" },
        { firstName: "Grace", lastName: "Hopper", dept: "Mathematics" },
        ada,
      ]);
    });

    it("Admin views the faculty list when no faculty members exist", async () => {
      const token = await adminToken();
      const response = await request(app).get("/course-t6/faculty").set(authed(token));

      expect(response.status).toBe(200);
      expect(response.body).toEqual([]);
    });
  });

  describe("US-4.3 — Edit a faculty member", () => {
    it("Admin edits a faculty member successfully", async () => {
      const token = await adminToken();
      const created = await createFaculty(token);
      const updated = { firstName: "Augusta", lastName: "King", dept: "Mathematics" };

      const response = await request(app)
        .put(`/course-t6/faculty/${created.body.id}`)
        .set(authed(token))
        .send(updated);
      const list = await request(app).get("/course-t6/faculty").set(authed(token));

      expect(response.status).toBe(200);
      expect(response.body).toMatchObject({ id: created.body.id, ...updated });
      expect(list.body).toEqual([expect.objectContaining(updated)]);
    });

    it("Admin edits a faculty member without a required field", async () => {
      const token = await adminToken();
      const created = await createFaculty(token);
      expect(created.body.id).toBe(1);

      for (const [field, message] of requiredMessages) {
        const response = await request(app)
          .put("/course-t6/faculty/1")
          .set(authed(token))
          .send({ ...ada, [field]: "" });
        const stored = await db.faculty.findByPk(1);

        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message });
        expect(stored).toMatchObject(ada);
      }
    });

    it("Admin edits a faculty member that does not exist", async () => {
      const token = await adminToken();
      const response = await request(app).put("/course-t6/faculty/999").set(authed(token)).send(ada);

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Faculty member with id=999 not found." });
    });

    it("Admin edits a faculty member with an id that is not a number", async () => {
      const token = await adminToken();
      const response = await request(app).put("/course-t6/faculty/abc").set(authed(token)).send(ada);

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Faculty member id must be a number." });
    });
  });

  describe("US-4.4 — Delete a faculty member", () => {
    it("Admin deletes a faculty member successfully", async () => {
      const token = await adminToken();
      const created = await createFaculty(token);

      const response = await request(app).delete(`/course-t6/faculty/${created.body.id}`).set(authed(token));
      const list = await request(app).get("/course-t6/faculty").set(authed(token));

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Faculty member deleted successfully." });
      expect(list.body.map((item) => item.id)).not.toContain(created.body.id);
    });

    it("Admin deletes a faculty member that does not exist", async () => {
      const token = await adminToken();
      const response = await request(app).delete("/course-t6/faculty/999").set(authed(token));

      expect(response.status).toBe(404);
      expect(response.body).toEqual({ message: "Faculty member with id=999 not found." });
    });

    it("Admin deletes a faculty member with an id that is not a number", async () => {
      const token = await adminToken();
      const response = await request(app).delete("/course-t6/faculty/abc").set(authed(token));

      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Faculty member id must be a number." });
    });
  });

  describe("US-4.5 — Restrict faculty management to admins", () => {
    it("Student cannot manage faculty members", async () => {
      const admin = await adminToken();
      const created = await createFaculty(admin);
      const token = await studentToken();
      const requests = [
        request(app).get("/course-t6/faculty").set(authed(token)),
        request(app).post("/course-t6/faculty").set(authed(token)).send({ ...ada, lastName: "Byron" }),
        request(app).put(`/course-t6/faculty/${created.body.id}`).set(authed(token)).send({ ...ada, lastName: "King" }),
        request(app).delete(`/course-t6/faculty/${created.body.id}`).set(authed(token)),
      ];

      for (const pending of requests) {
        const response = await pending;
        expect(response.status).toBe(403);
        expect(response.body).toEqual({ message: "Admin role required." });
      }
      const stored = await db.faculty.findAll();
      expect(stored).toHaveLength(1);
      expect(stored[0]).toMatchObject(ada);
    });

    it("Unauthenticated user cannot manage faculty members", async () => {
      const admin = await adminToken();
      const created = await createFaculty(admin);
      const requests = [
        request(app).get("/course-t6/faculty"),
        request(app).post("/course-t6/faculty").send({ ...ada, lastName: "Byron" }),
        request(app).put(`/course-t6/faculty/${created.body.id}`).send({ ...ada, lastName: "King" }),
        request(app).delete(`/course-t6/faculty/${created.body.id}`),
      ];

      for (const pending of requests) {
        const response = await pending;
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "Unauthorized." });
      }
      const stored = await db.faculty.findAll();
      expect(stored).toHaveLength(1);
      expect(stored[0]).toMatchObject(ada);
    });
  });
});
