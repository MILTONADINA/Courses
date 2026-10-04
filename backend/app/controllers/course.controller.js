import db from "../models/index.js";
import logger from "../config/logger.js";

const fields = [
  ["courseNumber", "Course number"],
  ["courseName", "Course name"],
  ["courseDescription", "Course description"],
  ["courseSemesters", "Course semesters"],
  ["courseFrequency", "Course frequency"],
  ["courseHours", "Course hours"],
  ["courseDept", "Course department"],
];

const controller = {};

function readCourse(body) {
  const data = body || {};
  const values = {};
  for (const [field] of fields) values[field] = data[field];
  return values;
}

function validateCourse(values) {
  for (const [field, label] of fields) {
    if (typeof values[field] !== "string" || !values[field].trim()) {
      return `${label} is required.`;
    }
  }
  return "";
}

function parseId(value) {
  if (!/^-?\d+$/.test(String(value))) return null;
  return Number(value);
}

controller.create = async (req, res) => {
  const values = readCourse(req.body);
  const message = validateCourse(values);
  if (message) return res.status(400).send({ message });

  try {
    const course = await db.course.create(values);
    return res.status(201).send(course);
  } catch (error) {
    logger.error(`Course create failed: ${error.message}`);
    return res.status(500).send({ message: "Request failed." });
  }
};

controller.findAll = async (_req, res) => {
  try {
    const courses = await db.course.findAll();
    return res.status(200).send(courses);
  } catch (error) {
    logger.error(`Course list failed: ${error.message}`);
    return res.status(500).send({ message: "Request failed." });
  }
};

controller.update = async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).send({ message: "Course id must be a number." });

  const values = readCourse(req.body);
  const message = validateCourse(values);
  if (message) return res.status(400).send({ message });

  try {
    const course = await db.course.findByPk(id);
    if (!course) return res.status(404).send({ message: `Course with id=${id} not found.` });
    await course.update(values);
    return res.status(200).send(course);
  } catch (error) {
    logger.error(`Course update failed: ${error.message}`);
    return res.status(500).send({ message: "Request failed." });
  }
};

controller.delete = async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).send({ message: "Course id must be a number." });

  try {
    const course = await db.course.findByPk(id);
    if (!course) return res.status(404).send({ message: `Course with id=${id} not found.` });
    await course.destroy();
    return res.status(200).send({ message: "Course deleted successfully." });
  } catch (error) {
    logger.error(`Course delete failed: ${error.message}`);
    return res.status(500).send({ message: "Request failed." });
  }
};

export default controller;
