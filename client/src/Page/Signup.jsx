import { Link, useNavigate } from "react-router-dom";
import Footer from "../Components/footer";
import { BsPersonCircle } from "react-icons/bs";
import { useEffect, useState } from "react";
import Layout from "../layout/layout";
import LoadingButton from "../constants/LoadingBtn";
import toast from "react-hot-toast";
import {
  isEmail,
  isPhoneNumber,
  isUserName,
  isValidPassword,
} from "../helper/regexMatch";
import { useDispatch, useSelector } from "react-redux";
import { CreateAccount } from "../Redux/Slice/authSlice";
import { EyeIcon, EyeOffIcon } from "lucide-react";

function SignUp() {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { email } = useSelector((state) => state?.ShopInfo);
  const [previewImage, setPreviewImage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [Error, setError] = useState(false);
  const [SignUpData, setSignUpData] = useState({
    fullName: "",
    userName: "",
    phoneNumber: "",
    email: "",
    avatar: "",
    password: "",
    ConfirmPassword: "",
    Email: "",
  });
  useEffect(() => {
    setSignUpData({
      ...SignUpData,
      Email: email || "ksgdoors123@gmail.com",
    });
  }, []);

  const handelImageInput = (e) => {
    e.preventDefault();

    const image = e.target.files[0];
    if (image) {
      setSignUpData({
        ...SignUpData,
        avatar: image,
      });
    }

    const fileReader = new FileReader();
    if (!image) return;
    fileReader.readAsDataURL(image);
    fileReader.addEventListener("load", function () {
      setPreviewImage(this.result);
    });
  };

  const handelUserInput = (e) => {
    e.preventDefault();
    setError(false);
    const { name, value } = e.target;
    setSignUpData({
      ...SignUpData,
      [name]: value,
    });

    document.getElementById(name).style.borderColor = "";
    if (name === "password") {
      document.getElementById("password").style.borderColor = "";

      document.getElementById("ConfirmPassword").style.borderColor = "";
    }
    if (name === "ConfirmPassword") {
      document.getElementById("password").style.borderColor = "";

      document.getElementById("ConfirmPassword").style.borderColor = "";
    }
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setLoading(true);

    if (!SignUpData.avatar) {
      setLoading(false);
      document.getElementById("Image_icon").nextElementSibling.style.color =
        "red";
      document.getElementById("Image_icon").style.borderColor = "red";

      return;
    }
    if (SignUpData.fullName.length < 5) {
      setLoading(false);
      document.getElementById("fullName").style.borderColor = "red";

      return;
    }
    if (!isEmail(SignUpData.email)) {
      setLoading(false);
      document.getElementById("email").style.borderColor = "red";

      return;
    }
    if (!isValidPassword(SignUpData.password)) {
      setLoading(false);
      document.getElementById("password").style.borderColor = "red";

      return;
    }
    if (!isPhoneNumber(SignUpData.phoneNumber)) {
      setLoading(false);
      document.getElementById("phoneNumber").style.borderColor = "red";

      return;
    }
    if (!isUserName(SignUpData.userName)) {
      setLoading(false);
      document.getElementById("userName").style.borderColor = "red";

      return;
    }

    if (SignUpData.password !== SignUpData.ConfirmPassword) {
      setLoading(false);
      document.getElementById("password").style.borderColor = "red";

      document.getElementById("ConfirmPassword").style.borderColor = "red";

      return;
    }
    setShowLoading(true);
    const formData = new FormData();
    formData.append("fullName", SignUpData.fullName);
    formData.append("email", SignUpData.email);
    formData.append("Email", SignUpData.Email);
    formData.append("userName", SignUpData.userName);
    formData.append("phoneNumber", SignUpData.phoneNumber);
    formData.append("avatar", SignUpData.avatar);
    formData.append("password", SignUpData.password);
    const response = await dispatch(CreateAccount(formData));
    if (response) {
      setLoading(false);
      setShowLoading(false);
    }
    if (!response?.payload?.success) {
      setError(response?.payload?.message);
      if (response?.payload?.message == "Username already exists") {
        document.getElementById("userName").style.borderColor = "red";
      }
      if (response?.payload?.message == "Email already exists") {
        document.getElementById("email").style.borderColor = "red";
      }
    }
    if (response?.payload?.success) {
      setLoading(false);
      navigate("/");
      setSignUpData({
        fullName: "",
        userName: "",
        phoneNumber: "",
        email: "",
        avatar: "",
        password: "",
      });
      setPreviewImage("");
    }
  };

  return (
    <Layout>
      <div className="flex justify-center items-center min-h-screen bg-gray-100 dark:bg-gray-900 p-6">
        {showLoading && (
          <div
            className="flex flex-col items-center justify-center min-h-screen bg-gray-100  dark:bg-gray-900 
          fixed inset-0  bg-opacity-30 z-10
          "
          >
            <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
            <p>Please wait, Creating your account ...</p>
          </div>
        )}
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg w-full max-w-md">
          <h1 className=" max-w-xs:text-xl text-2xl font-bold text-center text-gray-700 dark:text-gray-200 mb-6">
            Sign Up
          </h1>
          <form onSubmit={handleCreate}>
            {Error && (
              <p id="Error" className="text-sm text-red-500 pb-5">
                {Error}
              </p>
            )}
            <label
              htmlFor="image_uploads"
              className="block  text-center mb-4 cursor-pointer"
            >
              {previewImage ? (
                <img
                  src={previewImage}
                  className="w-24 h-24 max-w-xs:w-20 max-w-xs:h-20 rounded-full mx-auto"
                  alt="Profile"
                />
              ) : (
                <BsPersonCircle
                  id="Image_icon"
                  className="w-24  border max-w-xs:w-20 max-w-xs:h-20  rounded-full h-24  mx-auto text-gray-500 dark:text-gray-300"
                />
              )}
              <span className="block  max-w-xs:text-sm text-gray-500 dark:text-gray-300 mt-2">
                Upload Image
              </span>
            </label>
            <input
              type="file"
              onChange={handelImageInput}
              className="hidden"
              id="image_uploads"
              accept=".png, .jpeg, .jpg"
            />

            {["userName", "fullName", "email", "phoneNumber"].map((field) => (
              <div className="mb-4" key={field}>
                <input
                  id={field}
                  type={field === "email" ? "email" : "text"}
                  name={field}
                  value={setSignUpData[field]}
                  onChange={handelUserInput}
                  placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
                  className="w-full p-3 border bg-white max-w-xs:text-sm rounded-md dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
            ))}

            <div className="mb-4 relative">
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                id="password"
                value={setSignUpData.password}
                onChange={handelUserInput}
                placeholder="Password"
                className="w-full p-3 border max-w-xs:text-sm bg-white rounded-md dark:bg-gray-700 dark:text-gray-200"
              />
              <div
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                onClick={() => setShowPassword((prev) => !prev)}
              >
                {showPassword ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>
            <div className="mb-6 relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="ConfirmPassword"
                id="ConfirmPassword"
                value={setSignUpData.ConfirmPassword}
                onChange={handelUserInput}
                placeholder="Confirm Password"
                className="w-full p-3 border max-w-xs:text-sm bg-white rounded-md dark:bg-gray-700 dark:text-gray-200 pr-10"
              />
              <div
                className="absolute inset-y-0 right-3 flex items-center cursor-pointer"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                {showConfirmPassword ? (
                  <EyeOffIcon className="h-5 w-5 text-gray-500" />
                ) : (
                  <EyeIcon className="h-5 w-5 text-gray-500" />
                )}
              </div>
            </div>

            <LoadingButton
              textSize={"py-2"}
              loading={loading}
              message={"Loading"}
              name={"Sign Up"}
              color={"bg-green-500 hover:bg-green-600 "}
            />

            <p className="text-center max-w-xs:text-sm text-gray-600 dark:text-gray-300 mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-500 hover:underline">
                Login
              </Link>
            </p>
          </form>
        </div>
      </div>
    </Layout>
  );
}

export default SignUp;
