import { Router } from "express";
import { isLoggedIn } from "../Middleware/authMiddleware.js";
import {
  AddCardProduct,
  AllRemoveCardProduct,
  removeCardProduct,
  getCart,
  updateCardProductQuantity,
} from "../Controllers/Card.Controller.js";
const CardRouter = Router();
CardRouter.route("/AddProduct").put(isLoggedIn, AddCardProduct);

CardRouter.route("/v2/RemoveProduct").put(isLoggedIn, removeCardProduct);

CardRouter.route("/UpdateQuantity").put(isLoggedIn, updateCardProductQuantity);

CardRouter.route("/:id/AllRemoveCardProduct").put(
  isLoggedIn,
  AllRemoveCardProduct
);

CardRouter.route("/").get(isLoggedIn, getCart);

export default CardRouter;
