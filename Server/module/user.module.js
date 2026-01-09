import { model, Schema } from "mongoose";

import bcrypt from "bcryptjs";
import JWT from "jsonwebtoken";
import crypto from "crypto";
import { type } from "os";
const UserSchema = new Schema(
  {
    userName: {
      type: String,
      required: [true, "username is required"],
      unique: [true, "username is registered"],
      trim: true,
    },
    fullName: {
      type: "string",
      required: [true, "name is required"],
      minLength: [5, "name must be 5 char"],
      trim: true,
    },
    phoneNumber: {
      type: String,
      required: [true, "phoneNumber is required"],
      trim: true,
    },
    email: {
      type: "string",
      required: [true, "name is required"],
      trim: true,

      match: [
        /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
        "Please fill in a valid email address",
      ],
    },
    password: {
      type: String,
      required: [true, "name is required"],
      minLength: [8, "password must be 8 char"],
      select: false,

      trim: true,
    },
    avatar: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },
    walletAddProducts: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: "Product",
        },
        sku:{
          type:String

        },
        name: { type: String },
        image: [{
          public_id: { type: String },
          secure_url: { type: String },
        }],
        gst: {
          type: Number,
        },
        discount: { type: Number },
        stock: { type: String },
        price: { type: Number },
        description: { type: String },
        productType: { type: String },
        quantity: { type: Number, default: 1 },
        addedAt: { type: Date, default: Date.now },
      },
    ],

    role: {
      type: String,
      enum: ["USER", "ADMIN", "AUTHOR"],
      default: "USER",
    },
    forgotPasswordToken: { type: String },
    forgotPasswordExpiry: { type: Date },
  },
  { timestamps: true }
);
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
});

UserSchema.methods = {
  comparePassword: async function (PlainPassword) {
    return await bcrypt.compare(PlainPassword, this.password);
  },
  generateJWTToken: async function () {
    return await JWT.sign(
      {
        userName: this.userName,
        id: this._id,
        email: this.email,
        role: this.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRY,
      }
    );
  },

  generatePasswordResetToken: async function () {
    const resetToken = crypto.randomBytes(20).toString("hex");

    this.forgotPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");

    this.forgotPasswordExpiry = Date.now() + 10 * 60 * 1000;

    return resetToken;
  },
};

const User = model("User", UserSchema);
export default User;
