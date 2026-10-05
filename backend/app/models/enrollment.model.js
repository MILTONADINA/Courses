export default (sequelize, DataTypes) =>
  sequelize.define("enrollment", {
    sectionId: { type: DataTypes.INTEGER, allowNull: false },
    studentId: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    indexes: [{ unique: true, fields: ["studentId", "sectionId"] }],
  });
