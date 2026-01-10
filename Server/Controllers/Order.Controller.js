import Notification from "../module/Notification.module.js";
import Order from "../module/Order.module.js";
import Product from "../module/Product.module.js";
import User from "../module/user.module.js";
import Upsell from "../module/Upsell.module.js";
import { calculateUpsellDiscount } from "./Upsell.Controller.js";
import { razorpay } from "../server.js";
import AppError from "../utils/AppError.js";

import crypto from "crypto";
import SendEmail from "../utils/SendEmail.js";

export const CreateOrder = async (req, res, next) => {
  const {
    userId,
    products,
    shippingAddress,
    paymentStatus,
    PaymentMethod,
    totalAmount,
    email,
  } = req.body;
  if (!userId || !products || !shippingAddress || !totalAmount) {
    return next(new AppError("All fields are required.", 400));
  }

  // Validate products and calculate backend total
  let backendSubtotal = 0;
  let backendUpsellDiscount = 0;

  // Get all active upsells
  const upsells = await Upsell.find({ active: true }).populate({
    path: "upsellProducts.product",
    select: "name price images sku productType simpleProduct variants bundleProducts gst",
  });

  const productDetails = await Promise.all(
    products.map(async (product) => {
      const productFound = await Product.findById(product.product).populate({
        path: "bundleProducts.products.product",
        select: "productType simpleProduct variants gst",
      });
      if (!productFound) {
        return next(
          new AppError(`Product with ID ${product.product} not found.`, 400)
        );
      }

      let basePrice = 0;
      let discountPercent = 0;
      let stockStatus = "Out of stock";

      if (productFound.productType === "simple") {
        basePrice = productFound.simpleProduct.price * product.quantity;
        discountPercent = productFound.simpleProduct.discount || 0;
        stockStatus = productFound.simpleProduct.stockStatus;
      } else if (productFound.productType === "variant") {
        const variant = productFound.variants.find(v => v._id.toString() === product.variantId);
        if (variant) {
          const color = variant.colors.find(c => c._id.toString() === product.colorId);
          if (color) {
            basePrice = color.price * product.quantity;
            discountPercent = color.discount || 0;
            stockStatus = color.stockStatus;
          }
        }
      } else if (productFound.productType === "bundle") {
        let bundleBase = 0;
        for (const item of productFound.bundleProducts.products) {
          const compProd = item.product;
          if (compProd.productType === "simple") {
            bundleBase += compProd.simpleProduct.finalPrice * item.quantity;
          } else if (compProd.productType === "variant") {
            let minPrice = Infinity;
            compProd.variants.forEach(v =>
              v.colors.forEach(c => {
                const final = c.finalPrice;
                if (final < minPrice) minPrice = final;
              })
            );
            if (minPrice !== Infinity) {
              bundleBase += minPrice * item.quantity;
            }
          }
        }
        basePrice = bundleBase;
        discountPercent = productFound.bundleProducts.discount || 0;
        stockStatus = "In stock"; // Virtual stock
      }

      // Check stock
      if (stockStatus !== "In stock") {
        return next(new AppError(`Product ${productFound.name} is out of stock.`, 400));
      }

      const gstAmount = (basePrice * productFound.gst) / 100;
      const totalWithGst = basePrice + gstAmount;
      const discountAmount = (totalWithGst * discountPercent) / 100;
      const finalPrice = totalWithGst - discountAmount;

      backendSubtotal += finalPrice;

      let sku = "";
      let variantInfo = {};

      if (productFound.productType === "simple") {
        sku = productFound.simpleProduct.sku;
      } else if (productFound.productType === "variant") {
        const variant = productFound.variants.find(v => v._id.toString() === product.variantId);
        if (variant) {
          const color = variant.colors.find(c => c._id.toString() === product.colorId);
          if (color) {
            sku = color.sku;
            variantInfo = {
              variantId: product.variantId,
              colorId: product.colorId,
              variant: variant.size,
              color: color.name,
            };
          }
        }
      } else if (productFound.productType === "bundle") {
        sku = productFound.bundleProducts.sku;
      }

      return {
        product: productFound._id,
        productDetails: {
          name: productFound.name,
          image: productFound.images,
          description: productFound.description,
          price: finalPrice / product.quantity, // average price per unit
          gst: productFound.gst,
          discount: discountPercent,
          sku: sku,
          ...variantInfo,
        },
        quantity: product.quantity,
        price: finalPrice / product.quantity,
      };
    })
  );

  // Calculate upsell discounts
  for (const upsell of upsells) {
    backendUpsellDiscount += calculateUpsellDiscount(products, upsell);
  }

  const backendTotal = backendSubtotal - backendUpsellDiscount;
console.log(backendTotal ,Math.abs(backendTotal - totalAmount))
  // Validate total amount
  if (Math.abs(backendTotal - totalAmount) > 0.01) { // Allow small floating point differences
    return next(new AppError("Total amount mismatch. Please refresh and try again.", 400));
  }
  const newOrder = new Order({
    userId,
    products: productDetails,
    shippingAddress,
    PaymentMethod,
    paymentStatus,
    totalAmount,
  });

  if (!newOrder) {
    return next(new AppError("Failed to create order.", 400));
  }

  await newOrder.save();
  const adminAndAuthors = await User.find({
    role: { $in: ["ADMIN", "AUTHOR"] },
  });
  const notifications = adminAndAuthors.map((user) => ({
    userId: user._id,
    message: `A new order has been placed with Order ID: ${newOrder._id}.`,
    type: "New Order",
  }));
  const path = process.env.FRONTEND_URL;
  const orderConfirmationUrl = `${path}/api/v3/user/order/${newOrder._id}`;
  const subject = "Order Confirmation";
  const message = `
  <div style="font-family: Arial, sans-serif; line-height: 1.6;">
    <h2 style="color: #4CAF50;">Thank you for your order!</h2>
    <p>Dear ${shippingAddress.name},</p>
    <p>Your order has been successfully placed! We are thrilled to have the opportunity to serve you.</p>
    <p>Here are your order details:</p>
    <ul>
      <li><strong>Order ID:</strong> ${newOrder._id}</li>
      <li><strong>Total Amount:</strong> ₹${totalAmount}</li>
      <li><strong>Shipping Address:</strong> ${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.state}, ${shippingAddress.postalCode}</li>
    </ul>
    <p>You can view or track your order by clicking the link below:</p>
    <p><a href="${orderConfirmationUrl}" style="color: #ffffff; background-color: #4CAF50; padding: 10px 20px; text-decoration: none; border-radius: 5px;" target="_blank">View My Order</a></p>
    <p>If the button above doesn't work, copy and paste this link into your browser:</p>
    <p>${orderConfirmationUrl}</p>
    <p>If you have any questions or need further assistance, feel free to contact us at<a href="mailto:${email}">${email}</a></p>
    <p>Thank you for shopping with us!</p>
    <p>Best regards,</p>
    <p><strong>KGS DOORS</strong></p>
  </div>
`;

  await SendEmail(shippingAddress.email, subject, message);

  await Notification.insertMany(notifications);

  res.status(200).json({
    message: "Order placed successfully.",
    success: true,
    data: newOrder,
  });
};

export const createOrderPayment = async (req, res, next) => {
  try {
    const { totalAmount } = req.body;

    if (!totalAmount || totalAmount <= 1) {
      return next(new AppError("Invalid or missing totalAmount", 400));
    }
    const amountInPaise = totalAmount * 100;

    const options = {
      amount: amountInPaise,
      currency: "INR",
      receipt: `order_rcptid_${Date.now()}`,
    };

    const order = await razorpay.orders.create(options);

    if (!order) {
      return next(new AppError("Failed to create Razorpay order", 500));
    }

    res.status(200).json({
      success: true,
      orderId: order.id,
      currency: order.currency,
      amount: order.amount,
    });
  } catch (error) {
    console.log(error);
    return next(new AppError(error || "Internal Server Error", 500));
  }
};

export const PaymentVerify = async (req, res, next) => {
  const { razorpay_payment_id, razorpay_order_id, razorpay_signature } =
    req.body;
  try {
    const generated_signature = crypto
      .createHmac("sha256", process.env.SECRET_ID)
      .update(razorpay_order_id + "|" + razorpay_payment_id)
      .digest("hex");

    if (generated_signature === razorpay_signature) {
      res.status(200).json({ success: true, message: "Payment Verified" });
    } else {
      res
        .status(400)
        .json({ success: false, message: "Payment verification failed" });
    }
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const UpdateOrder = async (req, res, next) => {
  try {
    const { role } = req.user;
    const { id } = req.params;
    const { data } = req.body;
    if (!id || !data) {
      return next(new AppError("Order ID and update data are required.", 400));
    }
    if (data.shippingAddress && role !== "USER") {
      return next(
        new AppError("Only users can edit the shipping address.", 403)
      );
    }
    if (
      (data.orderStatus || data.paymentStatus) &&
      !(role === "ADMIN" || role === "AUTHOR")
    ) {
      return next(
        new AppError("Only ADMIN or AUTHOR can edit order status.", 403)
      );
    }
    if (
      data.paymentStatus == "Completed" &&
      (!data.name || !data.amount || !data.PaymentDate)
    ) {
      return next(
        new AppError("Payment complete to required name and amount", 403)
      );
    }
    const updateData = {};
    if (data.shippingAddress && role === "USER") {
      updateData.shippingAddress = data.shippingAddress;
    }

    if (data.orderStatus && (role === "ADMIN" || role === "AUTHOR")) {
      updateData.orderStats = data.orderStatus;
    }
    if (data.deliveryDate && (role === "ADMIN" || role === "AUTHOR")) {
      updateData.deliveryDate = data.deliveryDate;
    }

    if (data.paymentStatus && (role === "ADMIN" || role === "AUTHOR")) {
      updateData.paymentStatus = data.paymentStatus;
    }
    if (
      data.paymentStatus == "Completed" &&
      (role === "ADMIN" || role === "AUTHOR")
    ) {
      updateData.paymentStatus = data.paymentStatus;
      updateData.name = data.name;
      updateData.amount = data.amount;
      updateData.PaymentDate = data.PaymentDate;
    }

    const order = await Order.findOneAndUpdate(
      { _id: id },
      { $set: updateData },
      { new: true }
    );
    if (!order) {
      return next(new AppError("order is does not found..", 400));
    }
    res.status(200).json({
      success: true,
      message: "update Order...",
      data: order,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const CancelOrder = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!id) {
      return next(new AppError("all  filed required ", 400));
    }
    const order = await Order.findOneAndUpdate(
      { _id: id },
      { $set: { orderStats: "Canceled" } },
      { new: true }
    );
    if (!order) {
      return next(new AppError("order is does not found..", 400));
    }

    res.status(200).json({
      success: true,
      message: "update Order...",
      data: order,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const getOrderByID = async (req, res, next) => {
  try {
    const { OrderId: id } = req.params;
    if (!id) {
      return next(new AppError("all flied is required..", 400));
    }
    const OrderExit = await Order.findById(id);

    if (!OrderExit) {
      return next(new AppError("Order Not Found..", 400));
    }
    res.status(200).json({
      success: true,
      message: "successFully Order Get...",
      data: OrderExit,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const getOrder = async (req, res, next) => {
  try {
    const { id } = req.params;
    if (!id) {
      return next(new AppError("all flied is required..", 400));
    }
    const OrderExit = await Order.find({ userId: id });

    if (!OrderExit) {
      return next(new AppError("Order Not Found..", 400));
    }
    res.status(200).json({
      success: true,
      message: "successFully Order Get...",
      data: OrderExit,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const AllOrder = async (req, res, next) => {
  try {
    const Orders = await Order.find();
    if (!Orders) {
      return next(new AppError("Order Not Found..", 400));
    }
    res.status(200).json({
      success: true,
      message: "successFully Order Get...",
      data: Orders,
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const allOrderPayments = async (req, res, next) => {
  const { count = 10, skip = 0 } = req.query;

  try {
    const allPayments = await razorpay.payments.all({
      count: parseInt(count, 10),
      skip: parseInt(skip, 10),
    });

    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const finalMonths = monthNames.reduce((acc, month) => {
      acc[month] = 0;
      return acc;
    }, {});

    // Filter payments to include only 'captured' payments
    const receivedPayments = allPayments.items.filter(
      (payment) => payment.status === "captured"
    );

    // Calculate total received amount and aggregate monthly payments
    let totalAmount = 0;
    receivedPayments.forEach((payment) => {
      const paymentDate = new Date(payment.created_at * 1000);
      const monthName = monthNames[paymentDate.getMonth()];

      totalAmount += payment.amount / 100; // Convert amount from paise to rupees

      if (monthName) {
        finalMonths[monthName] += 1;
      }
    });

    const monthlySalesRecord = monthNames.map((month) => finalMonths[month]);

    res.status(200).json({
      success: true,
      message: "All payments fetched successfully",
      allPayments,
      totalAmount, // Total amount of only received payments
      finalMonths,
      monthlySalesRecord,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};
