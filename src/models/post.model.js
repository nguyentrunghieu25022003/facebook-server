const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../../config/index");
const User = require("./user.model");

const Post = sequelize.define(
  "Post",
  {
    PostID: {
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
    PostType: {
      type: DataTypes.ENUM("text", "image", "video", "link"),
      allowNull: false,
    },
    Visibility: {
      type: DataTypes.ENUM("public", "friends", "private"),
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
  },
  {
    tableName: "Posts",
    timestamps: false,
  }
);

module.exports = Post;