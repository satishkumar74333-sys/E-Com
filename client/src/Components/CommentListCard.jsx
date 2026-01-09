import { useDispatch, useSelector } from "react-redux";
import { useEffect, useRef, useState } from "react";
import {
  AddCommentToPost,
  AddCommentToReplay,
  deleteCommentById,
  exitCommentInPostById,
  getAllPost,
  getPost,
  removeReplayToComment,
} from "../Redux/Slice/ContentSlice";

function CommentCard({ data, onAddComment, onUpdate }) {
  const dispatch = useDispatch();
  const [BlogId, setBlogId] = useState(data?._id);
  const { userName, role } = useSelector((state) => state?.auth);
  const [newComment, setNewComment] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editedComment, setEditedComment] = useState("");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replies, setReplies] = useState({});
  const endOfCommentsRef = useRef(null);

  const handleCommentSubmit = (e) => {
    e.preventDefault();
    if (newComment !== "") {
      if (replyingTo !== null) {
        AddReplay();
        setReplies((prevReplies) => ({
          ...prevReplies,
          [replyingTo]: [
            ...(prevReplies[replyingTo] || []),
            { userName, comment: newComment, createdAt: new Date() },
          ],
        }));
        setNewComment("");
        setReplyingTo(null);
      } else {
        addComment();
      }
      setNewComment("");
    }
  };

  async function AddReplay() {
    const res = await dispatch(
      AddCommentToReplay({
        postId: data._id,
        commentId: replyingTo,
        reply: newComment,
      })
    );

    if (res?.payload?.success) {
      onAddComment(res?.payload?.data);
    }
    setNewComment("");
  }

  async function addComment() {
    const res = await dispatch(
      AddCommentToPost({ id: data._id, comment: newComment })
    );
    if (res?.payload?.success) {
      onAddComment(res?.payload?.data);
    }
  }

  async function DeleteComment(id, userName) {
    const res = await dispatch(
      deleteCommentById({ postId: data._id, commentId: id, userName: userName })
    );
    if (res?.payload?.success) {
      onAddComment(res?.payload?.data);
    }
  }

  async function DeleteReplay(replayId, commentId) {
    const response = await dispatch(
      removeReplayToComment({
        postId: data._id,
        commentId: commentId,
        replayId: replayId,
      })
    );
    if (response?.payload?.success) {
      onAddComment(response?.payload?.data);
    }
  }

  async function handleEditSubmit(commentId) {
    if (editedComment.trim() !== "") {
      const res = await dispatch(
        exitCommentInPostById({
          postId: data._id,
          commentId,
          updatedComment: editedComment,
        })
      );
      if (res) {
        setEditingCommentId(null);
        setEditedComment("");
        if (res?.payload?.success) {
          onAddComment(res?.payload?.data);
        }
      }
    }
  }

  useEffect(() => {
    if (endOfCommentsRef.current) {
      endOfCommentsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [data.comments]);
  useEffect(() => {
    const interval = setInterval(async () => {
      await dispatch(getPost(data._id));
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="p-4 max-w-xs:px-0 ">
      {data.comments?.numberOfComment === 0 ? (
        <div className="flex justify-center">
          <p className="text-black text-xl text-center">No Comments...</p>
        </div>
      ) : (
        <div>
          {data.comments?.map((comment, index) => (
            <div
              key={index}
              className={`flex mb-2 ${
                comment.userName === userName ? "justify-start" : "justify-end"
              }`}
            >
              <div className="bg-green-200 dark:text-black shadow-[0_0_1px_black] rounded-xl">
                <p
                  className={`${
                    comment.userName === userName
                      ? `text-start pl-1`
                      : `text-end pr-1`
                  }
                font-semibold text-sm`}
                >
                  {comment.userName === userName ? "You" : comment.userName}
                </p>
                <div
                  className={`p-3 rounded-lg shadow-md max-w-md ${
                    comment.userName === userName
                      ? "bg-blue-100 text-left"
                      : "bg-green-100 text-right"
                  }`}
                >
                  {/* //edit comment// */}
                  {editingCommentId === comment._id ? (
                    <div className="mt-2">
                      <input
                        type="text"
                        id="text_"
                        value={editedComment}
                        onChange={(e) => setEditedComment(e.target.value)}
                        className="p-2 border border-gray-300 rounded-md w-full"
                      />
                      <button
                        onClick={() => handleEditSubmit(comment._id)}
                        className="mt-1 px-4 py-1 bg-green-500 text-white rounded-md max-w-xs:text-sm"
                      >
                        Save
                      </button>
                      <button
                        onClick={() => {
                          setEditingCommentId(null);
                          setEditedComment("");
                        }}
                        className="ml-2 mt-1  max-w-xs:text-sm px-4 py-1 bg-red-500  rounded-md"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <p className="text-sm">{comment.comment}</p>
                  )}
                  <span className="text-gray-500 text-xs">
                    {new Date(comment.createdAt).toLocaleString()}
                  </span>
                  <div className="mt-1 text-sm">
                    <p
                      onClick={() => setReplyingTo(comment._id)}
                      className={`${
                        comment.userName === userName && `hidden`
                      } cursor-pointer  max-w-xs:text-sm text-blue-600`}
                    >
                      Reply
                    </p>
                    <div className="flex justify-between text-blue-600">
                      <p
                        className={`${
                          comment.userName === userName ||
                          role === "ADMIN" ||
                          role === "AUTHOR"
                            ? `flex`
                            : `hidden`
                        } justify-between  max-w-xs:text-sm text-blue-600 cursor-pointer hover:underline`}
                        onClick={() =>
                          DeleteComment(comment._id, comment.userName)
                        }
                      >
                        Delete
                      </p>
                      <p
                        className={`${
                          comment.userName === userName ? `flex` : `hidden`
                        } ${
                          editingCommentId === comment._id && `hidden`
                        } text-blue-600  max-w-xs:text-sm cursor-pointer hover:underline`}
                        onClick={() => {
                          setEditingCommentId(comment._id);
                          setEditedComment(comment.comment);
                        }}
                      >
                        Edit
                      </p>
                    </div>
                  </div>
                  {/* //replay// */}
                  {comment.replies?.length > 0 && (
                    <div className="mt-2 ml-4">
                      {comment.replies.map((reply, i) => (
                        <div key={i} className="flex mb-1 justify-end">
                          <div className="p-2 bg-yellow-100 rounded-lg shadow-sm max-w-md text-right">
                            <p className="font-semibold text-sm">
                              {reply.userName}
                            </p>
                            <p className="text-sm">{reply.reply}</p>
                            <div className="flex justify-between text-blue-600">
                              <p
                                className={`${
                                  comment.userName === userName ||
                                  role === "ADMIN" ||
                                  role === "AUTHOR"
                                    ? `flex`
                                    : `hidden`
                                } justify-between  max-w-xs:text-sm text-blue-600 cursor-pointer hover:underline`}
                                onClick={() =>
                                  DeleteReplay(reply._id, comment._id)
                                }
                              >
                                Delete
                              </p>
                            </div>
                            <span className="text-gray-500  max-w-xs:text-sm text-xs">
                              {new Date(reply.createdAt).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={endOfCommentsRef} />
        </div>
      )}
      {/* // Comment input/// */}
      <form
        onSubmit={handleCommentSubmit}
        className="mt-4 flex sticky bottom-4 "
      >
        {replyingTo !== null && (
          <div className="flex  max-w-xs:text-sm  absolute top-[-32px] justify-between  w-full rounded-t-lg p-1  shadow-sm dark:bg-gray-800 bg-slate-100">
            <p>replay To message </p>
            <span
              className="hover:text-red-500 cursor-pointer"
              onClick={() => setReplyingTo(null)}
            >
              cancel
            </span>
          </div>
        )}
        <input
          type="text"
          id="text"
          placeholder={
            replyingTo !== null ? "Reply to comment..." : "New comment..."
          }
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          className="flex-1  max-w-xs:text-sm p-2 border border-gray-300 bg-white dark:bg-[#18212F] rounded-md focus:outline-none"
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2  max-w-xs:text-sm bg-blue-500 text-white  rounded-md"
        >
          Send
        </button>
      </form>
    </div>
  );
}

export default CommentCard;
