import { useEffect, useState } from "react";
import { BlogForm } from "./Blogform";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useDispatch } from "react-redux";
import { updateBlog } from "../../Redux/Slice/ContentSlice";

function EditBlog({ data, setShow, onUpdated }) {
  const dispatch = useDispatch();
  const [id, setId] = useState();
  const [blog, setBlog] = useState({
    title: "",
    description: "",
  });
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (blog.title.length < 5) {
      alert("title most 5 char..");
      return;
    }
    if (blog.description.length < 5) {
      alert("description most 100 char..");
      return;
    }
    const res = await dispatch(updateBlog({ id: id, data: blog }));
    onUpdated(res);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setBlog((prev) => ({
      ...prev,
      [name]: value,
    }));
  };
  const onClose = () => {
    setShow(false);
  };
  useEffect(() => {
    setId(data._id);
    setBlog({
      title: data.title,
      description: data.description,
    });
  }, [data]);
  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="sm:w-[60%] max-sm:w-[80%]">
        <div className="bg-white/80 dark:bg-[#111827]/80 backdrop-blur-lg rounded-2xl shadow-xl p-8">
          <h1 className="text-3xl text-center font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-8">
            Edit Blog
          </h1>
          <button
            onClick={onClose}
            className=" hover:text-gray-700 absolute top-3 left-2 px-2 py-2 "
          >
            <XMarkIcon className="h-6 w-6 text-red-500" />
          </button>

          <BlogForm
            blog={blog}
            onSubmit={handleSubmit}
            onChange={handleChange}
          />
        </div>
      </div>
    </div>
  );
}

export default EditBlog;
