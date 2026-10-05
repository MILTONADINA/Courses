import db from "../models/index.js";
import logger from "../config/logger.js";

const controller = {};

function toCourse(enrollment) {
  const section = enrollment.section;
  const faculty = section.faculty;
  return {
    enrollmentId: enrollment.id,
    courseNumber: section.course.courseNumber,
    courseName: section.course.courseName,
    sectionNumber: section.sectionNumber,
    semsterName: section.semester.semsterName,
    daysOfWeek: section.daysOfWeek,
    startTime: section.startTime,
    endTime: section.endTime,
    instructorName: `${faculty.firstName} ${faculty.lastName}`,
  };
}

controller.findMine = async (req, res) => {
  try {
    const enrollments = await db.enrollment.findAll({
      where: { studentId: req.user.id },
      include: [{
        model: db.section,
        as: "section",
        include: [
          { model: db.course, as: "course" },
          { model: db.faculty, as: "faculty" },
          { model: db.semester, as: "semester" },
        ],
      }],
    });
    return res.status(200).send(enrollments.map(toCourse));
  } catch (error) {
    logger.error(`My courses list failed: ${error.message}`);
    return res.status(500).send({ message: "Request failed." });
  }
};

export default controller;
