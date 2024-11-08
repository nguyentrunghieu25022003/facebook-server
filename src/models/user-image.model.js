const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../../config/index");
const User = require("./user.model");

const UserImage = sequelize.define(
  "UserImage",
  {
    ImageID: {
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
    ImageURL: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Caption: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    UploadedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    tableName: "UserImages",
    timestamps: false,
  }
);

module.exports = UserImage;
