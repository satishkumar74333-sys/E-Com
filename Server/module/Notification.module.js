import { model, Schema } from "mongoose";

const NotificationSchema = new Schema(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },

    message: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: [
        "like",
        "comment",
        "replay",
        "message",
        "New Account",
        "New Order",
        "Canceled Order",
        "blog",
        "New Account",
        "new product",
      ],
    },
    read: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Notification = model("Notification", NotificationSchema);
export default Notification;
