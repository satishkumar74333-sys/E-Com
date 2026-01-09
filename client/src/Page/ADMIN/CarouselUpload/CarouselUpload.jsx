import { useNavigate } from "react-router-dom";

import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useDispatch } from "react-redux";
import { FiEdit } from "react-icons/fi";
import Layout from "../../../layout/layout";
import LoadingButton from "../../../constants/LoadingBtn";
import { AddNewCarousel } from "../../../Redux/Slice/CarouselSlice";

function CarouselUpload() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [previewImages, setPreviewImages] = useState("");
  const [loading, setLoading] = useState(false);
  const [showLoading, setShowLoading] = useState(false);

  const [CarouselUpData, setCarouselUpData] = useState({
    name: "",
    description: "",
    images: "",
  });

  useEffect(() => {
    if (showLoading) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showLoading]);

  const handelImageInput = (e) => {
    e.preventDefault();
    const image = e.target.files[0];

    setCarouselUpData({
      ...CarouselUpData,
      images: image,
    });
    const fileReader = new FileReader();
    fileReader.readAsDataURL(image);
    fileReader.addEventListener("load", function () {
      setPreviewImages(this.result);
    });
  };

  const handelUserInput = (e) => {
    e.preventDefault();
    const { name, value } = e.target;
    setCarouselUpData({
      ...CarouselUpData,
      [name]: value,
    });
  };

  const handleCreate = async (event) => {
    event.preventDefault();
    setLoading(true);

    // Validate form fields and image count
    if (
      !CarouselUpData.name ||
      !CarouselUpData.description ||
      CarouselUpData.images.length < 1 ||
      CarouselUpData.images.length > 1
    ) {
      setLoading(false);
      toast.error("All fields are required. Ensure you upload image 1");
      return;
    }

    if (CarouselUpData.name.length < 5) {
      setLoading(false);
      toast.error("Product name should be at least 5 characters.");
      return;
    }
    if (CarouselUpData.price < 1) {
      setLoading(false);
      toast.error("Product price should be at least 1 Rupee.");
      return;
    }
    const formData = new FormData();
    formData.append("name", CarouselUpData.name);
    formData.append("description", CarouselUpData.description);

    formData.append("images", CarouselUpData.images);

    const response = await dispatch(AddNewCarousel(formData));
    if (response) {
      setShowLoading(false);
      setLoading(false);
    }

    if (response?.payload?.success) {
      setLoading(false);
      navigate("/CarouselUpdate");
      setCarouselUpData({
        name: "",
        price: "",
        description: "",
        images: [],
      });
      setPreviewImages([]);
    }
  };

  return (
    <Layout>
      <div className="w-full">
        <div className="relative justify-center flex items-center">
          <div className="bg-white dark:bg-[#111827] mt-44 mb-10 w-[400px]  max-w-xs:w-[95%] rounded-lg shadow-[0_0_5px_black] p-8">
            {showLoading && (
              <div
                className={`flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 ${
                  loading ? "fixed inset-0 bg-black bg-opacity-30 z-10" : ""
                }`}
              >
                <div className="loader border-t-4 border-blue-500 rounded-full w-12 h-12 animate-spin"></div>
                <p>
                  {loading
                    ? "Please wait, product is uploading..."
                    : "Loading..."}
                </p>
              </div>
            )}
            <>
              <h1 className="text-center max-w-xs:text-2xl   text-3xl font-semibold mb-6 text-[#9e6748]">
                Add Carousel
              </h1>
              <form>
                {/* File Input for Images */}
                <label
                  htmlFor="image_uploads"
                  className="cursor-pointer justify-center flex"
                >
                  {previewImages ? (
                    <div className="flex justify-center">
                      <img
                        src={previewImages}
                        alt="preview"
                        className="h-44 w-44 max-w-xs:h-20   object-contain bg-white dark:bg-[#111827] "
                      />
                    </div>
                  ) : (
                    <FiEdit className=" h-44 w-44   max-w-xs:h-20" />
                  )}
                </label>
                <input
                  type="file"
                  onChange={handelImageInput}
                  className="hidden"
                  name="image_uploads"
                  id="image_uploads"
                  accept=".png,.svg,.jpeg,.jpg,.*"
                />

                {/* Carousel Name */}
                <div className="relative mb-6 mt-5">
                  <input
                    type="text"
                    onChange={handelUserInput}
                    value={CarouselUpData.name}
                    name="name"
                    required
                    className="peer w-full border-b-2 border-gray-300 focus:outline-none focus:border-blue-500 py-2 text-lg bg-transparent"
                  />
                  {CarouselUpData.name ? (
                    <label className="absolute left-0 top-[-20px] text-sm text-gray-500">
                      Carousel Name
                    </label>
                  ) : (
                    <label className="absolute left-0 top-2 text-lg text-gray-500 peer-placeholder-shown:top-2 peer-placeholder-shown:text-lg peer-focus:top-[-20px] peer-focus:text-sm">
                      Carousel Name
                    </label>
                  )}
                </div>

                {/* Carousel Description */}
                <div className="relative mb-6">
                  <textarea
                    onChange={handelUserInput}
                    value={CarouselUpData.description}
                    name="description"
                    required
                    className="peer resize-none overflow-y-auto h-[250px] w-full pl-2 border-2 border-gray-300 focus:outline-none focus:border-blue-500 py-2 text-lg bg-transparent"
                  />
                  {CarouselUpData.description ? (
                    <label className="absolute left-0 pl-2 top-[-20px] text-sm text-gray-500">
                      Carousel Description
                    </label>
                  ) : (
                    <label className="absolute left-0 pl-2 top-2 text-lg text-gray-500 peer-placeholder-shown:top-2 peer-placeholder-shown:text-lg peer-focus:top-[-20px] peer-focus:text-sm">
                      Carousel Description
                    </label>
                  )}
                </div>

                {/* Submit Button */}
                <div onClick={handleCreate}>
                  <LoadingButton
                    textSize={"py-2"}
                    loading={loading}
                    color={"bg-green-600"}
                    message={"Loading..."}
                    name={"Add Carousel"}
                  />
                </div>
              </form>
            </>
          </div>
        </div>
      </div>
    </Layout>
  );
}

export default CarouselUpload;
