import { useDispatch, useSelector } from "react-redux";
import { DeleteProduct } from "../Redux/Slice/ProductSlice";
import { useState } from "react";

const ProductDelete = ({ productId }) => {
  const { product } = useSelector((state) => state.product);
  const [productList, setProductList] = useState(product);
  const dispatch = useDispatch();

  const handleDelete = () => {
    const updatedProducts = productList.filter(
      (product) => product._id !== productId
    );
    setProductList(updatedProducts);
    dispatch(DeleteProduct(productId));
  };

  return <button onClick={handleDelete}>Delete</button>;
};
export default ProductDelete;
