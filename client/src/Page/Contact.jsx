import { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import Layout from "../layout/layout";
import { AiOutlineArrowLeft } from "react-icons/ai";
import FeedbackForm from "../Components/feedbackfrom";
import FeedbackList from "../Components/feedbackList";
import { isEmail, isPhoneNumber } from "../helper/regexMatch";
import { SendMassage } from "../Redux/Slice/feedbackSlice";

function Contact() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    number: "",
    email: "",
    message: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    document.getElementById(name).style.borderColor = "";
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !isEmail(formData.email)) {
      document.getElementById("email").style.borderColor = "red";
      return;
    }
    if (!formData.number || !isPhoneNumber(formData.number)) {
      document.getElementById("number").style.borderColor = "red";
      return;
    }
    if (!formData.message) {
      document.getElementById("message").style.borderColor = "red";
      return;
    }
    setLoading(true);
    await dispatch(SendMassage(formData));
    setFormData({ number: "", email: "", message: "" });
    setLoading(false);
  };

  return (
    <Layout>
      <div className="w-full min-h-[80vh] max-w-xs:pt-[10px] mt-16 sm:mt-24 dark:bg-gray-900 pb-10">
        <div className="flex flex-col items-center w-full px-4">
          <h3 className="text-3xl max-w-xs:text-2xl font-extrabold text-center dark:text-white text-gray-800">
            How Can We Help You?
          </h3>
          <p className="text-gray-600 dark:text-gray-300 text-lg text-center mt-2 max-w-xl">
            Feel free to reach out to us! We'll get back to you within 24 hours.
          </p>
          <div className="bg-white dark:bg-gray-800 shadow-lg rounded-lg p-6 mt-8 w-full sm:w-2/3 lg:w-1/2">
            <header className="flex items-center gap-10 mb-6">
              <button
                onClick={() => navigate(-1)}
                className="text-gray-600 dark:text-gray-300 hover:text-blue-500 transition"
              >
                <AiOutlineArrowLeft className="text-2xl" />
              </button>
              <h1 className="text-xl font-semibold text-gray-800 dark:text-white">
                Contact Us
              </h1>
            </header>
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label
                  htmlFor="number"
                  className="block text-lg font-medium text-gray-700 dark:text-gray-300"
                >
                  Phone Number
                </label>
                <input
                  type="number"
                  name="number"
                  id="number"
                  value={formData.number}
                  onChange={handleInputChange}
                  placeholder="Enter your phone number"
                  className="w-full px-4 bg-white py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="email"
                  className="block text-lg  font-medium text-gray-700 dark:text-gray-300"
                >
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  id="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Enter your email"
                  className="w-full px-4 py-2 border bg-white border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
              <div className="mb-4">
                <label
                  htmlFor="message"
                  className="block text-lg font-medium text-gray-700 dark:text-gray-300"
                >
                  Your Message
                </label>
                <textarea
                  name="message"
                  id="message"
                  value={formData.message}
                  onChange={handleInputChange}
                  placeholder="Write your message here..."
                  className="w-full h-36 px-4 py-2 border border-gray-300 dark:border-gray-600 bg-white rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:text-white resize-none"
                ></textarea>
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-700 transition"
              >
                {loading ? "Sending..." : "Submit"}
              </button>
            </form>
          </div>
        </div>
        <div className="mt-10 px-4">
          <hr className="mb-8 border-gray-200 dark:border-gray-600" />
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white mb-6">
            Feedback Section
          </h1>
          <FeedbackForm />
          <FeedbackList />
        </div>
      </div>
    </Layout>
  );
}

export default Contact;
