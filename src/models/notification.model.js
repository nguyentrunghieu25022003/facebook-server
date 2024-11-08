const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../../config/index");
const User = require("./user.model");

const Notification = sequelize.define(
  "Notification",
  {
    NotificationID: {
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
    NotificationType: {
      type: DataTypes.ENUM("like", "comment", "friend_request", "system"),
      allowNull: false,
    },
    ReferenceID: {
      type: DataTypes.INTEGER,
      allowNull: true,
    },
    Message: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    IsRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    tableName: "Notifications",
    timestamps: false,
  }
);

module.exports = Notification;