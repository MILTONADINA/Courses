/**
 * Feature 1 — User Authentication & Authorization
 * Spec: features/feature-1-user-authentication-authorization.md
 */
import request from "supertest";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import os from "os";
import path from "path";
import app from "../server.js";
import db from "../app/models/index.js";
import { seedAdmin } from "../app/scripts/seed.mjs";

const backendDir = path.dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const registration = {
  firstName: "Jane", lastName: "Doe", email: "jane@example.com",
  universityId: "123456", userName: "jdoe", password: "password123",
};
const requiredMessages = [
  ["firstName", "First name is required."], ["lastName", "Last name is required."],
  ["email", "Email is required."], ["universityId", "University ID is required."],
  ["userName", "Username is required."], ["password", "Password is required."],
];
const register = (data = registration) => request(app).post("/course-t6/register").send(data);
const login = (data = { userName: "jdoe", password: "password123" }) =>
  request(app).post("/course-t6/login").send(data);
const countUsers = () => db.user.count();

beforeEach(async () => { await db.sequelize.sync({ force: true }); });
afterAll(async () => { await db.sequelize.close(); });

describe("Feature 1 — User Authentication & Authorization", () => {
  describe("US-1.1 — Register an account", () => {
    it("User registers successfully", async () => {
      const response = await register();
      expect(response.status).toBe(201);
      expect(response.body).toEqual({
        id: expect.any(Number), firstName: "Jane", lastName: "Doe", email: "jane@example.com",
        universityId: "123456", userName: "jdoe", role: "student",
      });
      expect(await db.session.count()).toBe(0);
    });

    it("Registration ignores a supplied admin role", async () => {
      const response = await register({ ...registration, role: "admin" });
      expect(response.status).toBe(201);
      expect(response.body.role).toBe("student");
      expect(await db.user.count({ where: { role: "admin" } })).toBe(0);
    });

    it("User registers without a required field", async () => {
      for (const [field, message] of requiredMessages) {
        const response = await register({ ...registration, [field]: "" });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message });
        expect(await countUsers()).toBe(0);
      }
    });

    it("User submits whitespace-only required information", async () => {
      for (const [field, message] of requiredMessages) {
        const response = await register({ ...registration, [field]: "   " });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message });
        expect(await countUsers()).toBe(0);
      }
    });

    it("User submits a password shorter than 8 characters", async () => {
      const response = await register({ ...registration, password: "short" });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Password must be at least 8 characters." });
      expect(await countUsers()).toBe(0);
    });

    it("User registers with an existing username", async () => {
      await register();
      const response = await register({ ...registration, userName: "JDOE", email: "other@example.com" });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Username is already taken." });
      expect(await countUsers()).toBe(1);
    });

    it("User registers with an existing email", async () => {
      await register();
      const response = await register({ ...registration, userName: "other" });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Email is already registered." });
      expect(await countUsers()).toBe(1);
    });
  });

  describe("US-1.2 — Log in", () => {
    it("User logs in successfully", async () => {
      await register();
      const response = await login();
      expect(response.status).toBe(200);
      expect(Object.keys(response.body).sort()).toEqual(
        ["userId", "firstName", "lastName", "email", "userName", "role", "token"].sort());
      expect(response.body).toMatchObject({ userName: "jdoe", role: "student" });
      expect(typeof response.body.token).toBe("string");
    });

    it("User cannot log in with incorrect information", async () => {
      await register();
      for (const data of [
        { userName: "jdoe", password: "wrong-password" },
        { userName: "unknown", password: "password123" },
      ]) {
        const response = await login(data);
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "Invalid username or password." });
      }
      expect(await db.session.count()).toBe(0);
    });

    it("User logs in using a different username capitalization", async () => {
      await register();
      const response = await login({ userName: "JDoe", password: "password123" });
      expect(response.status).toBe(200);
      expect(response.body.userName).toBe("jdoe");
    });

    it("Login reuses an existing valid session", async () => {
      await register();
      const first = await login();
      const second = await login();
      expect(second.status).toBe(200);
      expect(second.body.token).toBe(first.body.token);
      expect(await db.session.count()).toBe(1);
    });

    it("User submits login without a required field", async () => {
      await register();
      for (const [data, message] of [
        [{ password: "password123" }, "Username is required."],
        [{ userName: "   ", password: "password123" }, "Username is required."],
        [{ userName: "jdoe" }, "Password is required."],
        [{ userName: "jdoe", password: "   " }, "Password is required."],
      ]) {
        const response = await login(data);
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message });
      }
      expect(await db.session.count()).toBe(0);
    });
  });

  describe("US-1.4 — Log out", () => {
    it("User logs out successfully", async () => {
      await register();
      const signedIn = await login();
      const response = await request(app).post("/course-t6/logout")
        .set("Authorization", `Bearer ${signedIn.body.token}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Signed out successfully." });
      expect(await db.session.findOne({ where: { token: signedIn.body.token } })).toBeNull();
      expect((await db.session.findOne({ where: { userId: signedIn.body.userId } })).token).toBe("");
    });

    it("User cannot log out without a session", async () => {
      const response = await request(app).post("/course-t6/logout");
      expect(response.status).toBe(401);
      expect(response.body).toEqual({ message: "Unauthorized." });
    });
  });

  describe("US-1.5 — Use the system as my user type", () => {
    it("Admin logs in", async () => {
      await seedAdmin();
      const response = await login({ userName: process.env.ADMIN_USERNAME, password: process.env.ADMIN_PASSWORD });
      expect(response.status).toBe(200);
      expect(response.body.role).toBe("admin");
    });

    it("Student logs in", async () => {
      await register();
      const response = await login();
      expect(response.status).toBe(200);
      expect(response.body.role).toBe("student");
    });
  });

  describe("US-1.7 — Seed the first admin", () => {
    it("Seed creates the first admin", async () => {
      const result = spawnSync(process.execPath, [process.env.npm_execpath, "run", "seed"], {
        cwd: backendDir,
        env: { ...process.env, DOTENV_CONFIG_PATH: path.join(backendDir, ".env.test") },
        encoding: "utf8",
      });
      expect(result.error).toBeUndefined();
      expect(result.status).toBe(0);
      const admin = await db.user.unscoped().findOne({ where: { userName: process.env.ADMIN_USERNAME } });
      expect(admin).toMatchObject({
        firstName: process.env.ADMIN_FIRST_NAME, lastName: process.env.ADMIN_LAST_NAME,
        email: process.env.ADMIN_EMAIL, universityId: process.env.ADMIN_UNIVERSITY_ID,
        role: "admin",
      });
      expect(admin.password).not.toBe(process.env.ADMIN_PASSWORD);
    });

    it("Seed fails when an admin environment variable is missing", async () => {
      // The child inherits the already-loaded test env. Loading .env.test again would restore ADMIN_PASSWORD.
      // backend/.env.example ships the variables blank, so an empty value must fail too.
      for (const password of [undefined, ""]) {
        const environment = { ...process.env, DOTENV_CONFIG_PATH: os.devNull, ADMIN_PASSWORD: password };
        if (password === undefined) delete environment.ADMIN_PASSWORD;
        const result = spawnSync(process.execPath, [process.env.npm_execpath, "run", "seed"], { cwd: backendDir, env: environment, encoding: "utf8" });
        expect(result.error).toBeUndefined();
        expect(result.status).toBe(1);
        expect(await db.user.count({ where: { role: "admin" } })).toBe(0);
      }
    });
  });
});
