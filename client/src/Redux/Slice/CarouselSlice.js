import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../helper/axiosInstance";
import toast from "react-hot-toast";

const initialState = {
  Carousel:
    localStorage.getItem("Carousel") == null
      ? []
      : JSON.parse(localStorage.getItem("Carousel")),
};
export const getAllCarousel = createAsyncThunk(
  "/carousel/getallCarousel",
  async () => {
    try {
      const token = localStorage.getItem("Authenticator");

      const res = await axiosInstance.get(
        `/api/v3/user/Carousel`,
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

export const getCarousel = createAsyncThunk("/Carousel/get", async (id) => {
  try {
    const token = localStorage.getItem("Authenticator");

    const res = await axiosInstance.get(
      `/api/v3/Admin/Carousel/${id}`,

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
export const DeleteCarousel = createAsyncThunk(
  "/Carousel/Delete",
  async (id) => {
    try {
      const token = localStorage.getItem("Authenticator");

      const res = await axiosInstance.delete(
        `/api/v3/Admin/Carousel/${id}`,

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
export const updateCarousel = createAsyncThunk(
  "/Carousel/update",
  async ({ data, id }) => {
    try {
      const token = localStorage.getItem("Authenticator");
      const res = await axiosInstance.put(
        `/api/v3/Admin/Carousel/${id}`,
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

export const AddNewCarousel = createAsyncThunk(
  "/product/AddNewProduct",
  async (data) => {
    try {
      const token = localStorage.getItem("Authenticator");

      const res = axiosInstance.post(
        "/api/v3/Admin/Carousel",

        data,

        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );
      toast.promise(res, {
        loading: "please wait! Add Carousel ...",
        success: (data) => {
          return data?.data?.message;
        },

        error: (data) => {
          return data?.response?.data?.message;
        },
      });
      return (await res).data;
    } catch (e) {
      toast.error(e?.response?.message);
    }
  }
);

const CarouselRedux = createSlice({
  name: "carousel",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllCarousel.fulfilled, (state, action) => {
      if (action?.payload?.success) {
        state.Carousel = action.payload?.data;
        localStorage.setItem("Carousel", JSON.stringify(action.payload?.data));
      }
    });
  },
});
export const {} = CarouselRedux.actions;
export default CarouselRedux.reducer;
