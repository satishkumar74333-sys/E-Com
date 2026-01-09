import React, { useEffect, useState } from "react";
import { AiOutlineDelete } from "react-icons/ai";
import { FiEdit } from "react-icons/fi";
import { useDispatch, useSelector } from "react-redux";
import {
  editFeedback,
  FeedbackDelete,
  getFeedback,
} from "../Redux/Slice/feedbackSlice";

const FeedbackList = () => {
  const dispatch = useDispatch();
  const { Feedback: feedback } = useSelector((state) => state?.feedback);
  const { userName, role } = useSelector((state) => state?.auth);

  const [displayedFeedback, setDisplayedFeedback] = useState([]);
  const [filter, setFilter] = useState("all");
  const [page, setPage] = useState(1);
  const [editingFeedbackId, setEditingFeedbackId] = useState(null);
  const [editedComment, setEditedComment] = useState("");

  useEffect(() => {
    const fetchFeedbacks = async () => {
      if (feedback.length === 0) {
        await dispatch(getFeedback({ page, limit: 0 }));
      }
    };
    fetchFeedbacks();
  }, [dispatch, feedback.length, page]);

  useEffect(() => {
    const filteredFeedback =
      filter === "1-3"
        ? feedback.filter((fb) => fb.rating >= 1 && fb.rating <= 3)
        : filter === "4-5"
        ? feedback.filter((fb) => fb.rating >= 4 && fb.rating <= 5)
        : feedback;

    const sortedFeedback = [
      ...filteredFeedback.filter((fb) => fb.userName === userName),
      ...filteredFeedback.filter((fb) => fb.userName !== userName),
    ];

    const startIndex = (page - 1) * 5;
    const paginatedFeedback = sortedFeedback.slice(0, startIndex + 5);

    setDisplayedFeedback(paginatedFeedback);
  }, [filter, page, feedback, userName]);

  const handleFilterChange = (newFilter) => {
    setFilter(newFilter);
    setPage(1);
  };

  const loadMore = async () => {
    const nextPage = page + 1;
    setPage(nextPage);
    await dispatch(getFeedback({ page: nextPage, limit: 0 }));
  };

  const handleEditClick = (fb) => {
    setEditingFeedbackId(fb._id);
    setEditedComment(fb.comment);
  };

  const handleSaveEdit = async () => {
    const updatedFeedback = { id: editingFeedbackId, comment: editedComment };
    const res = await dispatch(editFeedback({ data: updatedFeedback }));
    if (res?.payload?.success) {
      setDisplayedFeedback((prev) =>
        prev.map((fb) =>
          fb._id === res?.payload?.data._id
            ? { ...fb, comment: res?.payload?.data.comment }
            : fb
        )
      );
    }
    setEditingFeedbackId(null);
  };
  async function handelDeleteFeedback(id) {
    if (!id) return;
    setDisplayedFeedback((prev) =>
      prev.filter((feedback) => feedback._id !== id)
    );
    await dispatch(FeedbackDelete(id));
  }
  const handleCancelEdit = () => {
    setEditingFeedbackId(null);
  };

  return (
    <div className="w-full  mx-auto mt-10 max-w-xs:mt-0  px-4 mb-2">
      <h2 className="text-3xl  max-w-xs:text-2xl font-semibold mb-6  max-w-xs:mb-2 text-center text-gray-800 dark:text-white">
        User Feedbacks
      </h2>

      <div className="flex justify-center gap-4 mb-6  font-semibold">
        <button
          className={`px-4  max-w-xs:text-sm py-2 rounded ${
            filter === "all"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => handleFilterChange("all")}
        >
          All Feedback
        </button>
        <button
          className={`px-4 py-2  max-w-xs:text-sm rounded ${
            filter === "1-3"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => handleFilterChange("1-3")}
        >
          1-3 Stars
        </button>
        <button
          className={`px-4 py-2  max-w-xs:text-sm rounded ${
            filter === "4-5"
              ? "bg-blue-500 text-white"
              : "bg-gray-200 text-gray-800"
          }`}
          onClick={() => handleFilterChange("4-5")}
        >
          4-5 Stars
        </button>
      </div>

      <div className="space-y-6">
        {displayedFeedback?.map((fb, index) => (
          <div
            key={index}
            className="w-full p-6 bg-white dark:text-white text-black dark:bg-gray-800 border border-gray-200 rounded-lg shadow-md hover:shadow-xl transition-all"
          >
            <div className="flex items-center mb-4 justify-between">
              <span className="text-lg font-medium text-gray-800 dark:text-white">
                {fb.userName || "Anonymous"}
              </span>
              {fb.userName === userName ||
                (["ADMIN", "AUTHOR"].includes(role) && (
                  <span className="flex gap-2">
                    <AiOutlineDelete
                      size={26}
                      className="text-red-400 cursor-pointer"
                      onClick={() => {
                        handelDeleteFeedback(fb._id);
                      }}
                    />
                  </span>
                ))}
              {fb.userName === userName && (
                <span className="flex gap-2">
                  <FiEdit
                    size={26}
                    className="cursor-pointer text-blue-400 hover:text-blue-300"
                    onClick={() => handleEditClick(fb)}
                  />
                </span>
              )}
            </div>

            <div className="flex items-center space-x-2 mb-4">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={`text-xl ${
                    fb.rating >= star ? "text-yellow-400" : "text-gray-400"
                  }`}
                >
                  ★
                </span>
              ))}
            </div>

            {editingFeedbackId === fb._id ? (
              <div>
                <textarea
                  value={editedComment}
                  onChange={(e) => setEditedComment(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md mb-4"
                />
                <div className="flex justify-between">
                  <button
                    className="bg-blue-500 text-white px-4 py-2 rounded-md"
                    onClick={handleSaveEdit}
                  >
                    Save
                  </button>
                  <button
                    className="bg-gray-400 text-white px-4 py-2 rounded-md"
                    onClick={handleCancelEdit}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-gray-700 dark:text-gray-300">{fb.comment}</p>
            )}
          </div>
        ))}
      </div>

      {/* Load More Button */}
      {displayedFeedback.length < feedback.length && (
        <div className="flex justify-center mt-6">
          <button
            className="px-6 py-2 max-w-xs:text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
            onClick={loadMore}
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
};

export default FeedbackList;
