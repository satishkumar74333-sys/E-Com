import JWT from "jsonwebtoken";
import AppError from "../utils/AppError.js";
import { config } from "dotenv";
config();
export const isLoggedIn = async (req, res, next) => {
  try {
    const token = req.header("Authorization");
    if (!token) {
      return next(new AppError("Unauthenticated,please login ", 401));
    }
    const userDetails = await JWT.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: userDetails.id,
      userName: userDetails.userName,
      email: userDetails.email,
      role: userDetails.role,
      exp: userDetails.exp,
    };
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
  next();
};

export const authorizeRoles =
  (...roles) =>
  async (req, res, next) => {
    // if (!roles.includes(req.user.role)) {
    //   return next(new AppError("you have not permission for this work", 400));
    // }
    next();
  };
