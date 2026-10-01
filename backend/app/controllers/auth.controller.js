import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { randomUUID } from "crypto";
import db from "../models/index.js";
import authConfig from "../config/auth.config.js";
import logger from "../config/logger.js";

const required = [
  ["firstName", "First name"], ["lastName", "Last name"],
  ["email", "Email"], ["universityId", "University ID"],
  ["userName", "Username"], ["password", "Password"],
];
const sessionLifetimeMs = 24 * 60 * 60 * 1000;

const isBlank = (value) => typeof value !== "string" || !value.trim();

function loginResponse(user, token) {
  return {
    userId: user.id, firstName: user.firstName, lastName: user.lastName,
    email: user.email, userName: user.userName, role: user.role, token,
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
};

const controller = {};

controller.register = async (req, res) => {
  const data = req.body || {};
  for (const [field, label] of required) {
    if (isBlank(data[field])) {
      return res.status(400).send({ message: `${label} is required.` });
    }
  }
  if (data.password.length < 8) {
    return res.status(400).send({ message: "Password must be at least 8 characters." });
  }

  const values = {
    firstName: data.firstName, lastName: data.lastName,
    email: data.email, universityId: data.universityId,
    userName: data.userName.trim().toLowerCase(), role: "student",
  };

  try {
    for (const field of ["userName", "email"]) {
      if (await db.user.findOne({ where: { [field]: values[field] } })) {
        return res.status(400).send({ message: duplicateMessages[field] });
      }
    }
    const user = await db.user.create({ ...values, password: await bcrypt.hash(data.password, 10) });
    return res.status(201).send({
      id: user.id, firstName: user.firstName, lastName: user.lastName,
      email: user.email, universityId: user.universityId,
      userName: user.userName, role: user.role,
    });
  } catch (error) {
    logger.error(`Registration failed: ${error.message}`);
    return res.status(500).send({ message: "Registration failed." });
  }
};

controller.login = async (req, res) => {
  const { userName, password } = req.body || {};
  if (isBlank(userName)) return res.status(400).send({ message: "Username is required." });
  if (isBlank(password)) return res.status(400).send({ message: "Password is required." });

  try {
    const user = await db.user.unscoped().findOne({ where: { userName: userName.trim().toLowerCase() } });
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).send({ message: "Invalid username or password." });
    }
    const token = await getOrCreateSession(user);
    return res.status(200).send(loginResponse(user, token));
  } catch (error) {
    logger.error(`Login failed: ${error.message}`);
    return res.status(500).send({ message: "Login failed." });
  }
};

controller.logout = async (req, res) => {
  try {
    // Clear the token so the session can no longer authenticate (security.mdc).
    await req.session.update({ token: "" });
    return res.status(200).send({ message: "Signed out successfully." });
  } catch (error) {
    logger.error(`Logout failed: ${error.message}`);
    return res.status(500).send({ message: "Logout failed." });
  }
};

export default controller;
