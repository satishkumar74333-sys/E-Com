import React, { useState, useEffect } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useDispatch } from "react-redux";
import Layout from "../../layout/layout";
import { changePassword } from "../../Redux/Slice/authSlice";
import { AiOutlineArrowLeft } from "react-icons/ai";
const ChangePassword = () => {
  const dispatch = useDispatch();
  const [error, setError] = useState(false);
  const [passwordData, setPasswordData] = useState({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [successMessage, setSuccessMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handelUserInput = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setPasswordData({ ...passwordData, [name]: value });
    document.getElementById(name).style.borderColor = "";
    if (name == "oldPassword") {
      document.getElementById("oldPassword").previousElementSibling.innerHTML =
        "Password";
    }
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(false);

    // Validate the passwords
    if (!passwordData.oldPassword) {
      document.getElementById("oldPassword").style.borderColor = "red";
      return;
    }
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
    setError();
    const res = await dispatch(
      changePassword({
        oldPassword: passwordData.oldPassword,
        newPassword: passwordData.newPassword,
      })
    );

    setLoading(false);
    if (res?.payload?.success) {
      setSuccessMessage("password Successfully changed..");
      setTimeout(() => {
        navigate(-1);
      }, 2000);
    }
    if (res?.payload?.message == "password does not match...") {
      document.getElementById("oldPassword").style.borderColor = "red";
      document.getElementById("oldPassword").previousElementSibling.innerHTML =
        "password does not match...";
    }
  };

  return (
    <Layout>
      <div className=" flex h-screen">
        <div className=" my-auto m-auto sm:w-[60%] w-[90%]  max-w-md p-6  border rounded-md shadow-md">
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
                htmlFor="oldPassword"
                className="block text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                type="password"
                name="oldPassword"
                id="oldPassword"
                className="mt-1 p-2 w-full border bg-white dark:bg-gray-900 dark:text-white border-gray-300 rounded-md"
                value={passwordData.oldPassword}
                onChange={handelUserInput}
                required
              />
            </div>
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
                className="mt-1 p-2 w-full border  bg-white dark:bg-gray-900 dark:text-white border-gray-300 rounded-md"
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
                className="mt-1 p-2 w-full border  bg-white dark:bg-gray-900 dark:text-white border-gray-300 rounded-md"
                value={passwordData.confirmPassword}
                onChange={handelUserInput}
                required
              />
            </div>

            <div className="mb-6">
              <button
                type="submit"
                className="w-full bg-blue-500 text-white p-2 rounded-md disabled:bg-gray-400"
                disabled={loading}
              >
                {loading ? "Updating..." : "Update Password"}
              </button>
            </div>
            <Link
              to="/Profile"
              className=" text-blue-600 pl-1 mt-1  text-center flex justify-center items-center gap-4"
            >
              <AiOutlineArrowLeft /> Go back
            </Link>
          </form>
        </div>
      </div>
    </Layout>
  );
};

export default ChangePassword;
