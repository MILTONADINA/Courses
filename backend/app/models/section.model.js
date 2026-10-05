function hoursAndMinutes(value) {
  return typeof value === "string" ? value.slice(0, 5) : value;
}

export default (sequelize, DataTypes) => {
  const Section = sequelize.define("section", {
    sectionNumber: { type: DataTypes.STRING, allowNull: false },
    daysOfWeek: { type: DataTypes.STRING, allowNull: false },
    startTime: {
      type: DataTypes.TIME,
      allowNull: false,
      get() {
        return hoursAndMinutes(this.getDataValue("startTime"));
      },
    },
    endTime: {
      type: DataTypes.TIME,
      allowNull: false,
      get() {
        return hoursAndMinutes(this.getDataValue("endTime"));
      },
    },
  });
  return Section;
};
