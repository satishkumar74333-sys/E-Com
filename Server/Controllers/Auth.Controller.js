import User from "../module/user.module.js";
import AppError from "../utils/AppError.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import crypto from "crypto";
import SendEmail from "../utils/SendEmail.js";
import { config } from "dotenv";
import Notification from "../module/Notification.module.js";
config();
const cookieOption = {
  maxAge: 7 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  sameSite: "None",
  secure: process.env.NODE_ENV === "production",
  path: "/",
};

export const RegisterUser = async (req, res, next) => {
  const { userName, fullName, email, password, phoneNumber, Email } = req.body;
  if (!fullName || !email || !password || !userName || !phoneNumber) {
    return next(new AppError("All fields are required", 400));
  }

  try {
    const userNameExit = await User.findOne({ userName });
    if (userNameExit) {
      return next(new AppError("Username already exists", 400));
    }

    const userExist = await User.findOne({ email });
    if (userExist) {
      if (req.file) {
        await fs.rm(req.file.path, { force: true });
      }
      return next(new AppError("Email already exists", 400));
    }

    const avatar = {
      public_id: email,
      secure_url:
        "https://res.cloudinary.com/du9jzqlpt/image/upload/v1674647316/avatar_drzgxv.jpg",
    };

    if (req.file) {
      try {
        const avatarUpload = await cloudinary.v2.uploader.upload(
          req.file.path,
          {
            folder: "content",
            width: 250,
            height: 250,
            gravity: "faces",
            crop: "fill",
          }
        );

        if (avatarUpload) {
          avatar.public_id = avatarUpload.public_id;
          avatar.secure_url = avatarUpload.secure_url;
        }

        await fs.rm(req.file.path, { force: true });
      } catch (error) {
        await fs.rm(req.file.path, { force: true });
        return next(
          new AppError(`Cloudinary upload failed: ${error.message}`, 400)
        );
      }
    }

    const user = await User.create({
      userName,
      fullName,
      phoneNumber,
      email,
      password,
      avatar,
    });

    if (!user) {
      return next(
        new AppError("User registration failed. Please try again.", 400)
      );
    }

    // Send response immediately
    const Token = await user.generateJWTToken();
    user.password = undefined;
    res.cookie("token", Token, cookieOption);
    res.status(200).json({
      success: true,
      data: user,
      AuthenticatorToken: Token,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      message: "Successfully registered.",
    });

    (async () => {
      try {
        const notification = new Notification({
          userId: user._id,
          message: `Welcome to KGS DOORS! We’re thrilled to have you on board. Enjoy shopping with us!`,
          type: "New Account",
        });
        await notification.save();

        const adminAndAuthors = await User.find({
          role: { $in: ["ADMIN", "AUTHOR"] },
        });
        const notifications = adminAndAuthors.map((admin) => ({
          userId: admin._id,
          message: `A new account has been created with the phoneNumber: ${user.phoneNumber}. Please review the details.`,
          type: "New Account",
        }));
        await Notification.insertMany(notifications);

        const path = process.env.FRONTEND_URL;
        const orderConfirmationUrl = `${path}/`;
        const subject = "Welcome to KGS DOORS!";
        const message = `
          <div style="font-family: Arial, sans-serif; line-height: 1.6;">
            <h2 style="color: #4CAF50;">Welcome to KGS DOORS!</h2>
            <p>Dear ${user.userName},</p>
            <p>Congratulations on creating your account with us! We're excited to have you on board.</p>
            <p>You can manage your account by clicking below:</p>
            <p><a href="${orderConfirmationUrl}" style="color: #ffffff; background-color: #4CAF50; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Go to Home</a></p>
            <p>Thank you for joining KGS DOORS!</p>
            <p><strong>KGS DOORS Team</strong></p>
          </div>
        `;

        await SendEmail(user.email, subject, message);
      } catch (error) {
        console.error("Background task error:", error);
      }
    })();
  } catch (error) {
    if (req.file) {
      await fs.rm(req.file.path, { force: true });
    }
    if (req.files) {
      await Promise.all(
        req.files.map((file) => fs.rm(file.path, { force: true }))
      );
    }
    return next(new AppError(error.message, 400));
  }
};

export const login = async (req, res, next) => {
  const { Email: email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("All felids is required", 400));
  }
  try {
    const userExist = await User.findOne({ email }).select("+password");
    if (!userExist) {
      return next(new AppError("Email not found...", 400));
    }
    if (!(await userExist.comparePassword(password))) {
      return next(new AppError("password Does not match..", 400));
    }
    const Token = await userExist.generateJWTToken();
    userExist.password = undefined;
    res.cookie("token", Token, cookieOption);
    res.status(200).json({
      success: true,
      data: userExist,
      AuthenticatorToken: Token,
      exp: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
      Message: "successfully login...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const logout = async (req, res, next) => {
  try {
    res.cookie("token", null, {
      maxAge: 0,
      httpOnly: true,
      secure: true,
    });

    res.status(200).json({
      success: true,

      Message: "successfully logout...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const getProfile = async (req, res, next) => {
  try {
    const { exp } = req.user;
    const userExist = await User.findById(req.user.id);
    if (!userExist) {
      return next(new AppError(" please login..", 400));
    }
    res.status(200).json({
      success: true,
      data: userExist,
      exp: exp,
      Message: "successfully getProfile...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const resetPassword = async (req, res, next) => {
  const { email } = req.query;

  try {
    if (!email) {
      return next(new AppError("Enter your email."));
    }
    const userExist = await User.findOne({ email });
    if (!userExist) {
      return next(new AppError("email not found...", 400));
    }
    const resetToken = await userExist.generatePasswordResetToken();

    await userExist.save();
    console.log(process.env.FRONTEND_URL);
    const resetPassword_url = `http://${process.env.FRONTEND_URL}/changePassword/${resetToken}`;
    const subject = "Reset Password ";
    const message = `
    <p>Hello,</p>
    <p>We received a request to reset your password. To reset your password, please click the link below:</p>
    <p><a href="${resetPassword_url}" target="_blank" style="color: #4CAF50; text-decoration: none; font-weight: bold;">Reset Your Password</a></p>
    <p>If the link above doesn't work, copy and paste the following URL into a new browser tab:</p>
    <p style="word-wrap: break-word;">${resetPassword_url}</p>
    <p>This password reset request is valid for the next 10 minutes. If you didn't request a password reset, you can safely ignore this email.</p>
    <p>If you have any concerns or need assistance, feel free to reach out to our support team.</p>
    <p>Best regards,</p>
    <p> KGS Doors Team</p>
  `;
    try {
      await SendEmail(email, subject, message);
      res.status(200).json({
        success: true,
        email: email,
        token: resetToken,
        message: "successfully email send.. ",
      });
    } catch (error) {
      userExist.forgotPasswordExpiry = undefined;
      userExist.forgotPasswordToken = undefined;
      userExist.save();
      return next(new AppError("Failed to send email " + error.message, 500));
    }
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const changePassword = async (req, res, next) => {
  const { resetToken } = req.params;
  const { newPassword } = req.body;
  if (!newPassword) {
    return next(new AppError("Enter your new password", 400));
  }
  try {
    const forgotPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const user = await User.findOne({
      forgotPasswordToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return next(
        new AppError("Token does not exit or expiry, please try again", 400)
      );
    }
    console.log(user);
    user.password = newPassword;
    user.forgotPasswordToken = undefined;
    user.forgotPasswordExpiry = undefined;

    await user.save();

    user.password = undefined;

    res.status(200).json({
      success: true,
      message: "Password successfully updated.",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const checkPasswordResatToken = async (req, res, next) => {
  const { resetToken } = req.params;
  if (!resetToken) {
    return next(new AppError("resetToken not found", 400));
  }

  try {
    const forgotPasswordToken = crypto
      .createHash("sha256")
      .update(resetToken)
      .digest("hex");
    const user = await User.findOne({
      forgotPasswordToken,
      forgotPasswordExpiry: { $gt: Date.now() },
    });
    if (!user) {
      return next(
        new AppError("Token does not exit or expiry, please try again", 400)
      );
    }

    res.status(200).json({
      success: true,
      message: "Token is valid",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const updatePassword = async (req, res, next) => {
  const { oldPassword: password, newPassword } = req.body;
  try {
    if (!password || !newPassword) {
      return next(new AppError(" all filed is required..", 400));
    }
    const userExist = await User.findById(req.user.id).select("+password");
    if (!userExist) {
      return next(new AppError(" please login..", 400));
    }

    if (!(await userExist.comparePassword(password))) {
      return next(new AppError("password does not match...", 400));
    }

    userExist.password = newPassword;

    await userExist.save();
    userExist.password = undefined;
    res.status(200).json({
      success: true,
      message: "password successfully updated...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const UpdateUserProfile = async (req, res, next) => {
  const { fullName, phoneNumber } = req.body;
  if (!fullName && !phoneNumber) {
    return next(new AppError(" All felids is required", 400));
  }
  try {
    const userExist = await User.findById(req.user.id);
    if (!userExist) {
      return next(new AppError(" please login..", 400));
    }

    if (fullName) {
      userExist.fullName = fullName;
    }
    if (phoneNumber) {
      userExist.phoneNumber = phoneNumber;
    }
    if (req.file) {
      await cloudinary.v2.uploader.destroy(userExist.avatar.public_id);
    }
    if (req.file) {
      try {
        const avatarUpload = await cloudinary.v2.uploader.upload(
          req.file.path,
          {
            folder: "Avatar",
            width: 250,
            height: 250,
            gravity: "faces",
            crop: "fill",
          }
        );
        if (avatarUpload) {
          userExist.avatar.public_id = avatarUpload.public_id;
          userExist.avatar.secure_url = avatarUpload.secure_url;
        }
        await fs.rm(req.file.path, { force: true });
      } catch (error) {
        await fs.rm(req.file.path, { force: true });
        return next(
          new AppError(`file upload file try again ${error.message}`, 400)
        );
      }
    }
    await userExist.save();
    const Token = await userExist.generateJWTToken();
    userExist.password = undefined;
    res.cookie("token", Token, cookieOption);
    res.status(200).json({
      success: true,
      data: userExist,
      Message: "successfully update profile...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const getAllDate = async (req, res, next) => {
  try {
    const allUser = await User.find({});
    const allUserCount = await User.countDocuments({ role: "USER" });
    const allADMINCount = await User.countDocuments({
      role: "ADMIN",
    });
    const allAUTHORCount = await User.countDocuments({
      role: "AUTHOR",
    });
    res.status(200).json({
      success: true,
      allUserCount,
      allADMINCount,
      allAUTHORCount,
      allUser,
      message: "successfully allUser get..",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const handelPromotion = async (req, res, next) => {
  try {
    const { data } = req.body;
    if (!data.role || !data.id) {
      return next(new AppError(" All felids is required", 400));
    }

    if (data.role == "ADMIN") {
      const ADMINCount = await User.countDocuments({
        role: "ADMIN",
      });
      if (ADMINCount >= 5) {
        return next(new AppError("Maximum 5 ADMIN can remain.", 400));
      }
    }
    if (data.role == "AUTHOR") {
      const AUTHORCount = await User.countDocuments({
        role: "AUTHOR",
      });
      if (AUTHORCount >= 2) {
        return next(new AppError("Maximum 2 AUTHOR can remain..", 400));
      }
    }
    const handelUpdateRole = await User.findByIdAndUpdate(
      data.id,
      {
        role: data.role,
      },
      {
        new: true,
      }
    );

    res.status(200).json({
      success: true,
      message: "User role updated successfully.",
      data: handelUpdateRole,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const handelDelete = async (req, res, next) => {
  try {
    const { role } = req.user;
    const { data } = req.body;
    if (!data.role || !data.id) {
      return next(new AppError(" All felids is required", 400));
    }

    if (role == "ADMIN" && ["ADMIN", "AUTHOR"].includes(data.role)) {
      return next(
        new AppError(
          `Deletion not allowed: User with role "${data.role}" cannot be deleted.`,
          400
        )
      );
    }
    if (data.role == "ADMIN") {
      const ADMINCount = await User.countDocuments({
        role: "ADMIN",
      });
      if (ADMINCount <= 1) {
        return next(new AppError("At least one ADMIN must remain.", 400));
      }
      const deletedAdmin = await User.findByIdAndDelete(data.id);
      return res.status(200).json({
        success: true,
        message: "ADMIN user deleted successfully.",
        data: deletedAdmin,
      });
    }
    if (data.role == "AUTHOR") {
      const AUTHORCount = await User.countDocuments({
        role: "AUTHOR",
      });
      if (AUTHORCount <= 1) {
        return next(new AppError("At least one AUTHOR must remain.", 400));
      }
      const deletedAuthor = await User.findByIdAndDelete(data.id);
      return res.status(200).json({
        success: true,
        message: "AUTHOR user deleted successfully.",
        data: deletedAuthor,
      });
    }
    if (data.role == "USER") {
      const deletedUser = await User.findByIdAndDelete(data.id);
      return res.status(200).json({
        success: true,
        message: "user deleted successfully.",
        data: deletedUser,
      });
    }
    return next(new AppError("Invalid role specified", 400));
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
