import db from "../models/index.js";
import logger from "../config/logger.js";

const controller = {};
const duplicateMessage = "You are already enrolled in this section.";

function isNumber(value) {
  return (typeof value === "string" || typeof value === "number") &&
    /^-?\d+$/.test(String(value)) && Number.isSafeInteger(Number(value));
}

function sectionError(value) {
  if (value === undefined || value === null || (typeof value === "string" && !value.trim())) {
    return "Section id is required.";
  }
  return isNumber(value) ? "" : "Section id must be a number.";
}

function notFound(id) {
  return { message: `Enrollment with id=${id} not found.` };
}

function findOwnedEnrollment(req) {
  return db.enrollment.findOne({ where: { id: Number(req.params.id), studentId: req.user.id } });
}

function handleError(res, error) {
  // The unique index also protects simultaneous requests for the same section.
  if (error.name === "SequelizeUniqueConstraintError") {
    return res.status(400).send({ message: duplicateMessage });
  }
  logger.error(`Enrollment request failed: ${error.message}`);
  return res.status(500).send({ message: "Request failed." });
}

async function checkSection(sectionId, studentId, res) {
  if (!(await db.section.findByPk(sectionId))) {
    res.status(404).send({ message: `Section with id=${sectionId} not found.` });
    return false;
  }
  if (await db.enrollment.findOne({ where: { sectionId, studentId } })) {
    res.status(400).send({ message: duplicateMessage });
    return false;
  }
  return true;
}

controller.create = async (req, res) => {
  const message = sectionError(req.body?.sectionId);
  if (message) return res.status(400).send({ message });
  const sectionId = Number(req.body.sectionId);
  try {
    if (!(await checkSection(sectionId, req.user.id, res))) return;
    const enrollment = await db.enrollment.create({ sectionId, studentId: req.user.id });
    return res.status(201).send(enrollment);
  } catch (error) {
    return handleError(res, error);
  }
};

controller.findAll = async (req, res) => {
  try {
    return res.status(200).send(await db.enrollment.findAll({ where: { studentId: req.user.id } }));
  } catch (error) {
    return handleError(res, error);
  }
};

controller.update = async (req, res) => {
  if (!isNumber(req.params.id)) return res.status(400).send({ message: "Enrollment id must be a number." });
  try {
    const enrollment = await findOwnedEnrollment(req);
    if (!enrollment) return res.status(404).send(notFound(Number(req.params.id)));
    const message = sectionError(req.body?.sectionId);
    if (message) return res.status(400).send({ message });
    const sectionId = Number(req.body.sectionId);
    if (!(await checkSection(sectionId, req.user.id, res))) return;
    await enrollment.update({ sectionId });
    return res.status(200).send(enrollment);
  } catch (error) {
    return handleError(res, error);
  }
};

controller.delete = async (req, res) => {
  if (!isNumber(req.params.id)) return res.status(400).send({ message: "Enrollment id must be a number." });
  try {
    const enrollment = await findOwnedEnrollment(req);
    if (!enrollment) return res.status(404).send(notFound(Number(req.params.id)));
    await enrollment.destroy();
    return res.status(200).send({ message: "Enrollment deleted successfully." });
  } catch (error) {
    return handleError(res, error);
  }
};

export default controller;
