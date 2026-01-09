import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import { checkToken, UpdateNewPassword } from "../../Redux/Slice/authSlice";
const UpdatePassword = () => {
  const dispatch = useDispatch();
  const [error, setError] = useState(false);
  const [resetToken, setResetToken] = useState("");
  const [checkLoading, setCheckLoading] = useState(true);
  const [passwordData, setPasswordData] = useState({
    newPassword: "",
    confirmPassword: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const { token } = useParams(); // Assuming the token is passed as a URL parameter
  const navigate = useNavigate();

  useEffect(() => {
    if (!token) {
      navigate("/error");
    }
    setResetToken(token);
  }, [token]);

  const handelUserInput = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    document.getElementById(name).style.borderColor = "";
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);
    // Validate the passwords
    if (!passwordData.newPassword) {
      document.getElementById("newPassword").style.borderColor = "red";
      return;
    }
    if (!passwordData.confirmPassword) {
      document.getElementById("confirmPassword").style.borderColor = "red";
      return;
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      document.getElementById("newPassword").style.borderColor = "red";
      document.getElementById("confirmPassword").style.borderColor = "red";
      return;
    }

    setLoading(true);
    const newPassword = passwordData.newPassword;
    const res = await dispatch(UpdateNewPassword({ resetToken, newPassword }));
    if (res?.payload?.success) {
      setSuccessMessage("password Successfully changed..");
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
    if (!res?.payload?.success) {
      setError("Error Token does not exit or expiry, please try again");
    }

    setLoading(false);
  };
  useEffect(() => {
    async function passwordTokenCheck() {
      const res = await dispatch(checkToken(resetToken));
      if (res?.payload == undefined) return;
      if (res?.payload?.success) {
        setCheckLoading(false);
        setError(false);
        return;
      }
      if (!res?.payload?.success) {
        setCheckLoading(false);

        setError("Error Token does not exit or expiry, please try again");
        return;
      }
      setCheckLoading(false);
    }
    if (checkLoading) {
      passwordTokenCheck();
    }
  }, [resetToken]);
  if (checkLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
        <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin">
          {" "}
        </div>
        Loading...
      </div>
    );
  }
  return (
    <div className=" flex h-screen">
      <div className=" my-auto m-auto sm:w-[60%] w-[90%] max-w-md p-6 bg-white border rounded-md shadow-md">
        <h2 className="text-xl font-semibold text-center mb-6">
          Reset Your Password
        </h2>

        {successMessage && (
          <p className="text-green-500 text-center mb-4">{successMessage}</p>
        )}
        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form noValidate onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              type="password"
              name="newPassword"
              id="newPassword"
              className="mt-1 p-2 w-full  bg-white border border-gray-300 rounded-md"
              value={passwordData.newPassword}
              onChange={handelUserInput}
              required
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700"
            >
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              id="confirmPassword"
              className="mt-1 p-2 w-full  bg-white border border-gray-300 rounded-md"
              value={passwordData.confirmPassword}
              onChange={handelUserInput}
              required
            />
          </div>

          <div className="mb-6">
            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded-md disabled:bg-gray-400"
              disabled={error || loading}
            >
              {loading ? "Updating..." : "Update Password"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdatePassword;
