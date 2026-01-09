import { Router } from "express";
import { authorizeRoles, isLoggedIn } from "../Middleware/authMiddleware.js";
import {
  getAllDate,
  handelDelete,
  handelPromotion,
} from "../Controllers/Auth.Controller.js";
import upload from "../Middleware/multerMiddleware.js";

import {
  deletePostById,
  getAllPost,
  postUpdate,
  PostUpload,
} from "../Controllers/Content.Controller.js";
import {
  productDelete,
  productUpdate,
  ProductUpload,
} from "../Controllers/Product.Controller.js";
import { AllOrder, allOrderPayments } from "../Controllers/Order.Controller.js";
import {
  CarouselDelete,
  CarouselUpdate,
  CarouselUpload,
  getCarousel,
} from "../Controllers/CarouselController.js";
import { getPaymentData } from "../Controllers/payment.Controller.js";
import {
  AllMessageGet,
  messageMarkARead,
} from "../Controllers/feedback.Controller.js";
import { InformationSet } from "../Controllers/Shop.Controller.js";
import {
  getAllUpsells,
  createUpsellAdmin,
  updateUpsellAdmin,
  deleteUpsellAdmin,
} from "../Controllers/Upsell.Controller.js";
const ADMINRouter = Router();

ADMINRouter.route("/User")
  .get(isLoggedIn, authorizeRoles("ADMIN", "AUTHOR"), getAllDate)
  .delete(isLoggedIn, authorizeRoles("ADMIN", "AUTHOR"), handelDelete)
  .put(isLoggedIn, authorizeRoles("AUTHOR"), handelPromotion);
ADMINRouter.get(
  "/Order",
  isLoggedIn,
  authorizeRoles("ADMIN", "AUTHOR"),
  AllOrder
);
ADMINRouter.get(
  "/Payment/Orders",
  isLoggedIn,
  authorizeRoles("ADMIN", "AUTHOR"),
  getPaymentData
);
ADMINRouter.post(
  "/info",
  isLoggedIn,
  authorizeRoles("ADMIN", "AUTHOR"),
  InformationSet
);


ADMINRouter.get(
  "/Payment",
  isLoggedIn,
  authorizeRoles("ADMIN", "AUTHOR"),
  allOrderPayments
);

ADMINRouter.route("/Post")
  .get(isLoggedIn, authorizeRoles("ADMIN", "AUTHOR"), getAllPost)
  .post(
    isLoggedIn,
    authorizeRoles("ADMIN", "AUTHOR"),
    upload.single("post"),
    PostUpload
  );

ADMINRouter.route("/Post/:id")
  .delete(isLoggedIn, authorizeRoles("ADMIN", "AUTHOR"), deletePostById)

  .put(isLoggedIn, authorizeRoles("ADMIN", "AUTHOR"), postUpdate);

////product api///
ADMINRouter.route("/Product").post(
  isLoggedIn,
  authorizeRoles("ADMIN", "AUTHOR"),

  upload.any(),
  ProductUpload
);
ADMINRouter.route("/Carousel").post(
  isLoggedIn,
  authorizeRoles("ADMIN", "AUTHOR"),

  upload.array("images", 2),
  CarouselUpload
);
ADMINRouter.route("/Carousel/:id")
  .put(
    isLoggedIn,
    authorizeRoles("ADMIN", "AUTHOR"),

    upload.array("images", 2),
    CarouselUpdate
  )
  .get(isLoggedIn, getCarousel)
  .delete(isLoggedIn, authorizeRoles("ADMIN", "AUTHOR"), CarouselDelete);

ADMINRouter.route("/Product/:id")
  .put(
    isLoggedIn,
    authorizeRoles("ADMIN", "AUTHOR"),
    upload.array("images", 10),
    productUpdate
  )

  .delete(isLoggedIn, authorizeRoles("ADMIN", "AUTHOR"), productDelete);
ADMINRouter.route("/message").get(
  isLoggedIn,
  authorizeRoles("ADMIN", "AUTHOR"),
  AllMessageGet
);
ADMINRouter.put(
  "/message/:id",
  isLoggedIn,
  authorizeRoles("ADMIN", "AUTHOR"),
  messageMarkARead
);

// Upsell routes
ADMINRouter.get("/Upsell", isLoggedIn, authorizeRoles("ADMIN", "AUTHOR"), getAllUpsells);
ADMINRouter.post("/Upsell", isLoggedIn, authorizeRoles("ADMIN", "AUTHOR"), createUpsellAdmin);
ADMINRouter.put("/Upsell/:id", isLoggedIn, authorizeRoles("ADMIN", "AUTHOR"), updateUpsellAdmin);
ADMINRouter.delete("/Upsell/:id", isLoggedIn, authorizeRoles("ADMIN", "AUTHOR"), deleteUpsellAdmin);

export default ADMINRouter;
