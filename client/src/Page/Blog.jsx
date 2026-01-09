import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Layout from "../layout/layout";
import BlogCard from "../Components/Blog/BLogCard";
import { useEffect, useState } from "react";
import { DeleteBlog, getAllPost } from "../Redux/Slice/ContentSlice";
import FeedbackForm from "../Components/feedbackfrom";
import FeedbackList from "../Components/feedbackList";

function Blog() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const { PostData } = useSelector((state) => state.content);
  const [showPost, setShowPost] = useState([]);
  async function handelBlogLoad() {
    const res = await dispatch(getAllPost());
    setShowPost(res?.payload?.AllPostGet);
    setLoading(false);
  }
  useEffect(() => {
    handelBlogLoad();
    setShowPost(PostData);
  }, []);
  async function handleDeleteBlog(blogId) {
    const iConfirm = window.confirm("Delete this Blog...");
    if (!iConfirm) return;
    setShowPost((prevBlog) => prevBlog.filter((blog) => blog._id !== blogId));
    await dispatch(DeleteBlog(blogId));
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
      </div>
    );
  }
  return (
    <Layout>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="container mx-auto px-4 py-8">
          {/* Blog Posts Grid */}
          <div className="flex   justify-evenly flex-wrap gap-10 ">
            {showPost.length === 0 ? (
              <div className="col-span-full flex items-center justify-center h-64">
                <p className="text-xl text-gray-500 dark:text-gray-400">
                  No blogs found...
                </p>
              </div>
            ) : (
              showPost.map((blog) => (
                <BlogCard
                  key={blog._id}
                  data={blog}
                  onDelete={handleDeleteBlog}
                />
              ))
            )}
          </div>

          {/* Feedback Section */}
          <div className="mt-16">
            <hr className="border-gray-200 dark:border-gray-700 mb-8" />
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
              Feedback
            </h2>
            <div className="space-y-8">
              <FeedbackForm />
              <FeedbackList />
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
export default Blog;
