const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../../config/index");

const User = sequelize.define(
  "User",
  {
    UserID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    Username: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    Email: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true,
    },
    PhoneNumber: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    PasswordHash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    Gender: {
      type: DataTypes.ENUM("male", "female", "other"),
      defaultValue: "other",
    },
    DateOfBirth: {
      type: DataTypes.DATEONLY,
      allowNull: true,
    },
    ProfilePictureURL: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    CoverPhotoURL: {
      type: DataTypes.STRING(255),
      defaultValue: "default",
    },
    Bio: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    PrivacySettings: {
      type: DataTypes.ENUM("public", "private", "friends"),
      defaultValue: "public",
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
    LastLogin: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: "User",
    tableName: "Users",
    timestamps: false,
  }
);

module.exports = User;
