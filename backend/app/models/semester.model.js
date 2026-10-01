export default (sequelize, DataTypes) => {
    const Semester = sequelize.define("semester", {
      semesterName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      startDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      endDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
    });
    return Semester;
  };