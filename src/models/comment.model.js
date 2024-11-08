const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../../config/index");
const User = require("./user.model");
const Post = require("./post.model");

const Comment = sequelize.define(
  "Comment",
  {
    CommentID: {
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
    UpdatedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
      onUpdate: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    tableName: "Comments",
    timestamps: false,
  }
);

module.exports = Comment;
