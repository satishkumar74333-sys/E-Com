import Order from "../module/Order.module.js";
import AppError from "../utils/AppError.js";

export const getPaymentData = async (req, res, next) => {
  try {
    const paymentData = await Order.find(
      {},
      "PaymentMethod paymentStatus name amount totalAmount PaymentDate shippingAddress"
    ).lean();

    if (!paymentData) {
      return next(new AppError("No payment data found", 400));
    }

    let totalAmount = 0;
    let receivedAmount = 0;

    paymentData.forEach((payment) => {
      totalAmount += payment.totalAmount || 0;
      if (payment.paymentStatus === "Completed") {
        receivedAmount += payment.totalAmount || 0;
      }
    });

    res.status(200).json({
      success: true,
      data: paymentData,
      totalAmount,
      receivedAmount,
      message: "Payment data retrieved successfully",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
