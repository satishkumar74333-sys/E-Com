import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axiosInstance from "../../helper/axiosInstance";

const initialState = {
  PostData: [],
  PostCount: "",
};

export const UploadBlog = createAsyncThunk("/Blog/Upload", async (data) => {
  try {
    const token = localStorage.getItem("Authenticator");

    const res = await axiosInstance.post(
      "/api/v3/Admin/Post",

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

export const updateBlog = createAsyncThunk(
  "/Blog/update",
  async (data, thunkAPI) => {
    try {
      const token = localStorage.getItem("Authenticator");
      const res = await axiosInstance.put(
        `/api/v3/Admin/post/${data.id}`,
        data.data,
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      thunkAPI.dispatch({
        type: "UPDATE_BLOG_SUCCESS",
        payload: res.data,
      });
      return res.data;
    } catch (error) {
      return error?.response?.data || error?.message || "Something went wrong";
    }
  }
);

export const DeleteBlog = createAsyncThunk(
  "blog/Delete",
  async (id, thunkAPI) => {
    try {
      thunkAPI.dispatch({ type: "DELETE_BLOG_OPTIMISTIC", payload: id });
      const token = localStorage.getItem("Authenticator");

      const res = await axiosInstance.delete(
        `/api/v3/Admin/post/${id}`,

        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      thunkAPI.dispatch({ type: "DELETE_Blog_SUCCESS" });
      return res.data;
    } catch (error) {
      thunkAPI.dispatch({
        type: "DELETE_BLOG_FAIL",
        payload: error.message || "An error occurred",
      });
      return error?.response?.data || error?.message || "Something went wrong";
    }
  }
);
export const getAllPost = createAsyncThunk("/content/post", async () => {
  try {
    const token = localStorage.getItem("Authenticator");

    const res = await axiosInstance.get(
      "/api/v3/Content/Post",

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

export const LikeAndDisLikePost = createAsyncThunk(
  "/Content/likeDisLikePost",
  async (id) => {
    try {
      const token = localStorage.getItem("Authenticator");

      const res = await axiosInstance.put(
        `/api/v3/Content/Post/${id}`,
        {},
        {
          headers: {
            Authorization: `${token}`,
          },
        }
      );

      return res.data;
    } catch (e) {
      return error?.response?.data || error?.message || "Something went wrong";
    }
  }
);
export const getPost = createAsyncThunk("/Content/get/post", async (id) => {
  try {
    const token = localStorage.getItem("Authenticator");

    const res = await axiosInstance.get(
      `/api/v3/Content/Post/${id}`,

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
export const deleteCommentById = createAsyncThunk(
  "/Content/Delete/CommentById",
  async (data) => {
    try {
      const token = localStorage.getItem("Authenticator");

      const res = await axiosInstance.delete(
        `/api/v3/Content/Post/?postId=${data.postId}&commentId=${data.commentId}`,

        {
          data: { userName: data.userName },
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

export const AddCommentToPost = createAsyncThunk(
  "/Content/CommentAdd/Post",
  async (data) => {
    const token = localStorage.getItem("Authenticator");

    try {
      const res = await axiosInstance.post(
        `/api/v3/Content/Post/${data.id}`,
        {
          comment: data.comment,
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
export const AddCommentToReplay = createAsyncThunk(
  "/Content/CommentReplay/Post",
  async (data) => {
    const token = localStorage.getItem("Authenticator");

    try {
      const res = await axiosInstance.put(
        `/api/v3/Content/posts/${data.postId}/comments/${data.commentId}/AddNewComment`,
        {
          reply: data.reply,
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

export const removeReplayToComment = createAsyncThunk(
  "/Content/CommentReplayRemove/Post",
  async (data) => {
    const token = localStorage.getItem("Authenticator");
    try {
      const res = await axiosInstance.delete(
        `/api/v3/Content/posts/${data.postId}/comments/${data.commentId}/replays/${data.replayId}`,

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
export const exitCommentInPostById = createAsyncThunk(
  "/Content/CommentEdit/Post",
  async (data) => {
    try {
      const token = localStorage.getItem("Authenticator");

      const res = await axiosInstance.put(
        `/api/v3/Content/posts/${data.postId}/comments/${data.commentId}/UpdateComment`,
        {
          comment: data.updatedComment,
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

const BlogReducer = (state = { PostData: [] }, action) => {
  switch (action.type) {
    case "UPDATE_BLOG_SUCCESS":
      return {
        ...state,
        Blog: state.PostData.map((blog) =>
          blog._id === action.payload._id
            ? { ...blog, ...action.payload } // Update the specific product
            : blog
        ),
      };

    case "DELETE_BLOG_OPTIMISTIC":
      return {
        ...state,
        Blog: state.PostData.filter((b) => b._id !== action.payload),
      };
    case "DELETE_BLOG_FAIL":
      return { ...state, error: action.payload }; // Optionally handle error
    default:
      return state;
  }
};

const PostSliceRedux = createSlice({
  name: "content",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder.addCase(getAllPost.fulfilled, (state, action) => {
      if (action?.payload?.success) {
        state.PostCount = action.payload.AllPostGetCount;
        state.PostData = [...action.payload.AllPostGet];
      }
    });
  },
});
export const {} = PostSliceRedux.actions;
export default PostSliceRedux.reducer;
