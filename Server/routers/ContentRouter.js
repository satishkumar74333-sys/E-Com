import { Router } from "express";
import {
  addCommentPost,
  deleteCommentInPostById,
  LikeAndDisLikePost,
  exitCommentInPostById,
  getPost,
  getAllPost,
  AddReplayToComment,
  removeReplayToComment,
} from "../Controllers/Content.Controller.js";

import { isLoggedIn } from "../Middleware/authMiddleware.js";

const ContentRouter = Router();

ContentRouter.route("/Post/:id")
  .post(isLoggedIn, addCommentPost)
  .get(getPost)
  .put(isLoggedIn, LikeAndDisLikePost);

ContentRouter.route("/posts/:postId/comments/:commentId/AddNewComment").put(
  isLoggedIn,
  AddReplayToComment
);

ContentRouter.route("/posts/:postId/comments/:commentId/UpdateComment").put(
  isLoggedIn,
  exitCommentInPostById
);

ContentRouter.route(
  "/posts/:postId/comments/:commentId/replays/:replyId"
).delete(isLoggedIn, removeReplayToComment);

ContentRouter.route("/Post")
  .get(isLoggedIn, getAllPost)
  .put(isLoggedIn, AddReplayToComment)
  .delete(isLoggedIn, deleteCommentInPostById);

export default ContentRouter;
