const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../../config/index");
const User = require("./user.model");

const Message = sequelize.define(
  "Message",
  {
    MessageID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    SenderID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: "UserID",
      },
    },
    ReceiverID: {
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
    AudioURL: {
      type: DataTypes.STRING(255),
      allowNull: true,
    },
    MessageType: {
      type: DataTypes.ENUM("text", "image", "video"),
      allowNull: false,
    },
    CreatedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
    IsRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
  },
  {
    tableName: "Messages",
    timestamps: false,
  }
);

module.exports = Message;
