import bcrypt from "bcryptjs";
import db from "../models/index.js";
import logger from "../config/logger.js";

const profileFields = [
  ["firstName", "First name"],
  ["lastName", "Last name"],
  ["email", "Email"],
  ["universityId", "University ID"],
  ["userName", "Username"],
];

const duplicateMessages = {
  userName: "Username is already taken.",
  email: "Email is already registered.",
};

const controller = {};

function isBlank(value) {
  return typeof value !== "string" || !value.trim();
}

function parseId(value) {
  if (!/^-?\d+$/.test(String(value))) return null;
  return Number(value);
}

function readProfile(body) {
  const data = body || {};
  return {
    firstName: data.firstName,
    lastName: data.lastName,
    email: data.email,
    universityId: data.universityId,
    userName: typeof data.userName === "string" ? data.userName.trim().toLowerCase() : data.userName,
  };
}

function validateProfile(values) {
  for (const [field, label] of profileFields) {
    if (isBlank(values[field])) return `${label} is required.`;
  }
  return "";
}

async function duplicateMessage(values, ignoreId) {
  for (const field of ["userName", "email"]) {
    const existing = await db.user.findOne({ where: { [field]: values[field] } });
    if (existing && existing.id !== ignoreId) return duplicateMessages[field];
  }
  return "";
}

async function findStudent(id) {
  return db.user.findOne({ where: { id, role: "student" } });
}

function conflictMessage(error) {
  const duplicate = error?.name === "SequelizeUniqueConstraintError" || error?.parent?.code === "ER_DUP_ENTRY";
  if (!duplicate) return "";
  const detail = [
    ...(error.errors || []).map((item) => `${item.path || ""} ${item.message || ""}`),
    JSON.stringify(error.fields || {}),
    error.parent?.sqlMessage || "",
    error.message || "",
  ].join(" ");
  if (/userName/i.test(detail)) return duplicateMessages.userName;
  if (/email/i.test(detail)) return duplicateMessages.email;
  return "";
}

controller.create = async (req, res) => {
  const data = req.body || {};
  const values = readProfile(data);
  const message = validateProfile(values);
  if (message) return res.status(400).send({ message });
  if (isBlank(data.password)) return res.status(400).send({ message: "Password is required." });
  if (data.password.length < 8) {
    return res.status(400).send({ message: "Password must be at least 8 characters." });
  }

  try {
    const duplicate = await duplicateMessage(values);
    if (duplicate) return res.status(400).send({ message: duplicate });
    const created = await db.user.create({
      ...values,
      password: await bcrypt.hash(data.password, 10),
      role: "student",
    });
    const student = await db.user.findByPk(created.id);
    return res.status(201).send(student);
  } catch (error) {
    const conflict = conflictMessage(error);
    if (conflict) return res.status(400).send({ message: conflict });
    logger.error(`Student create failed: ${error.message}`);
    return res.status(500).send({ message: "Request failed." });
  }
};

controller.findAll = async (_req, res) => {
  try {
    const students = await db.user.findAll({ where: { role: "student" } });
    return res.status(200).send(students);
  } catch (error) {
    logger.error(`Student list failed: ${error.message}`);
    return res.status(500).send({ message: "Request failed." });
  }
};

controller.update = async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).send({ message: "Student id must be a number." });

  const values = readProfile(req.body);
  const message = validateProfile(values);
  if (message) return res.status(400).send({ message });

  try {
    const student = await findStudent(id);
    if (!student) return res.status(404).send({ message: `Student with id=${id} not found.` });
    const duplicate = await duplicateMessage(values, student.id);
    if (duplicate) return res.status(400).send({ message: duplicate });
    await student.update(values);
    return res.status(200).send(student);
  } catch (error) {
    const conflict = conflictMessage(error);
    if (conflict) return res.status(400).send({ message: conflict });
    logger.error(`Student update failed: ${error.message}`);
    return res.status(500).send({ message: "Request failed." });
  }
};

controller.delete = async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).send({ message: "Student id must be a number." });

  try {
    const student = await findStudent(id);
    if (!student) return res.status(404).send({ message: `Student with id=${id} not found.` });
    await db.session.destroy({ where: { userId: student.id } });
    await student.destroy();
    return res.status(200).send({ message: "Student deleted successfully." });
  } catch (error) {
    logger.error(`Student delete failed: ${error.message}`);
    return res.status(500).send({ message: "Request failed." });
  }
};

export default controller;
