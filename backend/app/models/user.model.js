export default (sequelize, DataTypes) =>
  sequelize.define("user", {
    firstName: { type: DataTypes.STRING, allowNull: false },
    lastName: { type: DataTypes.STRING, allowNull: false },
    email: { type: DataTypes.STRING, allowNull: false, unique: true },
    universityId: { type: DataTypes.STRING, allowNull: false, unique: true },
    userName: { type: DataTypes.STRING, allowNull: false, unique: true },
    password: { type: DataTypes.STRING, allowNull: false },
    role: { type: DataTypes.ENUM("admin", "student"), allowNull: false },
  }, { defaultScope: { attributes: { exclude: ["password"] } } });
