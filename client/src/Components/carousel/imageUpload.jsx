import { useState } from "react";
import { PhotoIcon } from "@heroicons/react/24/solid";

export function ImageUpload({ onImageSelect, images }) {
  const [preview, setPreview] = useState(images);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result);
        onImageSelect(file);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Image
      </label>
      <div className="flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
        <div className="space-y-1 text-center">
          {!preview && (
            <PhotoIcon className="mx-auto h-12 w-12 text-gray-400" />
          )}
          {preview && (
            <div className="mt-4">
              <img
                crossOrigin="anonymous"
                src={preview}
                alt="Preview"
                className="h-32 w-auto mx-auto"
              />
            </div>
          )}
          <div className="flex text-sm  justify-center text-gray-600">
            <label className="relative  dark:bg-[#111827] cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
              <span>Upload a file</span>
              <input
                type="file"
                className="hidden"
                onChange={handleFileChange}
                accept="image/*"
              />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}
