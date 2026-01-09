import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { AiOutlineArrowLeft } from "react-icons/ai";
import { LoadAccount, UpdateAccount } from "../../Redux/Slice/authSlice";
import Layout from "../../layout/layout";
import LoadingButton from "../../constants/LoadingBtn";

function UpdateProfile() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const UserData = useSelector((state) => state?.auth?.data);

  const [profileData, setProfileData] = useState({
    fullName: "",
    phoneNumber: "",
    previewImage: "",
    avatar: "",
  });

  function handelImageInput(e) {
    e.preventDefault();
    const uploadedImage = e.target.files[0];
    if (uploadedImage) {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(uploadedImage);
      fileReader.addEventListener("load", function () {
        setProfileData({
          ...profileData,
          previewImage: this.result,
          avatar: uploadedImage,
        });
      });
    }
  }

  function handelUserInput(e) {
    const { name, value } = e.target;
    setProfileData({
      ...profileData,
      [name]: value,
    });
  }
  async function OnFormSubmit(event) {
    setLoading(true);
    event.preventDefault();
    if (!profileData.fullName) {
      toast.error("please enter your name");
      setLoading(false);
      return;
    }

    if (profileData.fullName.length < 5) {
      setLoading(false);
      toast.error("name should be atLeast 5 character");
      return;
    }

    const formData = new FormData();
    formData.append("fullName", profileData.fullName);
    formData.append("phoneNumber", profileData.phoneNumber);

    formData.append("avatar", profileData.avatar);

    const UpdateData = await dispatch(UpdateAccount(formData));
    setLoading(false);
    if (!UpdateData?.payload?.success) {
      toast.error("profile is not updated ,try again..");
      return;
    }

    const loadData = await dispatch(LoadAccount());
    if (loadData?.payload?.success) {
      setProfileData({
        fullName: "",
        previewImage: "",
        phoneNumber: "",
        avatar: "",
      });
      navigate("/Profile");
    }
  }

  return (
    <Layout>
      <div className="min-h-[90vh] flex flex-col justify-center items-center ">
        <form
          noValidate
          onSubmit={OnFormSubmit}
          className="flex flex-col  justify-center gap-3  rounded-lg p-4 dark:text-white text-black w-96  dark:shadow-[0_0_10px_white]  shadow-[0_0_10px_black] "
        >
          <h1 className="text-2xl text-center font-bold">Update Page</h1>
          <label htmlFor="image_uploads" className=" cursor-pointer">
            {profileData.previewImage ? (
              <div>
                <img
                  src={profileData.previewImage}
                  alt="user_image"
                  className="w-40 h-40 m-auto rounded-full border-2 border-black dark:border-white"
                />
              </div>
            ) : (
              <div>
                <img
                  src={UserData?.avatar?.secure_url}
                  alt="user_image"
                  className="w-40 m-auto h-40 rounded-full border-2 border-black dark:border-white"
                />
              </div>
            )}
          </label>
          <input
            onChange={handelImageInput}
            type="file"
            className="hidden "
            name="image_uploads"
            id="image_uploads"
            accept=".png ,.svg ,.jpeg ,.jpg"
          />
          <div className="flex flex-col gap-1">
            <label htmlFor="fullName">FullName</label>
            <input
              onChange={handelUserInput}
              value={profileData.fullName}
              type="text"
              name="fullName"
              required
              id="fullName"
              placeholder="Enter your Name.."
              className="px-2 py-4 bg-transparent border  "
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="fullName">PhoneNumber</label>
            <input
              onChange={handelUserInput}
              value={profileData.phoneNumber}
              type="number"
              name="phoneNumber"
              required
              id="phoneNumber"
              placeholder="Enter your phoneNumber.."
              className="px-2 py-4 bg-transparent border "
            />
          </div>
          <LoadingButton
            message={"Wait update profile"}
            loading={loading}
            name={"Change Profile"}
            textSize={"py-3"}
            color={"bg-green-500 hover:bg-green-600 "}
          />

          <Link
            to="/Profile"
            className=" text-blue-600 pl-1 mt-1  text-center flex justify-center items-center gap-4"
          >
            <AiOutlineArrowLeft /> Go back
          </Link>
        </form>
      </div>
    </Layout>
  );
}
export default UpdateProfile;
