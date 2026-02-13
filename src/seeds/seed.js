const { sequelize, Drop, User } = require("../models");

async function seedDatabase() {
  try {
    await sequelize.sync({ force: true });
    console.log("Database synced!");

    const users = await User.bulkCreate([
      { username: "sneaker_enthusiast" },
      { username: "collector_pro" },
      { username: "drop_hunter" },
      { username: "casual_buyer" },
      { username: "reseller_king" },
    ]);

    console.log(`Created ${users.length} sample users!`);

    const drops = await Drop.bulkCreate([
      {
        name: "Nike Air Jordan 1 Retro High OG",
        price: 170.0,
        total_stock: 50,
        available_stock: 50,
        start_time: new Date(),
        image_url: null,
      },
      {
        name: "Adidas Yeezy Boost 350 V2",
        price: 220.0,
        total_stock: 30,
        available_stock: 30,
        start_time: new Date(),
        image_url: null,
      },
      {
        name: "Nike Dunk Low Panda",
        price: 110.0,
        total_stock: 100,
        available_stock: 100,
        start_time: new Date(Date.now() + 2 * 60 * 60 * 1000),
        image_url: null,
      },
      {
        name: "New Balance 550 White Green",
        price: 130.0,
        total_stock: 75,
        available_stock: 75,
        start_time: new Date(Date.now() + 24 * 60 * 60 * 1000),
        image_url: null,
      },
      {
        name: "Converse Chuck 70 High Top",
        price: 85.0,
        total_stock: 200,
        available_stock: 200,
        start_time: new Date(Date.now() - 1 * 60 * 60 * 1000),
        image_url: null,
      },
      {
        name: "Vans Old Skool Black White",
        price: 65.0,
        total_stock: 150,
        available_stock: 150,
        start_time: new Date(),
        image_url: null,
      },
    ]);

    console.log(`Created ${drops.length} sample drops!`);

    process.exit(0);
  } catch (error) {
    console.error("Error seeding database:", error);
    process.exit(1);
  }
}

seedDatabase();
