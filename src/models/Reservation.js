module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Reservation", {
      expires_at: DataTypes.DATE,
      status: {
        type: DataTypes.ENUM("active", "expired", "completed"),
        defaultValue: "active",
      },
    });
  };
  