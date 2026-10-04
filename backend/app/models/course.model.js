export default (sequelize, DataTypes) => {
  const Course = sequelize.define("course", {
    courseNumber: { type: DataTypes.STRING, allowNull: false },
    courseName: { type: DataTypes.STRING, allowNull: false },
    courseDescription: { type: DataTypes.STRING, allowNull: false },
    courseSemesters: { type: DataTypes.STRING, allowNull: false },
    courseFrequency: { type: DataTypes.STRING, allowNull: false },
    courseHours: { type: DataTypes.STRING, allowNull: false },
    courseDept: { type: DataTypes.STRING, allowNull: false },
  });
  return Course;
};
