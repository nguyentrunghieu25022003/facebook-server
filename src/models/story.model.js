const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../../config/index");
const User = require("./user.model");

const Story = sequelize.define(
  "Story",
  {
    StoryID: {
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
    Content: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    ImageURL: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    VideoURL: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    tableName: "Stories",
    timestamps: false,
  }
);

module.exports = Story;