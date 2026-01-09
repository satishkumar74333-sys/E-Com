import { Router } from "express";
import { isLoggedIn } from "../Middleware/authMiddleware.js";
import {
  getNotification,
  markToReadNotification,
} from "../Controllers/Notification.Controller.js";
const NotificationRouter = Router();
NotificationRouter.route("/").get(isLoggedIn, getNotification);
NotificationRouter.route("/:NotificationId").put(
  isLoggedIn,
  markToReadNotification
);
export default NotificationRouter;
