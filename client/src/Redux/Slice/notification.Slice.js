import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axiosInstance from "../../helper/axiosInstance";

const initialState = {
  Notification: [],
};

export const NotificationGet = createAsyncThunk(
  "/Notification/get",
  async () => {
    try {
      const token = localStorage.getItem("Authenticator");
      const res = await axiosInstance.get(`/api/v3/User/Notification`, {
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
export const NotificationRead = createAsyncThunk(
  "/Notification/read",
  async (id, thunkAPI) => {
    try {
      thunkAPI.dispatch({
        type: "DELETE_NOTIFICATION_OPTIMISTIC",
        payload: id,
      });
      const token = localStorage.getItem("Authenticator");
      const res = await axiosInstance.put(
        `/api/v3/User/Notification/${id}`,
        {},
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      thunkAPI.dispatch({ type: "UPDATE_NOTIFICATION_SUCCESS" });
      return res.data;
    } catch (error) {
      return error?.response?.data || error?.message || "Something went wrong";
    }
  }
);
const NotificationReducer = (state = { Notification: [] }, action) => {
  switch (action.type) {
    case "UPDATE_NOTIFICATION_SUCCESS":
      return {
        ...state,
        product: state.Notification.map((Notification) =>
          Notification._id === action.payload._id
            ? { ...Notification, ...action.payload } // Update the specific product
            : Notification
        ),
      };

    case "DELETE_NOTIFICATION_OPTIMISTIC":
      return {
        ...state,
        products: state.Notification.filter((N) => N._id !== action.payload),
      };
    default:
      return state;
  }
};

const NotificationSliceRedux = createSlice({
  name: "notification",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(NotificationGet.fulfilled, (state, action) => {
      if (action.payload?.success) {
        state.Notification = action.payload.data;
      }
    });
  },
});
export const {} = NotificationSliceRedux.actions;
export default NotificationSliceRedux.reducer;
