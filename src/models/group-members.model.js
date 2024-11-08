const { Sequelize, DataTypes } = require("sequelize");
const { sequelize } = require("../../config/index");
const SocialGroup = require("./social-group.model");
const User = require("./user.model");

const GroupMember = sequelize.define(
  "GroupMember",
  {
    MemberID: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    GroupID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: SocialGroup,
        key: "GroupID",
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
    MemberRole: {
      type: DataTypes.ENUM("member", "admin"),
      defaultValue: "member",
    },
    JoinedAt: {
      type: DataTypes.DATE,
      defaultValue: Sequelize.literal("CURRENT_TIMESTAMP"),
    },
  },
  {
    tableName: "GroupMembers",
    timestamps: false,
  }
);

module.exports = GroupMember;
