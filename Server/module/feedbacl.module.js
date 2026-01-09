import { model, Schema } from "mongoose";

const FeedbackSchema = new Schema({
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  userName: { type: String, required: true, ref: "User" },
  createdAt: { type: Date, default: Date.now },
});

const Feedback = model("Feedback", FeedbackSchema);
export default Feedback;
