import express from "express";
import {
  getUpsellByProduct,
  createOrUpdateUpsell,
  deleteUpsell,
  calculateCartUpsellSavings,
} from "../Controllers/Upsell.Controller.js";
import { isLoggedIn, authorizeRoles } from "../Middleware/authMiddleware.js";

const router = express.Router();

// Get upsell for a product
router.post('/calculate-cart-upsell', calculateCartUpsellSavings);
router.get("/:productId", getUpsellByProduct);

// Create or update upsell for a product (admin only)
router.post("/:productId", isLoggedIn, authorizeRoles("ADMIN"), createOrUpdateUpsell);

// Delete upsell for a product (admin only)
router.delete("/:productId", isLoggedIn, authorizeRoles("ADMIN"), deleteUpsell);


export default router;