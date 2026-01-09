import { Router } from "express";
import { authorizeRoles, isLoggedIn } from "../Middleware/authMiddleware.js";
import {
  AllOrder,
  CancelOrder,
  CreateOrder,
  createOrderPayment,
  getOrder,
  getOrderByID,
  PaymentVerify,
  UpdateOrder,
} from "../Controllers/Order.Controller.js";
const OrderRouter = Router();
OrderRouter.route("/PlaceOrder").post(isLoggedIn, CreateOrder);

OrderRouter.route("/CreatePayment/new").post(isLoggedIn, createOrderPayment);
OrderRouter.route("/PaymentVerify/verify").post(isLoggedIn, PaymentVerify);
OrderRouter.route("/:OrderId/getOrderById").get(getOrderByID);
OrderRouter.route("/:id")
  .get(isLoggedIn, getOrder)
  .put(isLoggedIn, UpdateOrder);
OrderRouter.route("/:id/CancelOrder").put(isLoggedIn, CancelOrder);
export default OrderRouter;
