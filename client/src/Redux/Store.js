import { configureStore } from "@reduxjs/toolkit";
import authSliceRedux from "./Slice/authSlice";
import PostSliceRedux from "./Slice/ContentSlice.js";
import ProductRedux from "./Slice/ProductSlice";
import OrderRedux from "./Slice/OrderSlice";
import NotificationSliceRedux from "./Slice/notification.Slice";
import FeedbackRedux from "./Slice/feedbackSlice";
import CarouselRedux from "./Slice/CarouselSlice.js";
import StoreCategoryListRedux from "./Slice/CategorySlice.js";
import ShopRedux from "./Slice/shopInfoSlice.js";
import UpsellRedux from "./Slice/UpsellSlice.js";
import CartRedux from "./Slice/CartSlice.js";
const Store = configureStore({
  reducer: {
    auth: authSliceRedux,
    Category: StoreCategoryListRedux,
    content: PostSliceRedux,
    product: ProductRedux,
    order: OrderRedux,
    notification: NotificationSliceRedux,
    feedback: FeedbackRedux,
    carousel: CarouselRedux,
    ShopInfo: ShopRedux,
    upsell: UpsellRedux,
    cart: CartRedux,
  },
  devTools: true,
});
export default Store;
