/**
 * Feature 1 — User Authentication & Authorization
 * Spec: features/feature-1-user-authentication-authorization.md
 */
import express from "express";
import request from "supertest";
import db from "../app/models/index.js";
import app from "../server.js";
import { authenticate, requireAdmin } from "../app/authorization/authorization.js";
import authConfig from "../app/config/auth.config.js";
import { seedAdmin } from "../app/scripts/seed.mjs";

const testApp = express();
testApp.get("/test/protected", authenticate, (req, res) =>
  res.send({ userId: req.user.id, role: req.user.role }));
testApp.get("/test/admin", authenticate, requireAdmin, (req, res) =>
  res.send({ role: req.user.role }));

const registration = {
  firstName: "Jane", lastName: "Doe", email: "jane@example.com",
  universityId: "123456", userName: "jdoe",
  password: "password123",
};
// Registration does not sign the user in, so get a session token by logging in afterwards.
const signIn = async () => {
  await request(app).post("/course-t6/register").send(registration);
  return request(app).post("/course-t6/login").send({ userName: "jdoe", password: "password123" });
};
const authorized = (route, token) => request(testApp).get(route).set("Authorization", `Bearer ${token}`);

beforeEach(async () => { await db.sequelize.sync({ force: true }); });
afterAll(async () => { await db.sequelize.close(); });

describe("Feature 1 — User Authentication & Authorization", () => {
  describe("US-1.3 — Keep my session active", () => {
    it("Session survives a page refresh", async () => {
      const response = await signIn();
      const session = await db.session.findOne({ where: { token: response.body.token } });
      expect(session.expirationDate.getTime() - session.createdAt.getTime()).toBeGreaterThan(23 * 60 * 60 * 1000);
      expect(session.expirationDate.getTime() - session.createdAt.getTime()).toBeLessThanOrEqual(24 * 60 * 60 * 1000);
      const afterRefresh = await authorized("/test/protected", response.body.token);
      expect(afterRefresh.status).toBe(200);
      expect(afterRefresh.body).toMatchObject({ userId: response.body.userId, role: "student" });
    });

    it("Expired session is rejected", async () => {
      const response = await signIn();
      await db.session.update({ expirationDate: new Date(Date.now() - 1000) }, { where: { token: response.body.token } });
      const protectedResponse = await authorized("/test/protected", response.body.token);
      expect(protectedResponse.status).toBe(401);
    });

    it("Invalid session is rejected", async () => {
      const protectedResponse = await authorized("/test/protected", "invalid.token.value");
      expect(protectedResponse.status).toBe(401);
    });
  });

  describe("US-1.4 — Log out", () => {
    it("Request using an old token after logout is rejected", async () => {
      const response = await signIn();
      await request(app).post("/course-t6/logout").set("Authorization", `Bearer ${response.body.token}`);
      expect((await authorized("/test/protected", response.body.token)).status).toBe(401);
      const relogin = await request(app).post("/course-t6/login")
        .send({ userName: "jdoe", password: "password123" });
      expect(relogin.body.token).not.toBe(response.body.token);
    });
  });

  describe("US-1.6 — Restrict users by their user type", () => {
    it("Admin accesses an admin-only endpoint", async () => {
      await seedAdmin();
      const response = await request(app).post("/course-t6/login")
        .send({ userName: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD });
      const protectedResponse = await authorized("/test/admin", response.body.token);
      expect(protectedResponse.status).toBe(200);
      expect(protectedResponse.body).toEqual({ role: "admin" });
    });

    it("Student cannot access an admin-only endpoint", async () => {
      const response = await signIn();
      const protectedResponse = await authorized("/test/admin", response.body.token);
      expect(protectedResponse.status).toBe(403);
      expect(protectedResponse.body).toEqual({ message: "Admin role required." });
    });

    it("Unauthenticated user cannot access a protected endpoint", async () => {
      const protectedResponse = await request(testApp).get("/test/protected");
      expect(protectedResponse.status).toBe(401);
    });

    it("Protected request is rejected when the auth secret is missing", async () => {
      const response = await signIn();
      const secret = authConfig.secret;
      authConfig.secret = undefined;
      try {
        expect((await authorized("/test/protected", response.body.token)).status).toBe(401);
      } finally {
        authConfig.secret = secret;
      }
    });
  });
});
