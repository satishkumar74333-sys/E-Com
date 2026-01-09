import ShopInformation from "../module/Info.module.js";
import AppError from "../utils/AppError.js";
export const InformationSet = async (req, res, next) => {
  const { role } = req.user;
  if (!role) {
    return next(new AppError("role is required", 400));
  }
  if (!req.body) {
    return next(new AppError("data is required", 400));
  }

  try {
    const shopInfo = await ShopInformation.findOneAndUpdate(
      { uniqueKey: "SHOP_INFORMATION" },
      req.body,
      { new: true, upsert: true }
    );
    if (!shopInfo) {
      return next(new AppError("something wont wong...", 400));
    }
    res.status(200).json({
      success: true,
      shopInfo,
      message: "Successfully info update..",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export const getShopInfo = async (req, res, next) => {
  try {
    const info = await ShopInformation.find({});
    if (!info) {
      return next(new AppError("something wont wong...", 400));
    }
    res.status(200).json({
      success: true,
      info,
      message: "Successfully get info ..",
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
