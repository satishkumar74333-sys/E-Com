import { useState } from "react";
import { PhotoIcon } from "@heroicons/react/24/solid";

export function ImageUpload({ onImageSelect, initialImages = [] }) {
  const [images, setImages] = useState(initialImages);

  const handleFileChange = (e, index) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const updatedImages = [...images];
        updatedImages[index] = reader.result;
        setImages(updatedImages);
        onImageSelect(file, index);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="mt-4">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Upload Images
     
      </label>
      <div className="space-y-4">
        {images.map((image, index) => (
          <div key={index} className="flex flex-col items-center">
            <div className=" w-full flex flex-col justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
              {image ? (
                
                <img
                  crossOrigin="anonymous"
                  src={image.secure_url || image}
                  alt={`Preview ${index + 1}`}
                  className="h-20  object-contain"
                />
              ) : (
                <PhotoIcon className="h-12 w-12 text-gray-400" />
              )}
              <label className=" text-center text-blue-500 rounded-full p-1 cursor-pointer">
                <input
                  type="file"
                  className="hidden"
                  onChange={(e) => handleFileChange(e, index)}
                  accept="image/*"
                />
                Change image
              </label>
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={() => setImages([...images, null])} // Add a new empty slot
          className="mt-4 text-blue-500"
        >
          Add Image
        </button>
      </div>
    </div>
  );
}
