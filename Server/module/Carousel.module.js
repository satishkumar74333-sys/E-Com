import { model, Schema } from "mongoose";
const CarouselSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },

    images: [
      {
        public_id: { type: String, required: true },
        secure_url: { type: String, required: true },
      },
    ],

    description: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);
const Carousel = model("Carousel", CarouselSchema);
export default Carousel;
