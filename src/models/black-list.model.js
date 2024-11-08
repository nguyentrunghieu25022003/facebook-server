const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../../config/index");
const User = require("./user.model");

const BlackList = sequelize.define(
  "BlackList",
  {
    BlackListID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    UserID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "UserID",
      },
    },
    Token: {
      type: DataTypes.STRING(500),
      allowNull: false,
    },
    Expiration: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    tableName: "BlackList",
    timestamps: false,
  }
);

module.exports = BlackList;
