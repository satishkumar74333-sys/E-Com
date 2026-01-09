import { model, Schema } from "mongoose";

const InformationSchema = new Schema(
  {
    uniqueKey: { type: String, default: "SHOP_INFORMATION", unique: true },
    phoneNumber: { type: Number, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
    instagram: { type: String },
    facebook: { type: String },
    youtube: { type: String },
  },
  { timestamps: true }
);

const ShopInformation = model("ShopInformation", InformationSchema);

export default ShopInformation;
