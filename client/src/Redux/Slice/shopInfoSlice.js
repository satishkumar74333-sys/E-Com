import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../helper/axiosInstance";
const initialState = {
  phoneNumber: localStorage.getItem("phoneNumber") || "",
  email: localStorage.getItem("email") || "",
  youtube: localStorage.getItem("youtube") || "",
  facebook: localStorage.getItem("facebook") || "",
  instagram: localStorage.getItem("instagram") || "",
  address: localStorage.getItem("address") || "",
};
export const ShopInformationSEt = createAsyncThunk(
  "Admin/shop/info",
  async (data) => {
    try {
      const token = localStorage.getItem("Authenticator");
      const res = await axiosInstance.post("/api/v3/Admin/info", data, {
        headers: {
          Authorization: `${token}`,
        },
      });

      return res.data;
    } catch (error) {
      return error?.response?.data || error?.message || "Something went wrong";
    }
  }
);
export const getShopInfo = createAsyncThunk("/auth/info", async () => {
  try {
    const token = localStorage.getItem("Authenticator");
    const res = await axiosInstance.get(
      "/api/v3/User/info",

      {
        headers: {
          Authorization: `${token}`,
        },
      }
    );

    return res.data;
  } catch (error) {
    return error?.response?.data || error?.message || "Something went wrong";
  }
});

const ShopRedux = createSlice({
  name: "ShopInfo",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getShopInfo.fulfilled, (state, action) => {
      if (action.payload.success) {
        localStorage.setItem("email", action?.payload?.info[0].email);
        localStorage.setItem(
          "phoneNumber",
          action?.payload?.info[0].phoneNumber
        );
        localStorage.setItem("address", action?.payload?.info[0].address);
        localStorage.setItem("youtube", action?.payload?.info[0].youtube);
        localStorage.setItem("facebook", action?.payload?.info[0].facebook);
        localStorage.setItem("instagram", action?.payload?.info[0].instagram);
        state.phoneNumber = action?.payload?.info[0].phoneNumber;
        state.email = action?.payload?.info[0].email;
        state.instagram = action?.payload?.info[0].instagram;
        state.facebook = action?.payload?.info[0].facebook;
        state.youtube = action?.payload?.info[0].youtube;
        state.address = action?.payload?.info[0].address;
      }
    });
  },
});

export const {} = ShopRedux.actions;
export default ShopRedux.reducer;
