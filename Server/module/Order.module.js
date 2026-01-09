import { model, Schema } from "mongoose";

const OrderSchema = new Schema({
  userId: {
    type: String,
    required: [true, "User ID is required"],
    ref: "User",
  },
  products: [
    {
      product: {
        type: String,
        ref: "Product",
        required: true,
      },
      productDetails: {
        name: {
          type: String,
          required: true,
        },
        image: {
          public_id: {
            type: String,
          },
          secure_url: {
            type: String,
          },
        },
        description: {
          type: String,
          required: true,
        },
        price: {
          type: Number,
          required: true,
        },
        gst: {
          type: Number,
          required: true,
        },
        discount: {
          type: Number,
        },
      },
      quantity: {
        type: Number,
        required: true,
      },
      price: {
        type: Number,
        required: true,
      },
    },
  ],
  PaymentMethod: {
    type: String,
    enum: ["cash on Delivery", "razorpay"],
    default: "razorpay",
  },

  amount: {
    type: Number,
  },
  name: {
    type: String,
  },

  totalAmount: {
    type: Number,
    required: true,
  },
  shippingAddress: {
    name: { type: String, required: true },
    address: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: Number, required: true },

    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
  },
  paymentStatus: {
    type: String,
    enum: ["Pending", "Completed", "Failed"],
    default: "Pending",
  },
  orderStats: {
    type: String,
    enum: ["Processing", "Shipped", "Delivered", "Canceled"],
    default: "Processing",
  },

  deliveryDate: {
    type: Date,
    default: () => {
      const date = new Date();
      date.setDate(date.getDate() + 10);
      return date;
    },
  },
  PaymentDate: {
    type: Date,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Order = model("Order", OrderSchema);
export default Order;
