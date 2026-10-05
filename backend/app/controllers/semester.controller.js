import db from "../models/index.js";
import logger from "../config/logger.js";

const controller = {};
const datePattern = /^\d{4}-\d{2}-\d{2}$/;

function isCalendarDate(value) {
  if (typeof value !== "string" || !datePattern.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

function readSemester(body) {
  const data = body || {};
  const semsterName = typeof data.semsterName === "string" ? data.semsterName.trim() : "";
  return { semsterName, startDate: data.startDate, endDate: data.endDate };
}

function validateSemester(values) {
  if (!values.semsterName) return "Semester name is required.";
  if (values.startDate === undefined || values.startDate === null || values.startDate === "") {
    return "Start date is required.";
  }
  if (!isCalendarDate(values.startDate)) return "Enter a valid start date.";
  if (values.endDate === undefined || values.endDate === null || values.endDate === "") {
    return "End date is required.";
  }
  if (!isCalendarDate(values.endDate)) return "Enter a valid end date.";
  return "";
}

function parseId(value) {
  if (!/^\d+$/.test(String(value))) return null;
  return Number(value);
}

function notFound(id) {
  return { message: `Semester with id=${id} not found.` };
}

controller.create = async (req, res) => {
  const values = readSemester(req.body);
  const message = validateSemester(values);
  if (message) return res.status(400).send({ message });

  try {
    const semester = await db.semester.create(values);
    return res.status(201).send(semester);
  } catch (error) {
    logger.error(`Semester create failed: ${error.message}`);
    return res.status(500).send({ message: "Semester could not be created." });
  }
};

controller.findAll = async (_req, res) => {
  try {
    const semesters = await db.semester.findAll({
      order: [["startDate", "ASC"], ["semsterName", "ASC"]],
    });
    return res.status(200).send(semesters);
  } catch (error) {
    logger.error(`Semester list failed: ${error.message}`);
    return res.status(500).send({ message: "Semesters could not be loaded." });
  }
};

controller.update = async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).send({ message: "Semester id must be a number." });

  const values = readSemester(req.body);
  const message = validateSemester(values);
  if (message) return res.status(400).send({ message });

  try {
    const semester = await db.semester.findByPk(id);
    if (!semester) return res.status(404).send(notFound(id));
    await semester.update(values);
    return res.status(200).send(semester);
  } catch (error) {
    logger.error(`Semester update failed: ${error.message}`);
    return res.status(500).send({ message: "Semester could not be updated." });
  }
};

controller.delete = async (req, res) => {
  const id = parseId(req.params.id);
  if (id === null) return res.status(400).send({ message: "Semester id must be a number." });

  try {
    const semester = await db.semester.findByPk(id);
    if (!semester) return res.status(404).send(notFound(id));
    if (await db.section.count({ where: { semesterId: id } })) {
      return res.status(400).send({ message: "Semester has sections and cannot be deleted." });
    }
    await semester.destroy();
    return res.status(200).send({ message: "Semester deleted successfully." });
  } catch (error) {
    logger.error(`Semester delete failed: ${error.message}`);
    return res.status(500).send({ message: "Semester could not be deleted." });
  }
};

export default controller;
