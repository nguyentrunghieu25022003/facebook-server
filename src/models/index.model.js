const { sequelize } = require("../../config/index");
const User = require("./user.model");
const Post = require("./post.model");
const Comment = require("./comment.model");
const Reply = require("./reply.model");
const Like = require("./like.model");
const Friendship = require("./friendship.model");
const Message = require("./message.model");
const Notification = require("./notification.model");
const CommentLike = require("./comment-like.model");
const Story = require("./story.model");
const BlackList = require("./black-list.model");

// Một người dùng có thể có nhiều bài đăng và mỗi bài đăng chỉ thuộc về một người dùng
User.hasMany(Post, { foreignKey: "UserID" });
Post.belongsTo(User, { foreignKey: "UserID" });

// Một bài đăng có thể có nhiều bình luận và mỗi bình luận chỉ thuộc về một bài đăng
Post.hasMany(Comment, { foreignKey: "PostID", onDelete: "CASCADE" });
Comment.belongsTo(Post, { foreignKey: "PostID" });

// Một người dùng có thể có nhiều bình luận nhưng mỗi bình luận chỉ thuộc về một người dùng
User.hasMany(Comment, { foreignKey: "UserID" });
Comment.belongsTo(User, { foreignKey: "UserID" });

// Một bình luận có thể có nhiều câu trả lời nhưng mỗi câu trả lời chỉ thuộc về một bình luận
Comment.hasMany(Reply, { foreignKey: "CommentID", onDelete: "CASCADE" });
Reply.belongsTo(Comment, { foreignKey: "CommentID" });

// Một người dùng có thể có nhiều câu trả lời nhưng những câu trả lời đấy chỉ thuộc về một người dùng
User.hasMany(Reply, { foreignKey: "UserID" });
Reply.belongsTo(User, { foreignKey: "UserID" });

// Một bài đăng có nhiều lượt thích nhưng mỗi lượt thích chỉ thuộc về một bài đăng
Post.hasMany(Like, { foreignKey: "PostID", onDelete: "CASCADE" });
Like.belongsTo(Post, { foreignKey: "PostID" });

// Mỗi người dùng có thể đóng vai trò là người gửi tin nhắn và có thể gửi nhiều tin nhắn
User.hasMany(Message, {
  foreignKey: "SenderID",
  as: "SentMessages",
});

// Mỗi tin nhắn được gửi thuộc về một người dùng nào đó
Message.belongsTo(User, {
  foreignKey: "SenderID",
  as: "Sender",
});

// Mỗi người dùng có thể đóng vai trò là người nhận tin nhắn và có thể nhận nhiều tin nhắn
User.hasMany(Message, {
  foreignKey: "ReceiverID",
  as: "ReceivedMessages",
});

// Mỗi tin nhắn được nhận thuộc về một người dùng nào đó
Message.belongsTo(User, {
  foreignKey: "ReceiverID",
  as: "Receiver",
});

// Mỗi người dùng có thể gửi lời mời kết bạn cho nhiều người dùng khác
User.belongsToMany(User, {
  as: "RequestedFriends",
  through: Friendship,
  foreignKey: "RequesterID",
  otherKey: "ResponderID",
});

// Mỗi người dùng có thể nhận lời mời kết bạn cho nhiều người dùng khác
User.belongsToMany(User, {
  as: "ReceivedFriends",
  through: Friendship,
  foreignKey: "ResponderID",
  otherKey: "RequesterID",
});

// Một người dùng có thể nhận nhiều thông báo nhưng mỗi thông báo chỉ thuộc về một người dùng cụ thể
User.hasMany(Notification, { foreignKey: "UserID" });
Notification.belongsTo(User, { foreignKey: "UserID" });

// Mỗi bình luận có thể có nhiều lượt thích nhưng mỗi lượt thích chỉ thuộc về một comment cụ thể
Comment.hasMany(CommentLike, { foreignKey: "CommentID" });
CommentLike.belongsTo(Comment, { foreignKey: "CommentID" });

// Mỗi người dùng có thể có nhiều story và mỗi story chỉ thuộc về một người dùng
User.hasMany(Story, { foreignKey: "UserID" });
Story.belongsTo(User, { foreignKey: "UserID" });

// Một người dùng có thể nằm trong nhiều danh sách đen
User.hasMany(BlackList, { foreignKey: "UserID", onDelete: "CASCADE" });
BlackList.belongsTo(User, { foreignKey: "UserID" });

sequelize.sync({ force: false })
  .then(() => {
    console.log("Database & tables created!");
  })
  .catch((error) => {
    console.error("Failed to sync database:", error);
  });


module.exports = {
  User,
  Post,
  Comment,
  Reply,
  Like,
  Friendship,
  Message,
  Notification,
  CommentLike,
  Story,
  BlackList,
};
