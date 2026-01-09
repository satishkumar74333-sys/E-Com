import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { ShopInformationSEt } from "../Redux/Slice/authSlice";
import { getShopInfo } from "../Redux/Slice/shopInfoSlice";

const ShopInformationForm = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(false);
  const { phoneNumber, email, address, instagram, youtube, facebook } =
    useSelector((state) => state?.ShopInfo);
  const [formData, setFormData] = useState({
    phoneNumber: "",
    email: "",
    address: "",
    instagram: "",
    facebook: "",
    youtube: "",
  });

  useEffect(() => {
    setFormData({
      ...formData,
      phoneNumber: phoneNumber || "",
      email: email || "",
      address: address || "",
      instagram: instagram || "",
      facebook: facebook || "",
      youtube: youtube || "",
    });
  }, []);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");

    if (!formData.phoneNumber || !formData.email || !formData.address) {
      setError("Phone Number, Email, and Address are required.");
      return;
    }

    try {
      setLoading(true);
      const response = await dispatch(ShopInformationSEt(formData));
      setLoading(false);
      if (response.payload.success) {
        await dispatch(getShopInfo());
        setMessage(
          response.payload.message || "Shop information updated successfully!"
        );
      } else {
        setError(
          response.payload.message || "Failed to update shop information."
        );
      }
    } catch (err) {
      setError(
        err.response?.data?.message || "An error occurred. Please try again."
      );
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 mb-2 bg-white rounded shadow-md dark:bg-gray-800">
      <h2 className="text-2xl font-bold mb-4 text-center text-gray-700 dark:text-white">
        Shop Information
      </h2>
      {error && <div className="text-red-500 mb-4">{error}</div>}
      {message && <div className="text-green-500 mb-4">{message}</div>}
      <form onSubmit={handleSubmit}>
        {/* Phone Number */}
        <div className="mb-4">
          <label
            htmlFor="phoneNumber"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Phone Number
          </label>
          <input
            type="text"
            id="phoneNumber"
            name="phoneNumber"
            value={formData.phoneNumber}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            placeholder="Enter phone number"
            required
          />
        </div>

        {/* Email */}
        <div className="mb-4">
          <label
            htmlFor="email"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            placeholder="Enter email"
            required
          />
        </div>

        {/* Address */}
        <div className="mb-4">
          <label
            htmlFor="address"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Address
          </label>
          <textarea
            id="address"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            placeholder="Enter address"
            rows="3"
            required
          ></textarea>
        </div>

        {/* Instagram */}
        <div className="mb-4">
          <label
            htmlFor="instagram"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Instagram Link
          </label>
          <input
            type="url"
            id="instagram"
            name="instagram"
            value={formData.instagram}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            placeholder="Enter Instagram link"
          />
        </div>

        {/* Facebook */}
        <div className="mb-4">
          <label
            htmlFor="facebook"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            Facebook Link
          </label>
          <input
            type="url"
            id="facebook"
            name="facebook"
            value={formData.facebook}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            placeholder="Enter Facebook link"
          />
        </div>

        {/* YouTube */}
        <div className="mb-4">
          <label
            htmlFor="youtube"
            className="block text-sm font-medium text-gray-700 dark:text-gray-200"
          >
            YouTube Link
          </label>
          <input
            type="url"
            id="youtube"
            name="youtube"
            value={formData.youtube}
            onChange={handleChange}
            className="w-full mt-1 p-2 border rounded bg-white dark:bg-gray-900 dark:border-gray-700 dark:text-white"
            placeholder="Enter YouTube link"
          />
        </div>

        <button
          disabled={loading}
          type="submit"
          className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {loading ? "Updating..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default ShopInformationForm;
