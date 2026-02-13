const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const User = require("./User")(sequelize, DataTypes);
const Drop = require("./Drop")(sequelize, DataTypes);
const Reservation = require("./Reservation")(sequelize, DataTypes);
const Purchase = require("./Purchase")(sequelize, DataTypes);

// Associations

User.hasMany(Reservation);
Reservation.belongsTo(User);

Drop.hasMany(Reservation);
Reservation.belongsTo(Drop);

User.hasMany(Purchase);
Purchase.belongsTo(User);

Drop.hasMany(Purchase);
Purchase.belongsTo(Drop);

module.exports = {
  sequelize,
  User,
  Drop,
  Reservation,
  Purchase,
};
