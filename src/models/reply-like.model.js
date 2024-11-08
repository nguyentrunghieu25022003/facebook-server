const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../../config/index");
const User = require("./user.model");
const Reply = require("./reply.model");

const ReplyLike = sequelize.define(
  "ReplyLike",
  {
    ReplyLikeID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    ReplyID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Reply,
        key: "ReplyID",
      },
    },
    UserID: {
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
  },
  {
    tableName: "ReplyLikes",
    timestamps: false,
  }
);

module.exports = ReplyLike;
