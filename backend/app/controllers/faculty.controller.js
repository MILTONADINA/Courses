import db from "../models/index.js";
import logger from "../config/logger.js";

const controller = {};

const requiredFields = [
  ["firstName", "First name is required."],
  ["lastName", "Last name is required."],
  ["dept", "Department is required."],
];

function readFaculty(body) {
  const data = body || {};
  const values = {};
  for (const [field] of requiredFields) values[field] = data[field];
  return values;
}

function validateFaculty(values) {
  const missing = requiredFields.find(([field]) => typeof values[field] !== "string" || !values[field].trim());
  return missing ? missing[1] : "";
}

function parseId(value) {
  if (!/^-?\d+$/.test(String(value))) return null;
  return Number(value);
}

function notFound(id) {
  return { message: `Faculty member with id=${id} not found.` };
}

controller.create = async (req, res) => {
  const values = readFaculty(req.body);
  const message = validateFaculty(values);
  if (message) return res.status(400).send({ message });

  try {
    const faculty = await db.faculty.create(values);
    return res.status(201).send(faculty);
  } catch (error) {
    logger.error(`Faculty create failed: ${error.message}`);
    return res.status(500).send({ message: "Faculty member could not be created." });
  }
};

controller.findAll = async (_req, res) => {
  try {
    const faculty = await db.faculty.findAll({
      order: [["lastName", "ASC"], ["firstName", "ASC"]],
    });
    return res.status(200).send(faculty);
  } catch (error) {
    logger.error(`Faculty list failed: ${error.message}`);
    return res.status(500).send({ message: "Faculty members could not be loaded." });
  }
};

controller.update = async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).send({ message: "Faculty member id must be a number." });

  const values = readFaculty(req.body);
  const message = validateFaculty(values);
  if (message) return res.status(400).send({ message });

  try {
    const faculty = await db.faculty.findByPk(id);
    if (!faculty) return res.status(404).send(notFound(id));
    await faculty.update(values);
    return res.status(200).send(faculty);
  } catch (error) {
    logger.error(`Faculty update failed: ${error.message}`);
    return res.status(500).send({ message: "Faculty member could not be updated." });
  }
};

controller.delete = async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).send({ message: "Faculty member id must be a number." });

  try {
    const faculty = await db.faculty.findByPk(id);
    if (!faculty) return res.status(404).send(notFound(id));
    await faculty.destroy();
    return res.status(200).send({ message: "Faculty member deleted successfully." });
  } catch (error) {
    logger.error(`Faculty delete failed: ${error.message}`);
    return res.status(500).send({ message: "Faculty member could not be deleted." });
  }
};

export default controller;
