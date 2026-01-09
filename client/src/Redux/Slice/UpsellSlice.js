import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../helper/axiosInstance";
import toast from "react-hot-toast";

const initialState = {
  upsells: [],
  loading: false,
  error: null,
};

export const getAllUpsells = createAsyncThunk(
  "/upsell/getAll",
  async () => {
    try {
      const token = localStorage.getItem("Authenticator");

      const res = await axiosInstance.get(
        "/api/v3/Admin/Upsell",
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

export const createUpsell = createAsyncThunk(
  "/upsell/create",
  async (data) => {
    try {
      const token = localStorage.getItem("Authenticator");

      const res = await axiosInstance.post(
        "/api/v3/Admin/Upsell",
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

export const updateUpsell = createAsyncThunk(
  "/upsell/update",
  async ({ id, data }) => {
    try {
      const token = localStorage.getItem("Authenticator");

      const res = await axiosInstance.put(
        `/api/v3/Admin/Upsell/${id}`,
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

export const deleteUpsell = createAsyncThunk(
  "/upsell/delete",
  async (id) => {
    try {
      const token = localStorage.getItem("Authenticator");

      const res = await axiosInstance.delete(
        `/api/v3/Admin/Upsell/${id}`,
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

const upsellSlice = createSlice({
  name: "upsell",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllUpsells.pending, (state) => {
        state.loading = true;
      })
      .addCase(getAllUpsells.fulfilled, (state, action) => {
        state.loading = false;
        if (action.payload.success) {
          state.upsells = action.payload.data;
        }
      })
      .addCase(getAllUpsells.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(createUpsell.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.upsells.push(action.payload.data);
          toast.success("Upsell created successfully");
        }
      })
      .addCase(updateUpsell.fulfilled, (state, action) => {
        if (action.payload.success) {
          const index = state.upsells.findIndex(u => u._id === action.payload.data._id);
          if (index !== -1) {
            state.upsells[index] = action.payload.data;
          }
          toast.success("Upsell updated successfully");
        }
      })
      .addCase(deleteUpsell.fulfilled, (state, action) => {
        if (action.payload.success) {
          state.upsells = state.upsells.filter(u => u._id !== action.payload.data._id);
          toast.success("Upsell deleted successfully");
        }
      });
  },
});

export default upsellSlice.reducer;