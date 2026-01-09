import React, { useState } from "react";

function ProductGallery({ images }) {
  const [activeImage, setActiveImage] = useState(0);

  return (
    <div className="relative">
      <div className="aspect-square overflow-hidden">
        <img
          src={images[activeImage]?.secure_url}
          alt="Product view"
          className="w-full h-full object-contain"
        />
      </div>
      <div className="absolute bottom-4 left-4 right-4">
        <div className="flex gap-2 justify-center p-2 bg-white/80 backdrop-blur rounded-xl">
          {images.map((image, index) => (
            <button
              key={index}
              onClick={() => setActiveImage(index)}
              className={`w-16 h-16 rounded-lg overflow-hidden transition-all ${
                activeImage === index
                  ? "ring-2 ring-blue-500"
                  : "ring-1 ring-gray-200"
              }`}
            >
              <img
                src={image?.secure_url}
                alt={`Thumbnail ${index + 1}`}
                className="w-full h-full object-contain"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProductGallery;
