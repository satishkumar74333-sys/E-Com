import { useEffect, useState } from "react";
import { ImageUpload } from "./imageUpload";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { useDispatch } from "react-redux";
import { updateCarousel } from "../../Redux/Slice/CarouselSlice";

export const EditModal = ({ slide, onClose, onSave }) => {
  const dispatch = useDispatch();
  const [name, setName] = useState(slide.name);
  const [description, setDescription] = useState(slide.description);
  const [images, setImage] = useState(slide?.images[0].secure_url);
  const [loading, setLoading] = useState(false);
  const handleSubmit = async (e) => {
    setLoading(true);
    e.preventDefault();

    const formData = new FormData();

    formData.append("name", name);
    formData.append("description", description);
    formData.append("images", images);
    const res = await dispatch(
      updateCarousel({ data: formData, id: slide._id })
    );
    if (res?.payload?.success) {
      onSave(res?.payload?.data);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-[#111827] rounded-lg p-6 w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Edit Slide</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <XMarkIcon className="h-6 w-6 text-gray-600 dark:text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Title
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md dark:bg-[#111827]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2 ">
              description
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-white px-3 py-2 border border-gray-300 rounded-md dark:bg-[#111827]"
            />
          </div>

          <ImageUpload onImageSelect={setImage} images={images} />

          <div className="mt-6 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
              {loading ? "Loading..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
