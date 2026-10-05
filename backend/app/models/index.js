import { Sequelize } from "sequelize";
import sequelize from "../config/sequelizeInstance.js";
import userModel from "./user.model.js";
import sessionModel from "./session.model.js";
import semesterModel from "./semester.model.js";
import courseModel from "./course.model.js";
import facultyModel from "./faculty.model.js";
import sectionModel from "./section.model.js";
import enrollmentModel from "./enrollment.model.js";

const db = {};
db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.user = userModel(sequelize, Sequelize);
db.session = sessionModel(sequelize, Sequelize);
db.semester = semesterModel(sequelize, Sequelize);
db.course = courseModel(sequelize, Sequelize);
db.faculty = facultyModel(sequelize, Sequelize);
db.section = sectionModel(sequelize, Sequelize);
db.enrollment = enrollmentModel(sequelize, Sequelize);

db.user.hasMany(db.session, { foreignKey: { name: "userId", allowNull: false }, as: "sessions" });
db.session.belongsTo(db.user, { foreignKey: { name: "userId", allowNull: false }, as: "user" });

const semesterKey = { name: "semesterId", allowNull: false };
const courseKey = { name: "courseId", allowNull: false };
const facultyKey = { name: "facultyId", allowNull: false };
db.semester.hasMany(db.section, { foreignKey: semesterKey, as: "sections", onDelete: "RESTRICT" });
db.section.belongsTo(db.semester, { foreignKey: semesterKey, as: "semester", onDelete: "RESTRICT" });
db.course.hasMany(db.section, { foreignKey: courseKey, as: "sections", onDelete: "RESTRICT" });
db.section.belongsTo(db.course, { foreignKey: courseKey, as: "course", onDelete: "RESTRICT" });
db.faculty.hasMany(db.section, { foreignKey: facultyKey, as: "sections", onDelete: "RESTRICT" });
db.section.belongsTo(db.faculty, { foreignKey: facultyKey, as: "faculty", onDelete: "RESTRICT" });

const sectionKey = { name: "sectionId", allowNull: false };
const studentKey = { name: "studentId", allowNull: false };
db.section.hasMany(db.enrollment, { foreignKey: sectionKey, as: "enrollments", onDelete: "CASCADE" });
db.enrollment.belongsTo(db.section, { foreignKey: sectionKey, as: "section", onDelete: "CASCADE" });
db.user.hasMany(db.enrollment, { foreignKey: studentKey, as: "enrollments", onDelete: "CASCADE" });
db.enrollment.belongsTo(db.user, { foreignKey: studentKey, as: "student", onDelete: "CASCADE" });

export default db;
