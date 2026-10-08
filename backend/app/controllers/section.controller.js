import db from "../models/index.js";
import logger from "../config/logger.js";

const controller = {};

const requiredFields = [
  ["sectionNumber", "Section number is required."],
  ["semesterId", "Semester id is required."],
  ["courseId", "Course id is required."],
  ["facultyId", "Faculty member id is required."],
  ["daysOfWeek", "Days of week is required."],
  ["startTime", "Start time is required."],
  ["endTime", "End time is required."],
];

const idFields = [
  ["semesterId", "Semester id must be a number."],
  ["courseId", "Course id must be a number."],
  ["facultyId", "Faculty member id must be a number."],
];

const timeFields = [
  ["startTime", "Start time must be in HH:MM format."],
  ["endTime", "End time must be in HH:MM format."],
];

const timePattern = /^([01]\d|2[0-3]):[0-5]\d$/;

function isNumber(value) {
  return /^-?\d+$/.test(String(value));
}

function isMissing(value) {
  return value === undefined || value === null || String(value).trim() === "";
}

function readSection(body) {
  const data = body || {};
  const values = {};
  for (const [field] of requiredFields) values[field] = data[field];
  return values;
}

function validateSection(values) {
  for (const [field, message] of requiredFields) {
    if (isMissing(values[field])) return message;
  }
  for (const [field, message] of idFields) {
    if (!isNumber(values[field])) return message;
  }
  for (const [field, message] of timeFields) {
    if (!timePattern.test(values[field])) return message;
  }
  return "";
}

async function findMissingReference(values) {
  if (!(await db.semester.findByPk(Number(values.semesterId)))) {
    return `Semester with id=${values.semesterId} not found.`;
  }
  if (!(await db.course.findByPk(Number(values.courseId)))) {
    return `Course with id=${values.courseId} not found.`;
  }
  if (!(await db.faculty.findByPk(Number(values.facultyId)))) {
    return `Faculty member with id=${values.facultyId} not found.`;
  }
  return "";
}

function toRecord(values) {
  return {
    ...values,
    semesterId: Number(values.semesterId),
    courseId: Number(values.courseId),
    facultyId: Number(values.facultyId),
  };
}

const include = [
  { model: db.semester, as: "semester", attributes: ["id", "semsterName"] },
  { model: db.course, as: "course", attributes: ["id", "courseNumber", "courseName"] },
  { model: db.faculty, as: "faculty", attributes: ["id", "firstName", "lastName"] },
];

function findSection(id) {
  return db.section.findByPk(id, { include });
}

function notFound(id) {
  return { message: `Section with id=${id} not found.` };
}

controller.findAll = async (req, res) => {
  const where = {};
  if (req.query.semesterId !== undefined) {
    if (!isNumber(req.query.semesterId)) {
      return res.status(400).send({ message: "Semester id must be a number." });
    }
    where.semesterId = Number(req.query.semesterId);
  }

  try {
    const sections = await db.section.findAll({
      where,
      include,
      order: [
        [{ model: db.semester, as: "semester" }, "startDate", "ASC"],
        [{ model: db.course, as: "course" }, "courseNumber", "ASC"],
        ["sectionNumber", "ASC"],
      ],
    });
    return res.status(200).send(sections);
  } catch (error) {
    logger.error(`Section list failed: ${error.message}`);
    return res.status(500).send({ message: "Sections could not be loaded." });
  }
};


const studentFields = ["id", "firstName", "lastName", "universityId", "email"];
const studentModel = { model: db.user, as: "student" };

function sectionSummary(section) {
  return {
    id: section.id,
    sectionNumber: section.sectionNumber,
    courseNumber: section.course.courseNumber,
    courseName: section.course.courseName,
    semsterName: section.semester.semsterName,
  };
}

function enrolledStudents(sectionId) {
  return db.enrollment.findAll({
    where: { sectionId },
    include: [{ ...studentModel, attributes: studentFields }],
    order: [
      [studentModel, "lastName", "ASC"],
      [studentModel, "firstName", "ASC"],
    ],
  });
}

function toStudent(enrollment) {
  const student = {};
  for (const field of studentFields) student[field] = enrollment.student[field];
  return student;
}

controller.findStudents = async (req, res) => {
  if (!isNumber(req.params.id)) return res.status(400).send({ message: "Section id must be a number." });
  const id = Number(req.params.id);

  try {
    const section = await findSection(id);
    if (!section) return res.status(404).send(notFound(id));
    const enrollments = await enrolledStudents(id);
    return res.status(200).send({ section: sectionSummary(section), students: enrollments.map(toStudent) });
  } catch (error) {
    logger.error(`Section students list failed: ${error.message}`);
    return res.status(500).send({ message: "Section students could not be loaded." });
  }
};

controller.create = async (req, res) => {
  const values = readSection(req.body);
  const message = validateSection(values);
  if (message) return res.status(400).send({ message });

  try {
    const missing = await findMissingReference(values);
    if (missing) return res.status(404).send({ message: missing });
    const created = await db.section.create(toRecord(values));
    return res.status(201).send(await findSection(created.id));
  } catch (error) {
    logger.error(`Section create failed: ${error.message}`);
    return res.status(500).send({ message: "Section could not be created." });
  }
};

controller.update = async (req, res) => {
  if (!isNumber(req.params.id)) return res.status(400).send({ message: "Section id must be a number." });
  const id = Number(req.params.id);

  const values = readSection(req.body);
  const message = validateSection(values);
  if (message) return res.status(400).send({ message });

  try {
    const section = await db.section.findByPk(id);
    if (!section) return res.status(404).send(notFound(id));
    const missing = await findMissingReference(values);
    if (missing) return res.status(404).send({ message: missing });
    await section.update(toRecord(values));
    return res.status(200).send(await findSection(id));
  } catch (error) {
    logger.error(`Section update failed: ${error.message}`);
    return res.status(500).send({ message: "Section could not be updated." });
  }
};

controller.delete = async (req, res) => {
  if (!isNumber(req.params.id)) return res.status(400).send({ message: "Section id must be a number." });
  const id = Number(req.params.id);

  try {
    const section = await db.section.findByPk(id);
    if (!section) return res.status(404).send(notFound(id));
    await section.destroy();
    return res.status(200).send({ message: "Section deleted successfully." });
  } catch (error) {
    logger.error(`Section delete failed: ${error.message}`);
    return res.status(500).send({ message: "Section could not be deleted." });
  }
};

export default controller;
