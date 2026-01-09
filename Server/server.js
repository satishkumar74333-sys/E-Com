import { config } from "dotenv";
config();
import app from "./app.js";
import Razorpay from "razorpay";
import cloudinaryPkg from "cloudinary";
const { v2: cloudinary } = cloudinaryPkg;

const PORT = process.env.PORT || 5003;

export default cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export const razorpay = new Razorpay({
  key_id: process.env.KEY_ID,
  key_secret: process.env.SECRET_ID,
});
console.log(PORT);

app.listen(PORT, () => {});
