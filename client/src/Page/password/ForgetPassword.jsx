import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isEmail } from "../../helper/regexMatch";
import { useDispatch } from "react-redux";
import { SendPasswordResatEmail } from "../../Redux/Slice/authSlice";

const ForgetPassword = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [success, setSuccess] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (!email) {
      document.getElementById("email").style.borderColor = "red";
      setLoading(false);
      return;
    }
    if (!isEmail(email)) {
      document.getElementById("email").style.borderColor = "red";
      setLoading(false);
      return;
    }
    const res = await dispatch(SendPasswordResatEmail(email));
    setLoading(false);
    if (res.payload?.success) {
      setSuccess(true);
      setMessage("A password reset link has been sent to your email.");
      setEmail("");
      return;
    }
    setSuccess(false);
    setMessage("Something went wrong,please try text Time..");
    setEmail("");
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-8 w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-gray-800 dark:text-white">
          Forgot Password
        </h2>
        <p className="text-gray-600 dark:text-gray-300 text-center mb-4">
          Enter your email address and we'll send you a reset link.
        </p>
        <form noValidate onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-gray-700 dark:text-gray-300 font-medium mb-2"
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              className="w-full px-4 py-2 border  bg-white rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => (
                setEmail(e.target.value),
                (document.getElementById("email").style.borderColor = "")
              )}
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-300"
          >
            {loading ? "Sending..." : "Send Reset Link"}
          </button>
        </form>
        {message && (
          <p
            className={`mt-4 ${
              success ? "text-green-500" : "text-red-500"
            }  text-center font-medium`}
          >
            {message}
          </p>
        )}
        <div onClick={() => navigate(-1)} className="mt-6 text-center">
          <a
            href="/login"
            className="text-blue-500 hover:underline dark:text-blue-400"
          >
            Back to Login
          </a>
        </div>
      </div>
    </div>
  );
};

export default ForgetPassword;
