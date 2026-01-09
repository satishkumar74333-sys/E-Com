import { Link, useNavigate } from "react-router-dom";
import Footer from "../Components/footer";
import Layout from "../layout/layout";
import LoadingButton from "../constants/LoadingBtn";
import { useState } from "react";
import { useDispatch } from "react-redux";

import { LoginAccount } from "../Redux/Slice/authSlice";
import { useTheme } from "../Components/ThemeContext"; // Import dark mode context
import { isEmail } from "../helper/regexMatch";
import { EyeIcon, EyeOffIcon } from "lucide-react";

function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { darkMode } = useTheme(); // Access the dark mode state
  const [loading, setLoading] = useState(false);
  const [Error, setError] = useState(false);
  const [showLoading, setShowLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [LoginData, setLoginData] = useState({
    Email: "",
    password: "",
  });

  function handelUserInput(e) {
    e.preventDefault();
    setError(false);
    const { name, value } = e.target;
    setLoginData({
      ...LoginData,
      [name]: value,
    });
    document.getElementById(name).style.borderColor = "";
  }

  const handleLogin = async (event) => {
    event.preventDefault();

    setLoading(true);

    if (!LoginData.Email) {
      setLoading(false);
      document.getElementById("Email").style.borderColor = "red";

      return;
    }
    if (!isEmail(LoginData.Email)) {
      setLoading(false);
      document.getElementById("Email").style.borderColor = "red";
      return;
    }
    if (!LoginData.password) {
      setLoading(false);
      document.getElementById("password").style.borderColor = "red";

      return;
    }
    setShowLoading(true);
    const res = await dispatch(LoginAccount(LoginData));
    if (!res.payload?.success) {
      setError(res.payload?.message);
      if (res.payload?.message == "Email not found...") {
        document.getElementById("Email").style.borderColor = "red";
      }
      if (res.payload?.message == "password Does not match..") {
        document.getElementById("password").style.borderColor = "red";
      }
    }

    if (res) {
      setShowLoading(false);
      setLoading(false);
    }
    if (res?.payload?.success) {
      navigate("/");
      setLoginData({
        email: "",
        password: "",
      });
    }
  };

  return (
    <Layout>
      <div className="w-full relative sm:top-[-64px]">
        <div className="min-h-[80vh] justify-center flex items-center">
          <div
            className={` rounded-lg p-9  max-sm:m-9 shadow-[0_0_1px_black] mt-auto ${
              darkMode ? "bg-gray-800 text-white" : "bg-white text-black"
            }`}
          >
            {showLoading && (
              <div
                className={`flex  flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-800 ${
                  loading ? "fixed inset-0 bg-opacity-30 z-10" : ""
                }`}
              >
                <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
                <p>
                  {loading
                    ? "Please wait,  Login Your Account..."
                    : "Loading..."}
                </p>
              </div>
            )}
            <h1 className="text-center max-w-xs:text-2xl text-3xl font-semibold mb-6">
              LOGIN
            </h1>
            <form>
              {Error && (
                <p id="Error" className="text-sm text-red-500 pb-5">
                  {Error}
                </p>
              )}
              <div className="mb-4">
                <input
                  id="Email"
                  type="email"
                  name="Email"
                  value={setLoginData.Email}
                  onChange={handelUserInput}
                  placeholder="Enter your Register Email"
                  className="w-full p-3 border bg-white max-w-xs:text-sm rounded-md dark:bg-gray-700 dark:text-gray-200"
                />
              </div>
              <div className="mb-4 relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  id="password"
                  value={setLoginData.password}
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

              <div onClick={handleLogin}>
                <LoadingButton
                  textSize={"py-2"}
                  loading={loading}
                  message={"Loading"}
                  name={"Login"}
                  color={"bg-green-500 "}
                />
              </div>
              <p className=" max-w-xs:text-sm  text-right  my-2">
                <Link
                  to="/ForgetPassword"
                  className="  hover:text-blue-600 pl-1"
                >
                  Forget Password ?
                </Link>
              </p>
              <p className="mt-1 text-center max-w-sm:text-sm">
                Do not have an account?
                <Link to="/SignUp" className="link text-blue-600 pl-1">
                  SignUp
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default Login;
