export const Images = ({ images }) => {
  console.log(images?.length);
  return (
    <div className="flex">
      {images?.length > 0 &&
        images?.map((productImage, index) => {
          return (
            <img
              crossOrigin="anonymous"
              key={index}
              src={productImage.secure_url}
              alt="images"
              className="w-40 h-40 object-contain rounded-sm shadow-sm"
            />
          );
        })}
    </div>
  );
};
