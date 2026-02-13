module.exports = (sequelize, DataTypes) => {
    return sequelize.define("Drop", {
      name: DataTypes.STRING,
      price: DataTypes.FLOAT,
      total_stock: DataTypes.INTEGER,
      available_stock: DataTypes.INTEGER,
      start_time: DataTypes.DATE,
    });
  };
  