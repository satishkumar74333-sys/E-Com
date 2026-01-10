import toast from "react-hot-toast";
import axiosInstance from "../../helper/axiosInstance";
import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";

const initialState = {
  Payment: [],
};
export const paymentCreate = createAsyncThunk(
  "/payment/create",
  async (data) => {
    try {
      const token = localStorage.getItem("Authenticator");

      const res = await axiosInstance.post(
        "/api/v3/Order/CreatePayment/new",
        {
          totalAmount: data,
        },
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
  }
);
export const checkPayment = createAsyncThunk("payment/check", async (data) => {
  try {
    const token = localStorage.getItem("Authenticator");

    const res = await axiosInstance.post(
      "/api/v3/Order/PaymentVerify/verify",

      data,

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
export const getPaymentRecord = createAsyncThunk(
  "/payments/online",
  async () => {
    try {
      const token = localStorage.getItem("Authenticator");

      const response = await axiosInstance.get(
        "/api/v3/Admin/Payment?count=10",
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      return error?.response?.data || error?.message || "Something went wrong";
    }
  }
);
export const PaymentData = createAsyncThunk("/payments/record", async () => {
  try {
    const token = localStorage.getItem("Authenticator");

    const response = await axiosInstance.get("/api/v3/Admin/Payment/Orders", {
      headers: {
        Authorization: `${token}`,
      },
    });

    return response.data;
  } catch (error) {
    return error?.response?.data || error?.message || "Something went wrong";
  }
});

const PaymentRedux = createSlice({
  name: "payment",
  initialState,
  reducers: {},
});
export const {} = PaymentRedux.actions;
export default PaymentRedux.reducer;
