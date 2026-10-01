/**
 * Feature 1 — User Authentication & Authorization
 * Spec: features/feature-1-user-authentication.md
 */
import request from "supertest";
import { spawnSync } from "child_process";
import { fileURLToPath } from "url";
import os from "os";
import path from "path";
import app from "../server.js";
import db from "../app/models/index.js";
import { seedAdmin } from "../scripts/seed.mjs";

const backendDir = path.dirname(fileURLToPath(new URL("../package.json", import.meta.url)));
const registration = {
  firstName: "Jane", lastName: "Doe", email: "jane@example.com",
  universityId: "123456", userName: "jdoe",
  password: "password123", confirmPassword: "password123",
};
const register = (data = registration) => request(app).post("/course-t6/register").send(data);
const login = (data = { userName: "jdoe", password: "password123" }) =>
  request(app).post("/course-t6/login").send(data);
const countUsers = () => db.user.count();

beforeEach(async () => { await db.sequelize.sync({ force: true }); });
afterAll(async () => { await db.sequelize.close(); });

describe("Feature 1 — User Authentication & Authorization", () => {
  describe("US-1.1 — Register an account", () => {
    it("User registers successfully", async () => {
      const response = await register({ ...registration, role: "admin", userName: "JDoe" });
      expect(response.status).toBe(201);
      expect(Object.keys(response.body).sort()).toEqual([
        "userId", "firstName", "lastName", "email", "universityId", "userName", "role", "token",
      ].sort());
      expect(response.body).toMatchObject({ userName: "jdoe", role: "student" });
      expect(typeof response.body.token).toBe("string");
      expect(await db.user.count({ where: { role: "student", userName: "jdoe" } })).toBe(1);
      const protectedResponse = await request(app).post("/course-t6/logout")
        .set("Authorization", `Bearer ${response.body.token}`);
      expect(protectedResponse.status).toBe(200);
    });

    it("User registers without a required field", async () => {
      for (const [field, message] of [
        ["firstName", "First name is required."], ["lastName", "Last name is required."],
        ["email", "Email is required."], ["universityId", "University ID is required."],
        ["userName", "Username is required."], ["password", "Password is required."],
        ["confirmPassword", "Confirm password is required."],
      ]) {
        const response = await register({ ...registration, [field]: "" });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message });
        expect(await countUsers()).toBe(0);
      }
    });

    it("User submits whitespace-only required information", async () => {
      for (const [field, message] of [
        ["firstName", "First name is required."], ["lastName", "Last name is required."],
        ["email", "Email is required."], ["universityId", "University ID is required."],
        ["userName", "Username is required."], ["password", "Password is required."],
        ["confirmPassword", "Confirm password is required."],
      ]) {
        const response = await register({ ...registration, [field]: "   " });
        expect(response.status).toBe(400);
        expect(response.body).toEqual({ message });
        expect(await countUsers()).toBe(0);
      }
    });

    it("User submits an invalid email", async () => {
      const response = await register({ ...registration, email: "not-an-email" });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Enter a valid email address." });
      expect(await countUsers()).toBe(0);
    });

    it("User submits a password shorter than 8 characters", async () => {
      const response = await register({ ...registration, password: "short", confirmPassword: "short" });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Password must be at least 8 characters." });
      expect(await countUsers()).toBe(0);
    });

    it("User submits mismatched passwords", async () => {
      const response = await register({ ...registration, confirmPassword: "different" });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Passwords do not match." });
      expect(await countUsers()).toBe(0);
    });

    it("User registers with an existing username", async () => {
      await register();
      const response = await register({ ...registration, userName: "JDOE", email: "other@example.com", universityId: "other" });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Username is already taken." });
      expect(await countUsers()).toBe(1);
    });

    it("User registers with an existing email", async () => {
      await register();
      const response = await register({ ...registration, userName: "other", universityId: "other" });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "Email is already registered." });
      expect(await countUsers()).toBe(1);
    });

    it("User registers with an existing university ID", async () => {
      await register();
      const response = await register({ ...registration, userName: "other", email: "other@example.com" });
      expect(response.status).toBe(400);
      expect(response.body).toEqual({ message: "University ID is already registered." });
      expect(await countUsers()).toBe(1);
    });
  });

  describe("US-1.2 — Log in", () => {
    it("User logs in successfully", async () => {
      const registered = await register();
      const response = await login();
      expect(response.status).toBe(200);
      expect(Object.keys(response.body).sort()).toEqual(Object.keys(registered.body).sort());
      expect(response.body).toMatchObject({ userName: "jdoe", role: "student", token: registered.body.token });
    });

    it("User cannot log in with incorrect information", async () => {
      await register();
      const before = await db.session.count();
      for (const data of [
        { userName: "jdoe", password: "wrong" },
        { userName: "unknown", password: "password123" },
      ]) {
        const response = await login(data);
        expect(response.status).toBe(401);
        expect(response.body).toEqual({ message: "Invalid username or password." });
      }
      expect(await db.session.count()).toBe(before);
    });

    it("User logs in using a different username capitalization", async () => {
      await register();
      const response = await login({ userName: "JDoe", password: "password123" });
      expect(response.status).toBe(200);
      expect(response.body.userName).toBe("jdoe");
    });

    it("Login reuses an existing valid session", async () => {
      const first = await register();
      const second = await login();
      expect(second.status).toBe(200);
      expect(second.body.token).toBe(first.body.token);
      expect(await db.session.count()).toBe(1);
    });
  });

  describe("US-1.4 — Log out", () => {
    it("User logs out successfully", async () => {
      const signedIn = await register();
      const response = await request(app).post("/course-t6/logout")
        .set("Authorization", `Bearer ${signedIn.body.token}`);
      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: "Signed out successfully." });
      expect(await db.session.findOne({ where: { token: signedIn.body.token } })).toBeNull();
      expect((await db.session.findOne({ where: { userId: signedIn.body.userId } })).token).toBe("");
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
      const result = spawnSync("npm", ["run", "seed"], {
        cwd: backendDir,
        env: { ...process.env, DOTENV_CONFIG_PATH: path.join(backendDir, ".env.test") },
        encoding: "utf8",
      });
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
      const environment = { ...process.env, DOTENV_CONFIG_PATH: os.devNull };
      delete environment.ADMIN_PASSWORD;
      const result = spawnSync("npm", ["run", "seed"], { cwd: backendDir, env: environment, encoding: "utf8" });
      expect(result.status).not.toBe(0);
      expect(result.stderr).toContain("ADMIN_PASSWORD is required");
      expect(await db.user.count({ where: { role: "admin" } })).toBe(0);
    });
  });
});
