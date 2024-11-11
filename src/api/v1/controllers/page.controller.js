const { Op } = require("sequelize");
const { sequelize } = require("../../../../config/index");
const {
  User,
  Post,
  Comment,
  Reply,
  Like,
  Friendship,
  Notification,
  CommentLike,
  Story
} = require("../../../models/index.model");

module.exports.getAllDataHomepage = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const posts = await Post.findAll({
      where: {
        [Op.or]: [
          { UserID: userId },
          {
            UserID: {
              [Op.in]: sequelize.literal(`(
                  SELECT 
                    CASE 
                      WHEN RequesterID = ${userId} THEN ResponderID 
                      ELSE RequesterID 
                    END
                  FROM Friendships
                  WHERE 
                    (RequesterID = ${userId} OR ResponderID = ${userId}) 
                    AND FriendshipStatus = 'accepted'
                )`),
            },
          },
        ],
      },
      include: [
        {
          model: User,
          attributes: ["UserID", "Username", "ProfilePictureURL"],
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ["UserID", "Username", "ProfilePictureURL"],
            },
            {
              model: Reply,
              include: [
                {
                  model: User,
                  attributes: ["UserID", "Username", "ProfilePictureURL"],
                },
              ],
            },
            { 
              model: CommentLike,
            }
          ],
        },
        {
          model: Like,
          attributes: ["UserID"],
        },
      ],
      order: [["CreatedAt", "DESC"]],
    });

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.handleCreatePost = async (req, res) => {
  try {
    const { UserID, Content, PostType } = req.body;
    const FileURL = req?.file ? req?.file.filename : null;
    const fileType = req?.file?.mimetype.split("/")[0];
    let ImageURL = null;
    let VideoURL = null;
    
    if (fileType === "image") {
      ImageURL = `/uploads/${FileURL}`;
    } else if (fileType === "video") {
      VideoURL = `/uploads/${FileURL}`;
    }

    const user = await User.findByPk(UserID, {
      attributes: ["UserID", "Username", "ProfilePictureURL"],
    });

    if (!user) {
      return res.status(404).send("User not found !");
    }

    const newPost = await Post.create({
      UserID: parseInt(UserID),
      Content: Content,
      ImageURL: ImageURL,
      VideoURL: VideoURL,
      PostType: PostType,
    });

    const createdPost = await Post.findOne({
      where: { UserID: newPost.UserID },
      include: {
        model: User,
        attributes: ["UserID", "ProfilePictureURL", "Username"],
      },
      order: [["CreatedAt", "DESC"]],
    });

    const friendships = await User.findOne({
      where: { UserID: UserID },
      attributes: ["UserID", "Username", "ProfilePictureURL"],
      include: [
        {
          model: User,
          as: "RequestedFriends",
          attributes: ["UserID", "Username", "ProfilePictureURL"],
          through: {
            model: Friendship,
            where: { FriendshipStatus: "accepted" }
          },
        },
        {
          model: User,
          as: "ReceivedFriends",
          attributes: ["UserID", "Username", "ProfilePictureURL"],
          through: {
            model: Friendship,
            where: { FriendshipStatus: "accepted" }
          },
        },
      ],
    });

    if (!friendships) {
      return res.status(404).send("User not found!");
    }

    const io = req.app.get("socketio");
    const message = `${user.Username} just posted a new article`;

    const allFriends = [...friendships.ReceivedFriends, ...friendships.RequestedFriends];
    
    allFriends.forEach(async (friend) => {
      await Notification.create({
        UserID: friend.UserID,
        NotificationType: "system",
        ReferenceID: newPost.PostID,
        Message: message
      });
      io.to(`user_${friend.UserID}`).emit("addedPost", { message });
    });

    res.status(200).json({ message: "Success", post: createdPost });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.handleLikePost = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const UserID = parseInt(req.body.UserID);
    const PostID = parseInt(req.body.PostID);
    const post = await Post.findByPk(PostID);

    if (!post) {
      await transaction.rollback();
      return res.status(404).send("The post does not exist or has been deleted !");
    }

    const like = await Like.findOne({ where: { UserID, PostID } });

    let message = "";

    if (like) {
      await Like.destroy({ where: { PostID, UserID }, transaction });
      message = "Unliked the post successfully.";
    } else {
      await Like.create({ PostID, UserID }, { transaction });
      message = "Liked the post successfully.";
    }

    await transaction.commit();

    const user = await User.findByPk(UserID);

    if(post.UserID !== user.UserID) {
      const io = req.app.get("socketio");
      const Message = `${user.Username} just liked your post`;

      await Notification.create({
        UserID: post.UserID,
        NotificationType: "like",
        ReferenceID: post.PostID,
        Message: Message
      });
      io.to(`user_${post.UserID}`).emit("statusPost", { Message });
    }

    res.status(200).json({ message });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.handleEditPost = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);
    const Content = req.body.Content;

    await Post.update(
      { Content: Content, UpdatedAt: Date.now() },
      {
        where: { PostID: postId },
      }
    );

    res.status(200).json({ message: "Updated post successfully." });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.handleDeletePost = async (req, res) => {
  try {
    const postId = parseInt(req.params.postId);

    await Like.destroy({ where: { PostID: postId } });
    const comments = await Comment.findAll({ where: { PostID: postId } });
    const commentIds = comments.map((c) => c.CommentID);
    await Reply.findAll({
      where: {
        CommentID: commentIds,
      },
    });
    await Comment.destroy({ where: { PostID: postId } });

    const deletionResult = await Post.destroy({ where: { PostID: postId } });
    if (deletionResult === 0) {
      return res.status(404).send("Not found!");
    }

    res.status(200).json({ message: "Delete post successfully." });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.handleCommentPost = async (req, res) => {
  try {
    const { UserID, Content, PostID } = req.body;
    const FileURL = req?.file ? req?.file?.filename : null;
    const fileType = req?.file?.mimetype.split("/")[0];
    let ImageURL = null;
    let VideoURL = null;
    
    if (fileType === "image") {
      ImageURL = `/uploads/${FileURL}`;
    } else if (fileType === "video") {
      VideoURL = `/uploads/${FileURL}`;
    }

    const newComment = await Comment.create({
      PostID: PostID,
      UserID: UserID,
      Content: Content,
      ImageURL: ImageURL,
      VideoURL: VideoURL
    });

    const createdComment = await Comment.findOne({
      where: { CommentID: newComment.CommentID },
      include: [User],
    });

    const user = await User.findByPk(UserID);
    const post = await Post.findByPk(PostID);

    if(post.UserID !== user.UserID) {
      const io = req.app.get("socketio");
      const Message = `${user.Username} just commented your post`;

      await Notification.create({
        UserID: post.UserID,
        NotificationType: "comment",
        ReferenceID: post.PostID,
        Message: Message
      });
      io.to(`user_${post.UserID}`).emit("commentedPost", { Message });
    }

    res.status(200).json(createdComment);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.handleEditComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { content } = req.body;

    const currentComment = await Comment.findByPk(commentId);
    if (!currentComment) {
      return res.status(404).send("Comment not found !");
    }

    await Comment.update(
      { Content: content, UpdatedAt: Date.now() },
      {
        where: { CommentID: commentId },
      }
    );

    res.status(200).json({ newContent: content });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.handleDeleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    await Comment.destroy({
      where: { CommentID: commentId },
    });

    res.json({ message: "Delete comment successfully !" });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.handleFilterComments = async (req, res) => {
  try {
    const { PostID, Type } = req.body;
    const sortType = Type === "default" ? "ASC" : "DESC";

    const post = await Post.findByPk(PostID);
    if (!post) {
      return res.status(404).send("No post found !");
    }

    const comments = await Comment.findAll({
      where: { PostID: PostID },
      order: [["CreatedAt", sortType]],
      include: [
        {
          model: User,
          attributes: ["UserID", "Username", "ProfilePictureURL"],
        },
        {
          model: Reply,
          include: [
            {
              model: User,
              attributes: ["UserID", "Username", "ProfilePictureURL"],
            },
          ],
        },
        { 
          model: CommentLike
        }
      ],
    });

    res.status(200).json(comments);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.handleReplyComment = async (req, res) => {
  try {
    const CommentID = parseInt(req.params.commentId);
    const UserID = parseInt(req.body.userId);
    const Content = req.body.content;
    const FileURL = req.file ? req.file.filename : null;
    const fileType = req.file.mimetype.split("/")[0];
    let ImageURL = null;
    let VideoURL = null;
    
    if (fileType === "image") {
      ImageURL = `/uploads/${FileURL}`;
    } else if (fileType === "video") {
      VideoURL = `/uploads/${FileURL}`;
    }

    await Reply.create({
      CommentID: CommentID,
      UserID: UserID,
      Content: Content,
      ImageURL: ImageURL,
      VideoURL: VideoURL,
      CreatedAt: Date.now(),
      UpdatedAt: Date.now(),
    });

    const updatedComment = await Comment.findOne({
      where: { CommentID: CommentID },
      include: [
        {
          model: User,
          attributes: ["UserID", "Username", "ProfilePictureURL"],
        },
        {
          model: Reply,
          include: [
            {
              model: User,
              attributes: ["UserID", "Username", "ProfilePictureURL"],
            },
          ],
        },
      ],
      order: [[{ model: Reply }, "CreatedAt", "ASC"]],
    });

    res.status(200).json(updatedComment.Replies);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.handleLikeComment = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const CommentID = parseInt(req.params.commentId);
    const UserID = parseInt(req.body.userId);
    const comment = await Comment.findByPk(CommentID);

    if (!comment) {
      return res.status(404).json("Comment not found !");
    }

    const like = await CommentLike.findOne({ where: { UserID, CommentID } });
    let message = "";
    if (like) {
      await CommentLike.destroy({ where: { CommentID, UserID }, transaction });
      message = "Unliked the comment successfully.";
    } else {
      await CommentLike.create({ CommentID, UserID }, { transaction });
      message = "Liked the comment successfully.";
    }

    await transaction.commit();
    res.status(200).json({ message });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.handleGetProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findByPk(userId, {
      attributes: [
        "UserID",
        "Username",
        "ProfilePictureURL",
        "Bio",
        "CoverPhotoURL",
        "Email",
        "DateOfBirth",
        "Gender",
      ],
    });

    if (!user) {
      return res.status(404).send("User not found !");
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.handleGetFriendsList = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const friendships = await User.findOne({
      where: { UserID: userId },
      attributes: ["UserID", "Username", "ProfilePictureURL"],
      include: [
        {
          model: User,
          as: "RequestedFriends",
          attributes: ["UserID", "Username", "ProfilePictureURL"],
          through: {
            model: Friendship,
            where: { FriendshipStatus: "accepted" }
          },
        },
        {
          model: User,
          as: "ReceivedFriends",
          attributes: ["UserID", "Username", "ProfilePictureURL"],
          through: {
            model: Friendship,
            where: { FriendshipStatus: "accepted" }
          },
        },
      ],
    });

    if (!friendships) {
      return res.status(404).send("User not found!");
    }

    res.status(200).json(friendships);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.handleGetAllMyPost = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const posts = await Post.findAll({
      where: { UserID: userId },
      include: [
        {
          model: User,
          attributes: ["UserID", "Username", "ProfilePictureURL"],
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ["UserID", "Username", "ProfilePictureURL"],
            },
            {
              model: Reply,
              include: [
                {
                  model: User,
                  attributes: ["UserID", "Username", "ProfilePictureURL"],
                },
              ],
            },
            {
              model: CommentLike
            }
          ],
        },
        {
          model: Like,
          attributes: ["UserID"],
        },
      ],
    });

    res.status(200).json(posts);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.handleGetNotifications = async (req, res) => {
  try {
    const UserID = parseInt(req.params.userId);
    const user = await User.findByPk(UserID);

    if (!user) {
      return res.status(404).status("User not found");
    }

    const notifications = await Notification.findAll({
      where: { UserID: UserID },
      include: [
        {
          model: User, 
          attributes: ["UserID", "Username", "ProfilePictureURL"], 
        }
      ],
      order: [["CreatedAt", "DESC"]],
    });

    const countNotifications = await Notification.count({
      where: { IsRead: false, UserID: UserID }
    });

    res.status(200).json({ notifications: notifications, countNotifications: countNotifications });
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.handleGetFriendListSuggested = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const friendships = await User.findOne({
      where: { UserID: userId },
      attributes: ["UserID", "Username", "ProfilePictureURL"],
      include: [
        {
          model: User,
          as: "RequestedFriends",
          attributes: ["UserID", "Username", "ProfilePictureURL"],
          through: {
            model: Friendship,
            where: { FriendshipStatus: "requested" }
          },
        },
        {
          model: User,
          as: "ReceivedFriends",
          attributes: ["UserID", "Username", "ProfilePictureURL"],
          through: {
            model: Friendship,
            where: { FriendshipStatus: "requested" }
          },
        },
      ],
    });

    res.status(200).json(friendships);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.getAllStories = async (req, res) => {
  try {
    const userId = parseInt(req.params.userId);

    const friendships = await User.findOne({
      where: { UserID: userId },
      attributes: ["UserID", "Username", "ProfilePictureURL"],
      include: [
        {
          model: User,
          as: "RequestedFriends",
          attributes: ["UserID", "Username", "ProfilePictureURL"],
          through: {
            model: Friendship,
            attributes: ["FriendshipStatus"],
            where: { FriendshipStatus: "accepted" }
          },
          include: [
            {
              model: Story,
            }
          ]
        },
        {
          model: User,
          as: "ReceivedFriends",
          attributes: ["UserID", "Username", "ProfilePictureURL"],
          through: {
            model: Friendship,
            attributes: ["FriendshipStatus"],
            where: { FriendshipStatus: "accepted" }
          },
          include: [
            {
              model: Story,
            }
          ]
        },
      ],
    });
    res.status(200).json(friendships);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.getAllVideos = async (req, res) => {
  try {
    const posts = await Post.findAll({
      where: {
        PostType: "video"
      },
      include: [
        {
          model: User,
          attributes: ["UserID", "Username", "ProfilePictureURL"],
        },
        {
          model: Comment,
          include: [
            {
              model: User,
              attributes: ["UserID", "Username", "ProfilePictureURL"],
            },
            {
              model: Reply,
              include: [
                {
                  model: User,
                  attributes: ["UserID", "Username", "ProfilePictureURL"],
                },
              ],
            },
            { 
              model: CommentLike,
            }
          ],
        },
        {
          model: Like,
          attributes: ["UserID"],
        },
      ],
      order: [["CreatedAt", "DESC"]],
    });
    res.status(200).json(posts);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};

module.exports.handleSearchUser = async (req, res) => {
  try {
    const { Username } = req.body;
    const users = await User.findAll({
      where: {
        Username: {
          [Op.like]: `%${Username.toLowerCase()}%`
        }
      }
    });
    res.status(200).json(users);
  } catch (err) {
    res.status(500).send("Error: " + err.message);
  }
};