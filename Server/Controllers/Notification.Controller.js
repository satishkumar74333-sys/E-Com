import Notification from "../module/Notification.module.js";
import AppError from "../utils/AppError.js";

export const getNotification = async (req, res, next) => {
  const { id } = req.user;
  if (!id) {
    return next(new AppError("all filed is required..", 400));
  }
  try {
    const getNotification = await Notification.find({
      userId: id,
      read: false,
    }).sort({
      createdAt: -1,
    });

    if (!getNotification) {
      return next(new AppError("get notification fail ...", 400));
    }
    res.status(200).json({
      success: true,
      message: "successfully get Notification..",
      data: getNotification,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

//  mark to read//
export const markToReadNotification = async (req, res, next) => {
  const { NotificationId } = req.params;
  if (!NotificationId) {
    return next(new AppError("notification id is required...", 400));
  }
  try {
    const MarkNotification = await Notification.findByIdAndUpdate(
      NotificationId,
      { read: true },
      { new: true }
    );
    if (!MarkNotification) {
      return next(new AppError("fail to mark notification...", 400));
    }
    res.status(200).json({
      success: true,
      message: "successfully get Notification..",
      data: markToReadNotification,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
