import { model, Schema } from "mongoose";

const MessageSchema = new Schema({
  userId: { type: String, required: true, ref: "User" },
  number: { type: Number, required: true, ref: "User" },
  email: { type: String, required: true, ref: "User" },
  message: { type: String, required: true },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: { type: Date, default: Date.now },
});

const Message = model("Message", MessageSchema);
export default Message;
