export default (sequelize, DataTypes) =>
  sequelize.define("session", {
    token: { type: DataTypes.STRING(1024), allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false },
    expirationDate: { type: DataTypes.DATE, allowNull: false },
    userId: { type: DataTypes.INTEGER, allowNull: false },
  });
