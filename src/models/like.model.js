const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../../config/index");
const User = require("./user.model");
const Post = require("./post.model");

const Like = sequelize.define(
  "Like",
  {
    LikeID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    PostID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Post,
        key: "PostID",
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
    tableName: "Likes",
    timestamps: false,
  }
);

module.exports = Like;
