import React, { useCallback, useEffect, useState } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { FaArrowCircleLeft, FaRegUserCircle } from "react-icons/fa";
import { useDispatch } from "react-redux";
import { getPost } from "../../Redux/Slice/ContentSlice";
import { FaArrowLeftLong, FaFaceAngry, FaRegClock } from "react-icons/fa6";
import { AiFillHeart } from "react-icons/ai";
import { FiShare2 } from "react-icons/fi";

function BlogDetails() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { state: data } = useLocation();
  const [post, setPost] = useState();

  async function handelLoadBlog() {
    if (!id) {
      navigate(-1);
      return;
    }
    const res = await dispatch(getPost(id));
    setPost(res?.payload?.data);
    setLoading(false);
  }
  const handleShare = useCallback(() => {
    if (navigator.share) {
      navigator.share({
        title: post?.title,
        text: post?.description,
        url: window.location.href,
      });
    }
  }, [post]);
  useEffect(() => {
    setLoading(true);
    if (data) {
      setPost(data);
      setLoading(false);
      return;
    } else {
      handelLoadBlog();
    }
  }, []);
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }
  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Post not found
          </h2>
          <button
            onClick={() => navigate("/blog")}
            className="text-blue-500 hover:text-blue-600 flex items-center justify-center gap-2"
          >
            <FaArrowLeftLong /> Back to Blog List
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        {/* Back Button */}
        <button
          onClick={() => navigate("/blog")}
          className="mb-8 flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors"
        >
          <FaArrowCircleLeft /> Back to Blog List
        </button>

        <article className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
          {/* Header */}
          <div className="p-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
              {post.title}
            </h1>

            {/* Author Info */}
            <div className="flex items-center mb-8">
              <FaRegUserCircle className="w-12 h-12 text-gray-400" />
              <div className="ml-4">
                <p className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {post.userName}
                </p>
                <div className="flex items-center text-sm text-gray-500">
                  <FaRegClock className="mr-1" />
                  {new Date(post?.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "2-digit",
                    year: "numeric",
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Main Image */}
          <div className="relative h-[400px] w-full">
            <img
              src={post.Post.secure_url}
              alt={post.title}
              className="w-full h-full object-contain"
            />
          </div>

          {/* Content */}
          <div className="p-8">
            <div className="prose dark:prose-invert max-w-none mb-8">
              <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
                {post.description}
              </p>
            </div>

            {/* Interaction Buttons */}
            <div className="flex items-center gap-8 pt-8 border-t border-gray-200 dark:border-gray-700">
              <button className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-blue-500 transition-colors">
                <AiFillHeart
                  className={
                    post.PostLikes?.some((like) => like.userName === "testUser")
                      ? "fill-current text-red-500"
                      : ""
                  }
                />
                <span>{post.likeCount} likes</span>
              </button>
              <button
                onClick={() => handleShare()}
                className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-green-500 transition-colors"
              >
                <FiShare2 />
                <span>Share</span>
              </button>
            </div>
          </div>
        </article>
      </div>
    </div>
  );
}

export default BlogDetails;
