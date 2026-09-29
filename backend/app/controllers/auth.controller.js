import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import { UniqueConstraintError } from "sequelize";
import db from "../models/index.js";
import authConfig from "../config/auth.config.js";
import logger from "../config/logger.js";

const required = [
  ["firstName", "First name"], ["lastName", "Last name"],
  ["email", "Email"], ["universityId", "University ID"],
  ["userName", "Username"], ["password", "Password"],
  ["confirmPassword", "Confirm password"],
];
const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sessionLifetimeMs = 24 * 60 * 60 * 1000;

function responseFor(user, token) {
  return {
    userId: user.id, firstName: user.firstName, lastName: user.lastName,
    email: user.email, universityId: user.universityId,
    userName: user.userName, role: user.role, token,
  };
}

async function getOrCreateSession(user) {
  const sessions = await db.session.findAll({
    where: { userId: user.id }, order: [["createdAt", "DESC"]],
  });
  for (const session of sessions) {
    if (session.expirationDate.getTime() > Date.now()) {
      try {
        const payload = jwt.verify(session.token, authConfig.secret);
        if (payload.userId === user.id) return session.token;
      } catch {
        // An invalid JWT cannot be reused.
      }
    }
  }
  const token = jwt.sign({ userId: user.id, jti: randomUUID() }, authConfig.secret, { expiresIn: "24h" });
  await db.session.create({
    token, email: user.email, expirationDate: new Date(Date.now() + sessionLifetimeMs),
    userId: user.id,
  });
  return token;
}

const duplicateMessages = {
  userName: "Username is already taken.",
  email: "Email is already registered.",
  universityId: "University ID is already registered.",
};

const controller = {};

controller.register = async (req, res) => {
  const data = req.body || {};
  for (const [field, label] of required) {
    if (typeof data[field] !== "string" || !data[field].trim()) {
      return res.status(400).send({ message: `${label} is required.` });
    }
  }
  if (!emailPattern.test(data.email.trim())) {
    return res.status(400).send({ message: "Enter a valid email address." });
  }
  if (data.password.length < 8) {
    return res.status(400).send({ message: "Password must be at least 8 characters." });
  }
  if (data.password !== data.confirmPassword) {
    return res.status(400).send({ message: "Passwords do not match." });
  }

  const values = {
    firstName: data.firstName.trim(), lastName: data.lastName.trim(),
    email: data.email.trim(), universityId: data.universityId.trim(),
    userName: data.userName.trim().toLowerCase(), role: "student",
  };

  try {
    for (const field of ["userName", "email", "universityId"]) {
      if (await db.user.findOne({ where: { [field]: values[field] } })) {
        return res.status(400).send({ message: duplicateMessages[field] });
      }
    }
    const password = await bcrypt.hash(data.password, 10);
    const user = await db.user.create({ ...values, password });
    const token = await getOrCreateSession(user);
    return res.status(201).send(responseFor(user, token));
  } catch (error) {
    if (error instanceof UniqueConstraintError) {
      const field = error.errors.find((entry) => duplicateMessages[entry.path])?.path;
      return res.status(400).send({ message: duplicateMessages[field] || "Registration information is already in use." });
    }
    logger.error(`Registration failed: ${error.message}`);
    return res.status(500).send({ message: "Registration failed." });
  }
};

controller.login = async (req, res) => {
  const userName = typeof req.body?.userName === "string" ? req.body.userName.trim().toLowerCase() : "";
  const password = req.body?.password;
  const invalid = { message: "Invalid username or password." };
  if (!userName || typeof password !== "string") return res.status(401).send(invalid);

  try {
    const user = await db.user.unscoped().findOne({ where: { userName } });
    if (!user || !(await bcrypt.compare(password, user.password))) return res.status(401).send(invalid);
    const token = await getOrCreateSession(user);
    return res.status(200).send(responseFor(user, token));
  } catch (error) {
    logger.error(`Login failed: ${error.message}`);
    return res.status(500).send({ message: "Login failed." });
  }
};

controller.logout = async (req, res) => {
  try {
    await req.session.destroy();
    return res.status(200).send({ message: "Signed out successfully." });
  } catch (error) {
    logger.error(`Logout failed: ${error.message}`);
    return res.status(500).send({ message: "Logout failed." });
  }
};

export default controller;
