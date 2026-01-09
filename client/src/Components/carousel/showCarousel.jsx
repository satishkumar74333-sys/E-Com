import { useEffect, useState } from "react";
import { EditModal } from "./editModule";

export function CarouselGrid({ slides, onEdit, onDelete }) {
  const [editingSlide, setEditingSlide] = useState(null);
  const handleEdit = (slide) => {
    setEditingSlide(slide);
  };
  const handleSave = (updatedSlide) => {
    onEdit(updatedSlide);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 ">
      {slides?.map((slide) => (
        <div
          key={slide._id}
          className="bg-white dark:bg-[#111827] rounded-lg dark:shadow-[0_0_1px_white] shadow-md overflow-hidden"
        >
          <img
            crossOrigin="anonymous"
            src={slide?.images[0]?.secure_url}
            alt={slide?.name}
            className="w-full h-48 object-contain"
          />
          <div className="p-4">
            <h3 className="text-lg font-semibold mb-2">{slide?.name}</h3>
            <h3 className="text-lg font-semibold mb-2">{slide?.description}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(slide)}
                className="flex-1 px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                Edit
              </button>
              <button
                onClick={() => onDelete(slide?._id)}
                className="flex-1 px-3 py-1 text-sm bg-red-500 text-white rounded hover:bg-red-600"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}

      {editingSlide && (
        <EditModal
          slide={editingSlide}
          onClose={() => setEditingSlide(null)}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
