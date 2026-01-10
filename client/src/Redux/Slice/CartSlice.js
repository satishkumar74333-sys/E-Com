import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../helper/axiosInstance";
import { getProduct } from "./ProductSlice";
import toast from "react-hot-toast";

const getInitialCart = () => {
  const guestCart = localStorage.getItem("guestCart");
  return guestCart ? JSON.parse(guestCart) : [];
};

const initialState = {
  items: getInitialCart(),
  isLoggedIn: localStorage.getItem("isLoggedIn") === "true",
  loading: false,
  error: null,
};

// Thunk to add product to cart
export const addToCart = createAsyncThunk(
  "cart/addToCart",
  async ({ productId, sku, quantity = 1, customPrice, customGst, customDiscount }, { getState, dispatch }) => {
    const { auth } = getState();
    const isLoggedIn = auth.isLoggedIn;

    if (isLoggedIn) {
      // Add to server cart
      try {
        const token = localStorage.getItem("Authenticator");
        const data = { productId, sku, quantity };
        if (customPrice !== undefined) data.price = customPrice;
        if (customGst !== undefined) data.gst = customGst;
        if (customDiscount !== undefined) data.discount = customDiscount;
        const res = await axiosInstance.put(
          "/api/v3/Card/AddProduct",
          data,
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        // Reload account to get updated cart
        dispatch({ type: "auth/loadAccount" });
        return res.data;
      } catch (error) {
        throw error?.response?.data || error?.message || "Failed to add to cart";
      }
    } else {
      // Add to localStorage cart - fetch product details and save full item
      try {
        const res = await dispatch(getProduct(productId));
        const product = res?.payload?.data;
        if (!product) throw new Error("Product not found");

        let price = 0;
        let discount = 0;
        let finalPrice = 0;
        let gst = product.gst || 0;
        let imageUrl = "";
        let stock = "In stock";
        let description = product.description;
        let productType = product.productType;
        let name = product.name;
        let colorId = null;

        if (customPrice !== undefined) {
          price = customPrice;
          gst = customGst !== undefined ? customGst : gst;
          discount = customDiscount !== undefined ? customDiscount : discount;
        } else {
          if (product.productType === "simple") {
            price = product.simpleProduct?.price || 0;
            discount = product.simpleProduct?.discount || 0;
            imageUrl = product.simpleProduct?.images?.[0]?.secure_url || "";
            stock = product.simpleProduct?.stockStatus || "In stock";
          } else if (product.productType === "variant") {
            const color = product.variants?.flatMap(v => v.colors).find(c => c.sku === sku);
            if (color) {
              price = color.price || 0;
              discount = color.discount || 0;
              imageUrl = color.images?.[0]?.secure_url || "";
              stock = color.stockStatus || "In stock";
              colorId = color._id;
              // Find variantId
              for (const variant of product.variants) {
                if (variant.colors.some(c => c._id.toString() === colorId.toString())) {
                  variantId = variant._id;
                  break;
                }
              }
            } else {
              // If sku not found, use first color
              const firstVariant = product.variants?.[0];
              const firstColor = firstVariant?.colors?.[0];
              if (firstColor) {
                price = firstColor.price || 0;
                discount = firstColor.discount || 0;
                imageUrl = firstColor.images?.[0]?.secure_url || "";
                stock = firstColor.stockStatus || "In stock";
                variantId = firstVariant._id;
                colorId = firstColor._id;
              }
            }
          } else if (product.productType === "bundle") {
            price = product.bundleProducts?.price || 0;
            discount = product.bundleProducts?.discount || 0;
            imageUrl = product.bundleProducts?.images?.[0]?.secure_url || "";
            stock = "In stock";
          }
        }

        const gstAmount = (price * gst) / 100;
        const priceWithGst = price + gstAmount;
        finalPrice = priceWithGst - Math.round((priceWithGst * discount) / 100);

        const guestCart = getInitialCart();
        const existingItem = guestCart.find(item => item.product === productId && item.sku === sku);

        if (existingItem) {
          existingItem.quantity += quantity;
        } else {
          guestCart.push({
            product: productId,
            sku,
            quantity,
            name,
            gst,
            stock,
            discount,
            price,
            finalPrice,
            description,
            productType,
            variantId,
            colorId,
            imageUrl,
          });
        }

        localStorage.setItem("guestCart", JSON.stringify(guestCart));
        return { items: guestCart };
      } catch (error) {
        throw error?.response?.data || error?.message || "Failed to add to cart";
      }
    }
  }
);

// Thunk to remove product from cart
export const removeFromCart = createAsyncThunk(
  "cart/removeFromCart",
  async ({ productId, sku }, { getState, dispatch }) => {
    const { auth } = getState();
    const isLoggedIn = auth.isLoggedIn;

    if (isLoggedIn) {
      try {
        const token = localStorage.getItem("Authenticator");
        const res = await axiosInstance.put(
          "/api/v3/Card/v2/RemoveProduct",
          { productId ,sku},
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        // Reload account
        dispatch({ type: "auth/loadAccount" });
        return res.data;
      } catch (error) {
        throw error?.response?.data || error?.message || "Failed to remove from cart";
      }
    } else {
      // Remove from localStorage cart
      const guestCart = getInitialCart();
      const updatedCart = guestCart.filter(item => !(item.product === productId && item.sku === sku));
      localStorage.setItem("guestCart", JSON.stringify(updatedCart));
      return { items: updatedCart };
    }
  }
);

// Thunk to update quantity
export const updateQuantity = createAsyncThunk(
  "cart/updateQuantity",
  async ({ productId, sku, quantity }, { getState, dispatch }) => {
    const { auth } = getState();
    const isLoggedIn = auth.isLoggedIn;

    if (isLoggedIn) {
      // Update on server
      try {
        const token = localStorage.getItem("Authenticator");
        const res = await axiosInstance.put(
          "/api/v3/Card/UpdateQuantity",
          { productId, sku, quantity },
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
        // Reload account to get updated cart
        dispatch({ type: "auth/loadAccount" });
        return res.data;
      } catch (error) {
        throw error?.response?.data || error?.message || "Failed to update quantity";
      }
    } else {
      // Update in localStorage
      const guestCart = getInitialCart();
      const item = guestCart.find(item => item.product === productId && item.sku === sku);
      if (item) {
        if (quantity > 0) {
          item.quantity = quantity;
        } else {
          // Remove if quantity 0
          const index = guestCart.indexOf(item);
          guestCart.splice(index, 1);
        }
        localStorage.setItem("guestCart", JSON.stringify(guestCart));
      }
      return { items: guestCart };
    }
  }
);

// Thunk to load cart for logged-in user
export const loadCart = createAsyncThunk(
  "cart/loadCart",
  async (_, { dispatch }) => {
    try {
      const token = localStorage.getItem("Authenticator");
      const res = await axiosInstance.get(
        "/api/v3/user/getProfile",
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      return res.data;
    } catch (error) {
      throw error?.response?.data || error?.message || "Failed to load cart";
    }
  }
);

// Thunk to sync guest cart to server when logging in
export const syncCartToServer = createAsyncThunk(
  "cart/syncCartToServer",
  async (_, { getState, dispatch }) => {
    const guestCart = getInitialCart();
    if (guestCart.length === 0) return;

    try {
      const token = localStorage.getItem("Authenticator");
      // Add each item to server cart
      for (const item of guestCart) {
        await axiosInstance.put(
          "/api/v3/Card/AddProduct",
          { productId: item.product, sku: item.sku, quantity: item.quantity },
          {
            headers: {
              Authorization: `${token}`,
            },
          }
        );
      }
      // Clear guest cart
      localStorage.removeItem("guestCart");
      // Reload account
      dispatch({ type: "auth/loadAccount" });
      toast.success("Cart synced successfully");
    } catch (error) {
      toast.error("Failed to sync cart");
      throw error;
    }
  }
);

const cartSlice = createSlice({
  name: "cart",
  initialState,
  reducers: {
    setLoggedIn: (state, action) => {
      state.isLoggedIn = action.payload;
    },
    clearGuestCart: (state) => {
      state.items = [];
      localStorage.removeItem("guestCart");
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(addToCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(addToCart.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.isLoggedIn) {
          state.items = action.payload.items;
        }
        toast.success("Added to cart");
      })
      .addCase(addToCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        toast.error(action.error.message);
      })
      .addCase(removeFromCart.pending, (state) => {
        state.loading = true;
      })
      .addCase(removeFromCart.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.isLoggedIn) {
          state.items = action.payload.items;
        }
        toast.success("Removed from cart");
      })
      .addCase(removeFromCart.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        toast.error(action.error.message);
      })
      .addCase(updateQuantity.pending, (state) => {
        state.loading = true;
      })
      .addCase(updateQuantity.fulfilled, (state, action) => {
        state.loading = false;
        if (!state.isLoggedIn) {
          state.items = action.payload.items;
        }
      })
      .addCase(updateQuantity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message;
        toast.error(action.error.message);
      })
      .addCase(loadCart.fulfilled, (state, action) => {
        // Cart is loaded via auth slice
      })
      .addCase(syncCartToServer.fulfilled, (state) => {
        state.items = [];
      });
  },
});

export const { setLoggedIn, clearGuestCart } = cartSlice.actions;
export default cartSlice.reducer;