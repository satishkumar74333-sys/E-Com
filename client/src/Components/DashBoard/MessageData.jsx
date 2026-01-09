import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { GetMessage, messageMarkARead } from "../../Redux/Slice/feedbackSlice";

const Messages = () => {
  const dispatch = useDispatch();
  const [messages, setMessages] = useState([]);
  const [filteredMessages, setFilteredMessages] = useState([]);
  const [filterRead, setFilterRead] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    const fetchMessages = async () => {
      try {
        const response = await dispatch(GetMessage({ page, limit: 10 }));

        if (response?.payload.success) {
          setMessages(response.payload.data);
          setFilteredMessages(response.payload.data);
          setTotalPages(response.payload.totalPages);
        }
      } catch (error) {
        console.error("Error fetching messages:", error);
      }
    };

    fetchMessages();
  }, [page]);

  const handleFilterChange = (e) => {
    const value = e.target.value;
    setFilterRead(value);

    if (value === "all") {
      setFilteredMessages(messages);
    } else {
      setFilteredMessages(
        messages.filter((msg) => msg.read.toString() === value)
      );
    }
  };

  const handlePageChange = (newPage) => {
    if (!id) return;
    if (newPage >= 1 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  async function handelMarkRead(id) {
    setMessages((prev) =>
      prev.map((message) =>
        message._id === id ? { ...message, read: true } : message
      )
    );
    setFilteredMessages((prev) =>
      prev.map((message) =>
        message._id === id ? { ...message, read: true } : message
      )
    );
    await dispatch(messageMarkARead(id));
  }
  return (
    <div className="min-h-screen   p-1 ">
      <div className="max-w-7xl mx-auto  shadow-xl rounded-lg sm:p-6">
        {/* Filter by Read Status */}
        <div className="mb-6 flex items-center space-x-4">
          <label className="text-lg max-sm:text-sm text-gray-700">
            Filter by Read Status:
          </label>
          <select
            className="border bg-white border-gray-300 dark:bg-gray-900 rounded-lg p-3 max-sm:p-2 mt-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            value={filterRead || "all"}
            onChange={handleFilterChange}
          >
            <option value="all">All</option>
            <option value="true">Read</option>
            <option value="false">Unread</option>
          </select>
        </div>

        {/* Message List */}
        <div className=" p-6 max-sm:p-2 rounded-lg shadow-md space-y-4">
          {filteredMessages.length > 0 ? (
            <ul className="space-y-4">
              {filteredMessages.map((message) => (
                <li
                  key={message._id}
                  className={`p-6 max-sm:p-1 border-l-4 ${
                    message.read
                      ? "border-green-500 bg-green-50 dark:bg-gray-300"
                      : "border-red-500 bg-red-50 dark:bg-gray-300"
                  } rounded-lg shadow-md transition duration-300 ease-in-out`}
                >
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-lg max-sm:text-sm text-indigo-700">
                        {message.email}
                      </p>
                      <p className="text-gray-700">
                        <strong>Message:</strong> {message.message}
                      </p>
                      <p className="text-gray-700">
                        <strong>Number:</strong> {message.number}
                      </p>
                      <p className="text-gray-500">
                        <strong>Read Status:</strong>{" "}
                        {message.read ? "Read" : "Unread"}
                      </p>
                      <p className="text-sm text-gray-400">
                        <strong>Created At:</strong>{" "}
                        {new Date(message.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <button
                        disabled={message.read == true}
                        onClick={() => handelMarkRead(message._id)}
                        className={`px-4 py-2 max-sm:py-1 max-sm:px-2 rounded-full ${
                          message.read ? "bg-green-400" : "bg-red-400"
                        } text-white font-semibold text-sm`}
                      >
                        {message.read ? "UnRead" : "Read"}
                      </button>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center text-gray-600">No messages to display.</p>
          )}
        </div>

        {/* Pagination */}
        <div className="mt-2 flex justify-between items-center pb-2">
          <div>
            <button
              onClick={() => handlePageChange(page - 1)}
              disabled={page === 1}
              className="px-5 py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
            >
              Previous
            </button>
          </div>
          <div className="text-lg text-gray-600">
            Page {page} of {totalPages}
          </div>
          <div>
            <button
              onClick={() => handlePageChange(page + 1)}
              disabled={page === totalPages}
              className="px-5 py-3 bg-indigo-600 text-white rounded-lg disabled:opacity-50"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Messages;
