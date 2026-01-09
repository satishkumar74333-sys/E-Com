import { useEffect, useState } from "react";
import { CarouselGrid } from "../../../Components/carousel/showCarousel";
import { useDispatch, useSelector } from "react-redux";
import {
  DeleteCarousel,
  getAllCarousel,
  getCarousel,
  updateCarousel,
} from "../../../Redux/Slice/CarouselSlice";
import Layout from "../../../layout/layout";
export function CarouselUpdate() {
  const { Carousel } = useSelector((state) => state.carousel);
  const [slides, setSlides] = useState(Carousel);
  const dispatch = useDispatch();
  const [show, setShow] = useState(false);
  async function LoadCarousel() {
    const res = await dispatch(getAllCarousel());
    setSlides(res?.payload?.data);
  }
  const handleEdit = async (updatedSlide) => {
    setSlides((prevSlides) =>
      prevSlides.map((carousel) =>
        carousel._id === updatedSlide._id
          ? { ...carousel, ...updatedSlide }
          : carousel
      )
    );
  };

  const handleDelete = async (id) => {
    window.confirm("you Delete this Carousel ?");

    setSlides((prevSlide) =>
      prevSlide.filter((carousel) => carousel._id !== id)
    );

    await dispatch(DeleteCarousel(id));
  };

  useEffect(() => {
    LoadCarousel();
  }, []);
  return (
    <Layout>
      <div className="min-h-screen bg-gray-100 dark:bg-[#111827] py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold text-center mb-8">
            Carousel Gallery
          </h1>
          <CarouselGrid
            slides={slides}
            onEdit={handleEdit}
            onClose={show}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </Layout>
  );
}
