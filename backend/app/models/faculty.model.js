export default (sequelize, DataTypes) => {
  const Faculty = sequelize.define(
    "faculty",
    {
      firstName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      lastName: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      dept: {
        type: DataTypes.STRING,
        allowNull: false,
      },
    },
    { tableName: "faculty" },
  );
  return Faculty;
};
