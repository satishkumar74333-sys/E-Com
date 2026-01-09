import { useEffect, useState } from "react";

export const ProductCarouselImages = ({ data }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  return (
    <div id="default-carousel" className="relative w-full ">
      {/* Carousel Wrapper */}
      <div className="relative h-56 md:h-96 overflow-hidden rounded-lg">
        {data.map((item, index) => (
          <div
            key={index}
            className={`absolute w-full h-full flex justify-center items-center transition-opacity duration-700 ease-in-out ${
              index === currentIndex ? "opacity-100" : "opacity-0"
            }`}
          >
            
            <img
              src={item.secure_url}
              className="w-full  h-full absolute object-contain "
              alt={`Slide ${index + 1}`}
            />
          </div>
        ))}
      </div>

      {/* Indicators */}
      <div className="absolute z-30 flex -translate-x-1/2 bottom-5 left-1/2 space-x-3">
        {data.map((_, index) => (
          <button
            key={index}
            className={`w-3 h-3 rounded-full transition-all ${
              index === currentIndex ? "bg-gray-800 scale-125" : "bg-gray-400"
            }`}
            onClick={() => setCurrentIndex(index)}
          ></button>
        ))}
      </div>

      {/* Previous Button */}
      <button
        className="absolute top-0 left-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer"
        onClick={() =>
          setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? data.length - 1 : prevIndex - 1
          )
        }
      >
        ❮
      </button>

      {/* Next Button */}
      <button
        className="absolute top-0 right-0 z-30 flex items-center justify-center h-full px-4 cursor-pointer"
        onClick={() =>
          setCurrentIndex((prevIndex) =>
            prevIndex === data.length - 1 ? 0 : prevIndex + 1
          )
        }
      >
        ❯
      </button>
    </div>
  );
};
