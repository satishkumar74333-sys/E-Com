import { model, Schema } from "mongoose";
const PostSchema = new Schema(
  {
    userId: {
      type: String,
      ref: "User",
      required: true,
    },
    userName: {
      type: String,
      ref: "User",
      required: true,
    },
    title: {
      type: "string",
      required: [true, "title is required.."],
      minlength: [5, "title is most be 5 char"],
      trim: true,
    },
    description: {
      type: "string",
      required: [true, "title is required.."],
      minlength: [5, "title is most be 5 char"],
      trim: true,
    },
    Post: {
      public_id: {
        type: String,
      },
      secure_url: {
        type: String,
      },
    },

    comments: [
      {
        userName: String,
        comment: String,
        replies: [
          {
            userName: String,
            reply: String,
            createdAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],

    likeCount: {
      type: Number,
      default: 0,
    },
    PostLikes: [
      {
        PostLike: {
          type: String,
          enum: ["TRUE", "FALSE"],
          default: "FALSE",
        },
        userName: {
          type: String,
          required: [true, "like be most required userName"],
        },
      },
      {
        timestamps: true,
      },
    ],
    numberOfComment: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);
const Post = model("Post", PostSchema);
export default Post;
