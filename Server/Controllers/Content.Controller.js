import Notification from "../module/Notification.module.js";
import Post from "../module/Post.module.js";
import User from "../module/user.module.js";
import AppError from "../utils/AppError.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
// post //

export const PostUpload = async (req, res, next) => {
  const { id, userName } = req.user;

  const { title, description } = req.body;

  if (!title || !description || !id) {
    return next(new AppError("All fields are required", 400));
  }

  const post = await Post.create({
    userId: id,
    userName,
    title,
    description,

    Post: {
      public_id: "this one time use",
      secure_url: "this one time use",
    },
  });

  if (!post) {
    return next(
      new AppError("Post is Upload is fail..., please try again", 400)
    );
  }

  if (req.file) {
    try {
      const PostUpload = await cloudinary.v2.uploader.upload(req.file.path, {
        folder: "Post",
      });

      if (PostUpload) {
        post.Post.public_id = PostUpload.public_id;

        post.Post.secure_url = PostUpload.secure_url;
      }
    } catch (error) {
      return next(
        new AppError(
          JSON.stringify(error.message) || "file is not uploaded",
          400
        )
      );
    }
  }

  await post.save();

  res.status(201).json({
    success: true,
    message: "Post  successfully Upload... and send notification",
    post,
  });
};
export const postUpdate = async (req, res, next) => {
  const { id, userName } = req.params;
  try {
    if (!id) {
      return next(new AppError("id is required", 400));
    }
    const post = await Post.findByIdAndUpdate(
      id,
      {
        $set: { ...req.body, userName },
      },
      {
        new: true,
        runValidators: true,
      }
    );
    if (!post) {
      return next(new AppError("post is does not exit,please try again", 400));
    }

    res.status(200).json({
      success: true,
      data: post,
      message: "post successfully update...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const getPost = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new AppError("id is required", 400));
  }
  try {
    const post = await Post.findById(id);
    if (!post) {
      return next(new AppError("post is does not exit,please try again", 400));
    }
    res.status(200).json({
      success: true,
      data: post,
      message: "successfully get post...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const deletePostById = async (req, res, next) => {
  const { id } = req.params;
  if (!id) {
    return next(new AppError("id is required", 400));
  }
  try {
    const post = await Post.findByIdAndDelete(id);
    if (!post) {
      return next(new AppError("post is does not exit,please try again", 400));
    }
    res.status(200).json({
      success: true,

      message: "successfully delete post...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const getAllPost = async (req, res, next) => {
  try {
    const AllPostGetCount = await Post.countDocuments();
    const AllPostGet = await Post.find({});
    res.status(200).json({
      Success: true,
      AllPostGetCount,
      AllPostGet,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
// comment api//for post///
export const addCommentPost = async (req, res, next) => {
  const { comment } = req.body;
  const { userName } = req.user;
  const { id } = req.params;
  if (!comment || !userName) {
    return next(new AppError("all filed is required", 400));
  }

  if (!id) {
    return next(new AppError("id is required", 400));
  }

  try {
    const userNameExit = await User.findOne({ userName });
    if (!userNameExit) {
      return next(new AppError("enter valid user name,please try again", 400));
    }
    const post = await Post.findById(id);

    if (!post) {
      return next(new AppError("post is does not exit,please try again", 400));
    }
    post.comments.push({
      userName: userName,
      comment: comment,
      createdAt: new Date(),
    });

    post.numberOfComment = post.comments.length;
    await post.save();

    if (post.userId && post.userId.userName !== userName) {
      const notification = new Notification({
        userId: post.userId,

        message: `${userName} commented on your post: "${comment}"`,
        type: "comment",
        read: false,
      });

      await notification.save();
    }
    res.status(200).json({
      success: true,
      data: post,
      numberOfComment: post.numberOfComment,

      message: "successfully comment ...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const AddReplayToComment = async (req, res, next) => {
  const { postId, commentId } = req.params;
  const { reply } = req.body;
  const { userName } = req.user;

  if (!userName || !reply) {
    return next(new AppError("Username and reply text are required.", 400));
  }

  try {
    const post = await Post.findById(postId);

    if (!post) {
      return next(new AppError("Post not found.", 404));
    }

    const comment = post.comments.id(commentId);

    if (!comment) {
      return next(new AppError("Comment not found.", 404));
    }

    comment.replies.push({ userName, reply, createdAt: new Date() });

    await post.save();

    res.status(200).json({
      success: true,
      message: "Reply added successfully.",
      data: post,
    });
  } catch (error) {
    next(new AppError(error.message, 500));
  }
};
export const removeReplayToComment = async (req, res, next) => {
  const { postId, commentId, replyId } = req.params;
  if (!postId || !commentId || !replyId) {
    return next(new AppError("all filed is required...", 400));
  }
  try {
    const post = await Post.findById(postId);

    if (!post) {
      return next(new AppError("Post not found.", 404));
    }
    const comments = post.comments.id(commentId);

    if (!comments) {
      return next(new AppError("Comment not found.", 404));
    }
    const replayIndex = comments.replies.findIndex(
      (replay) => replay._id.toString() === replyId
    );
    if (replayIndex == -1) {
      return next(new AppError("replay not found.", 404));
    }
    comments.replies.splice(replayIndex, 1);

    await post.save();
    res.status(200).json({
      success: true,
      message: "Reply deleted successfully",
      data: post,
    });
  } catch (error) {
    return next(new AppError(error.message, 404));
  }
};

export const exitCommentInPostById = async (req, res, next) => {
  const { comment } = req.body;
  const { userName } = req.user;
  const { postId, commentId } = req.params;
  if (!userName) {
    return next(new AppError("username is required", 400));
  }

  if (!postId || !commentId) {
    return next(new AppError("postId and CommentId is required", 400));
  }
  try {
    const updateComment = await Post.findOneAndUpdate(
      {
        _id: postId,
        "comments._id": commentId,
      },
      { $set: { "comments.$.comment": comment } },
      {
        runValidators: true,

        new: true,
      }
    );
    if (!updateComment) {
      return next(new AppError("post does not Update..,please try again", 400));
    }
    res.status(200).json({
      success: true,
      data: updateComment,
      message: "comment successfully edit...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const deleteCommentInPostById = async (req, res, next) => {
  const { userName } = req.body;
  const { postId, commentId } = req.query;

  if (!postId || !commentId || !userName) {
    return next(
      new AppError("postId and CommentId or userName is required", 400)
    );
  }
  try {
    const findComment = await Post.findOne({
      _id: postId,
      "comments._id": commentId,
      "comments.userName": userName,
    });
    if (!findComment) {
      return next(new AppError("comment is not find..,please try again", 400));
    }
    const findCommentDelete = await Post.findByIdAndUpdate(
      {
        _id: postId,
        "comments._id": commentId,
        "comments.userName": userName,
      },
      {
        $pull: {
          comments: { _id: commentId, userName: userName },
        },
        $inc: { numberOfComments: -1 },
      },
      {
        new: true,
      }
    );
    if (!findCommentDelete) {
      return next(
        new AppError("comment does not delete..,please try again", 400)
      );
    }
    findComment.numberOfComment = findComment.comments.length - 1;
    await findComment.save();
    res.status(200).json({
      success: true,
      data: findCommentDelete,
      message: "comment successfully delete...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

/////like and dislike   post//////

export const LikeAndDisLikePost = async (req, res, next) => {
  const { id } = req.params;
  const { userName } = req.user;
  if (!userName) {
    return next(new AppError("username is required ..", 400));
  }
  if (!id) {
    return next(new AppError("postId is required ..", 400));
  }
  try {
    const FindPost = await Post.findOne({
      _id: id,
    });

    if (!FindPost) {
      return next(new AppError("post does not found. ..", 400));
    }
    const likeIndex = FindPost.PostLikes.findIndex(
      (like) => like.userName === userName
    );

    if (likeIndex !== -1) {
      if (FindPost.PostLikes[likeIndex].PostLike === "TRUE") {
        FindPost.PostLikes.splice(likeIndex, 1);
      } else {
        FindPost.PostLikes[likeIndex].PostLike = "TRUE";
      }
    } else {
      FindPost.PostLikes.push({ userName, PostLike: "TRUE" });
    }
    FindPost.likeCount = FindPost.PostLikes.filter(
      (like) => like.PostLike == "TRUE"
    ).length;
    await FindPost.save();

    res.status(200).json({
      success: true,
      FindPost,
      message: "pots successfully like.. and send notification.",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
