import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import toast from "react-hot-toast";
import axiosInstance from "../../helper/axiosInstance";

const initialState = {
  Feedback: [],
  TotalFeedbackCount: 1000,
  happyCustomers: 500,
};
export const SubmitFeedback = createAsyncThunk(
  "feedback/Submit",
  async (data) => {
    const token = localStorage.getItem("Authenticator");

    try {
      const res = await axiosInstance.post(
        "/api/v3/user/SubmitFeedback",
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
export const SendMassage = createAsyncThunk("massage/Submit", async (data) => {
  const token = localStorage.getItem("Authenticator");

  try {
    const res = await axiosInstance.post("/api/v3/user/messageSubmit", data, {
      headers: {
        Authorization: `${token}`,
      },
    });

    return res.data;
  } catch (error) {
    return error?.response?.data || error?.message || "Something went wrong";
  }
});
export const editFeedback = createAsyncThunk("feedback/edit", async (data) => {
  const token = localStorage.getItem("Authenticator");

  try {
    const res = await axiosInstance.put(
      `/api/v3/user/feedback/${data.id}`,
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
export const getFeedback = createAsyncThunk(
  "feedback/get",
  async ({ page = 1, limit = 10 }) => {
    try {
      const token = localStorage.getItem("Authenticator");

      const res = await axiosInstance.get(
        `/api/v3/user/getFeedback?page=${page}&limit=${limit}`,
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
export const GetMessage = createAsyncThunk(
  "feedback/get",
  async ({ page = 1, limit = 20 }) => {
    try {
      const token = localStorage.getItem("Authenticator");

      const res = await axiosInstance.get(
        `/api/v3/Admin/message?page=${page}&limit=${limit}`,
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
export const messageMarkARead = createAsyncThunk(
  "feedback/delete",
  async (id) => {
    try {
      const token = localStorage.getItem("Authenticator");

      const res = await axiosInstance.put(
        `/api/v3/Admin/message/${id}`,
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
  }
);
export const FeedbackDelete = createAsyncThunk(
  "feedback/delete",
  async (id) => {
    try {
      const token = localStorage.getItem("Authenticator");

      const res = await axiosInstance.delete(`/api/v3/user/feedback/${id}`, {
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
const FeedbackRedux = createSlice({
  name: "feedback",
  initialState,
  extraReducers: (builder) => {
    builder.addCase(getFeedback.fulfilled, (state, action) => {
      if (action?.payload?.success) {
        state.Feedback = action?.payload?.data;
        state.happyCustomers = action?.payload?.happyCustomers;
        state.TotalFeedbackCount = action?.payload?.TotalFeedbackCount;
      }
    });
  },
});
export const {} = FeedbackRedux.actions;
export default FeedbackRedux.reducer;
