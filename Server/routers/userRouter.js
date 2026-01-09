import { Router } from "express";
import {
  changePassword,
  checkPasswordResatToken,
  getProfile,
  login,
  logout,
  RegisterUser,
  resetPassword,
  updatePassword,
  UpdateUserProfile,
} from "../Controllers/Auth.Controller.js";
import upload from "../Middleware/multerMiddleware.js";
import { isLoggedIn } from "../Middleware/authMiddleware.js";
import {
  editFeedback,
  FeedbackDelete,
  getFeedback,
  MessageSubmit,
  SubmitFeedback,
} from "../Controllers/feedback.Controller.js";
import { getAllCarousel } from "../Controllers/CarouselController.js";
import { getShopInfo } from "../Controllers/Shop.Controller.js";
const UserRouter = Router();
UserRouter.post("/register", upload.single("avatar"), RegisterUser);
UserRouter.post("/login", login);
UserRouter.post("/SubmitFeedback", isLoggedIn, SubmitFeedback);
UserRouter.post("/messageSubmit", isLoggedIn, MessageSubmit);
UserRouter.get("/getFeedback", getFeedback);
UserRouter.put("/feedback/:id", isLoggedIn, editFeedback);
UserRouter.delete("/feedback/:id", isLoggedIn, FeedbackDelete);
UserRouter.get("/logout", logout);
UserRouter.get("/info", getShopInfo);
UserRouter.get("/Carousel", getAllCarousel);
UserRouter.get("/getProfile", isLoggedIn, getProfile);
UserRouter.post("/resetPassword", resetPassword);
UserRouter.post("/changePassword:resetToken", changePassword);
UserRouter.post("/TokenCheck:resetToken", checkPasswordResatToken);
UserRouter.put("/updatePassword", isLoggedIn, updatePassword);
UserRouter.put(
  "/UpdateProfile",
  isLoggedIn,
  upload.single("avatar"),
  UpdateUserProfile
);

export default UserRouter;
