const { Sequelize } = require("sequelize");

const sequelize = new Sequelize(process.env.DB_NAME, process.env.USER, process.env.PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
  }
);

const mysqlConnect = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (err) {
    console.error("Unable to connect to the database:", err);
  }
};

module.exports = { sequelize, mysqlConnect };