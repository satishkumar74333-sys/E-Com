import { config } from "dotenv";
config(".env");
import express from "express";
import cookieParser from "cookie-parser";
import UserRouter from "./routers/userRouter.js";
import morgan from "morgan";
import cors from "cors";
import ErrorMiddleware from "./Middleware/Error.Middleware.js";
import ContentRouter from "./routers/ContentRouter.js";
import ADMINRouter from "./routers/ADMIN.router.js";
import ProductRouter from "./routers/Product.router.js";
import CardRouter from "./routers/Card.Router.js";
import OrderRouter from "./routers/Order.rouder.js";
import NotificationRouter from "./routers/Notification.router.js";
import UpsellRouter from "./routers/Upsell.router.js";
import dataBaseConnection from "./config/dbConncetion.js";
import axios from "axios";

const app = express();

dataBaseConnection();

app.use(express.json());
app.use(cookieParser());
app.use(morgan("dev"));
// app.use(
//   cors({
//     // origin: process.env.FRONTEND_URL,
//     origin: [process.env.FRONTEND_URL,"*"],
//     credentials: false,
//   })
// );
// app.use((req, res, next) => {
//   // res.header("Access-Control-Allow-Origin", process.env.FRONTEND_URL);
//   res.header("Access-Control-Allow-Origin", "*");
//   res.header("Access-Control-Allow-Credentials", "true");
//   res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   res.header(
//     "Access-Control-Allow-Headers",
//     "Content-Type, Authorization, X-Requested-With, Set-Cookie"
//   );
//   next();
// });
app.use(cors({
  origin: true,
  credentials: true,
}));

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  res.header(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, X-Requested-With"
  );
  next();
});

app.get("/ping", async (req, res) => {
  res.status(200).json({
    success: true,
    message: "pong...",
  });
});
app.use("/api/v3/user", UserRouter);
app.use("/api/v3/User/Notification", NotificationRouter);
app.use("/api/v3/Content", ContentRouter);
app.use("/api/v3/Admin", ADMINRouter);
app.use("/api/v3/Product", ProductRouter);
app.use("/api/v3/Card", CardRouter);
app.use("/api/v3/Order", OrderRouter);
app.use("/Upsell", UpsellRouter);

app.use("*", (req, res, next) => {
  res.status(404).send("Oops ! page not found..");
});
app.use(ErrorMiddleware);
export default app;
