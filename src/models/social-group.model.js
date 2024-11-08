const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../../config/index");
const User = require("./user.model");

const SocialGroup = sequelize.define(
  "SocialGroup",
  {
    GroupID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    GroupName: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    GroupDescription: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    CreatedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "UserID",
      },
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    UpdatedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    tableName: "SocialGroups",
    timestamps: false,
  }
);

module.exports = SocialGroup;
