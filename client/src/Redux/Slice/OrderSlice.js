import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axiosInstance from "../../helper/axiosInstance";

const initialState = {
  Orders: [],
};
export const PlaceOrder = createAsyncThunk("Order/Place", async (data) => {
  try {
    const token = localStorage.getItem("Authenticator");
    const res = await axiosInstance.post("/api/v3/Order/PlaceOrder", data, {
      headers: {
        Authorization: `${token}`,
      },
    });

    return res.data;
  } catch (error) {
    return error?.response?.data || error?.message || "Something went wrong";
  }
});

export const getOrderById = createAsyncThunk("Order/getOrder", async (id) => {
  try {
    const token = localStorage.getItem("Authenticator");
    const res = await axiosInstance.get(
      `/api/v3/Order/${id}/getOrderById`,

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
export const getOrder = createAsyncThunk("Order/get", async (id) => {
  try {
    const token = localStorage.getItem("Authenticator");
    const res = await axiosInstance.get(
      `/api/v3/Order/${id}`,

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
export const UpdateOrder = createAsyncThunk(
  "Order/updateOrder",
  async (data) => {
    try {
      const token = localStorage.getItem("Authenticator");
      const res = await axiosInstance.put(
        `/api/v3/Order/${data.id}`,

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
  }
);

export const CancelOrder = createAsyncThunk("Order/updateOrder", async (id) => {
  try {
    const token = localStorage.getItem("Authenticator");
    const res = await axiosInstance.put(
      `/api/v3/Order/${id}/CancelOrder`,
      {},
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

export const AllOrder = createAsyncThunk("Order/Orders", async () => {
  try {
    const token = localStorage.getItem("Authenticator");
    const res = await axiosInstance.get(`/api/v3/Admin/Order`, {
      headers: {
        Authorization: `${token}`,
      },
    });

    return res.data;
  } catch (error) {
    return error?.response?.data || error?.message || "Something went wrong";
  }
});

const OrderRedux = createSlice({
  name: "order",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getOrder.fulfilled, (state, action) => {
      if (action?.payload?.success) {
        state.Orders = action?.payload?.data;
      }
    });
  },
});
export const {} = OrderRedux.actions;
export default OrderRedux.reducer;
