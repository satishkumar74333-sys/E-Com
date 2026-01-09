import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/solid";
import { ImageUpload } from "./imageUpload";
import { Category } from "./categoryData";
import { FaPlus } from "react-icons/fa6";
import { useSelector } from "react-redux";

export const EditModal = ({ slide, onClose, onSave }) => {
  const [name, setName] = useState(slide.name);
  const [description, setDescription] = useState(slide.description);
  const [discount, setDiscount] = useState(slide?.discount || 0);
  const [stock, setStock] = useState(slide?.stock);
  const [gst, setGst] = useState(slide?.gst || 0);
  const [category, setCategory] = useState(slide?.category || "");
  const [price, setPrice] = useState(slide.price);
  const [showCategoryForm, setShowCategoryForm] = useState(false);
  const [images, setImages] = useState(slide.images || []);
  const [newImages, setNewImages] = useState([]);
  const { CategoryList } = useSelector((state) => state?.Category);
  const [categories, setCategories] = useState([
    "Sofas",
    "Coffee Tables",
    "TV Units",
    "Recliners",
    "Bookshelves",
    "Beds",
    "Wardrobes",
    "Nightstands",
    "Dresser",
    "Mattresses",
    "Dining Tables",
    "Chairs",
    "Buffet Tables",
    "Bar Stools",
    "Sideboards",
    "Office Desks",
    "Chairs",
    "Shelves",
    "Filing Cabinets",
    "Conference Tables",
    "Kitchen Cabinets",
    "Kitchen Islands",
    "Bar Stools",
    "Dish Racks",
    "Pantry Shelves",
    "Vanities",
    "Shower Units",
    "Bathroom Cabinets",
    "Toilet Roll Holders",
    "Towel Racks",
    "Outdoor Sofas",
    "Outdoor Tables",
    "Garden Chairs",
    "Hammocks",
    "Patio Umbrellas",
    "Storage Bins",
    "Shelving Units",
    "Closet Organizers",
    "Storage Cabinets",
    "Garage Storage",
    "Ceiling Lights",
    "Floor Lamps",
    "Wall Sconces",
    "Table Lamps",
    "Pendant Lights",
    "Rugs",
    "Curtains",
    "Wall Art",
    "Throw Pillows",
    "Mirrors",
    "Desk Organizers",
    "Office Chairs",
    "Monitor Stands",
    "Lamps",
    "Keyboard Trays",
    "Coat Racks",
    "Shoe Racks",
    "Console Tables",
    "Doormats",
    "Wall Hooks",
    "Bunk Beds",
    "Toy Storage",
    "Kids Desks",
    "Toy Boxes",
    "Bookshelves",
    "Hallway Tables",
    "Mirrors",
    "Shoe Cabinets",
    "Wall Hooks",
    "Rugs",
    "Laundry Baskets",
    "Ironing Boards",
    "Drying Racks",
    "Laundry Cabinets",
    "Washing Machine Stands",
    "Pet Beds",
    "Pet Houses",
    "Pet Stairs",
    "Pet Crates",
    "Pet Feeding Stations",
    "Smart Lights",
    "Smart Thermostats",
    "Smart Plugs",
    "Smart Speakers",
    "Smart Cameras",
    "Planters",
    "Garden Tools",
    "Garden Benches",
    "Fountains",
    "Flower Pots",
    "Memory Foam",
    "Innerspring",
    "Hybrid",
    "Adjustable",
    "Kids Mattresses",
    "Cleaning Carts",
    "Brooms",
    "Mops",
    "Vacuum Cleaners",
    "Trash Cans",
  ]);
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      _id: slide._id,
      name,
      price,
      discount,
      gst,
      stock,
      category,
      description,
      updatedImages: newImages,
    });
    onClose();
  };

  const handleImageSelect = (file, index) => {
    const updatedImages = [...images];
    updatedImages[index] = file;
    setImages(updatedImages);

    const updatedNewImages = [...newImages];
    const existingIndex = updatedNewImages.findIndex(
      (item) => item.index === index
    );

    if (existingIndex >= 0) {
      updatedNewImages[existingIndex] = { file, index };
    } else {
      updatedNewImages.push({ file, index });
    }

    setNewImages(updatedNewImages);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 min-h-screen overflow-auto hide-scrollbar">
      <div className="bg-white dark:bg-[#111827] rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
            Add Product
          </h1>
          <button
            onClick={() => setShowCategoryForm(!showCategoryForm)}
            className="flex items-center px-4 py-2 bg-blue-600 dark:text-white text-black rounded-lg hover:bg-blue-700 transition-colors"
          >
            <FaPlus className="w-5 h-5 mr-2" />
            Manage Categories
          </button>
        </div>
        {showCategoryForm && <Category />}
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
              Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full max-w-xs:text-sm bg-white px-3 py-2 border border-gray-300 rounded-md dark:bg-[#111827]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Price
            </label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              className="w-full  max-w-xs:text-sm bg-white px-3 py-2 border border-gray-300 rounded-md dark:bg-[#111827]"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full  max-w-xs:text-sm bg-white px-3 py-2 border border-gray-300 rounded-md dark:bg-[#111827] h-[150px]"
            />
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label
                htmlFor="Category"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Category
              </label>
              <select
                id="category"
                name="category"
                value={category && category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full max-w-xs:text-sm bg-white px-4 py-2 border dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option>Select Category</option>
                {CategoryList?.map((cat, i) => (
                  <option key={i} value={cat}>
                    {cat.category}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="stock"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Stock
              </label>
              <select
                id="stock"
                name="stock"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full max-w-xs:text-sm bg-white  px-4 py-2 border dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select stock</option>
                <option value="In stock">In stock</option>
                <option value="Out stock">Out stock</option>
              </select>
            </div>
          </div>
          <div>
            <label
              htmlFor="discount"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Discount (%)
            </label>
            <input
              id="discount"
              type="number"
              name="discount"
              value={discount && discount}
              onChange={(e) => setDiscount(e.target.value)}
              className="w-full max-w-xs:text-sm bg-white px-4 py-2 border dark:bg-gray-800 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter discount percentage"
              min="0"
              max="100"
            />
          </div>

          <div>
            <label
              htmlFor="gst"
              className="block max-w-xs:text-sm  text-sm font-medium text-gray-700 mb-1"
            >
              GST (%)
            </label>
            <input
              type="number"
              name="gst"
              id="gst"
              value={gst}
              onChange={(e) => setGst(e.target.value)}
              className="w-full max-w-xs:text-sm bg-white px-4 py-2 dark:bg-gray-800 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none"
              placeholder="Enter Gst percentage "
              min="0"
              max="100"
            />
          </div>
          <ImageUpload
            onImageSelect={handleImageSelect}
            initialImages={images}
          />

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
              className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
