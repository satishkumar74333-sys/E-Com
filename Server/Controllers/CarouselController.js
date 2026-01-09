import AppError from "../utils/AppError.js";
import cloudinary from "cloudinary";
import fs from "fs/promises";
import Carousel from "../module/Carousel.module.js";

export const CarouselUpload = async (req, res, next) => {
  const { name, description } = req.body;
  if (!name || !description) {
    return next(new AppError("All fields are required", 400));
  }

  try {
    let imageUploads = [];
    if (req.files && req.files.length > 0) {
      imageUploads = await Promise.all(
        req.files.map(async (file) => {
          const uploadResult = await cloudinary.v2.uploader.upload(file.path, {
            folder: "Carousel",
          });

          await fs.rm(file.path, { force: true });

          return {
            public_id: uploadResult.public_id,
            secure_url: uploadResult.secure_url,
          };
        })
      );
    }

    if (imageUploads.length === 0) {
      return next(
        new AppError("Image upload failed. No product was created.", 400)
      );
    }

    const carousel = await Carousel.create({
      name,
      description,

      images: imageUploads,
    });

    res.status(200).json({
      success: true,
      data: carousel,
      message: "Carousel uploaded successfully.",
    });
  } catch (error) {
    if (req.files) {
      await Promise.all(
        req.files.map((file) => fs.rm(file.path, { force: true }))
      );
    }

    return next(new AppError(`Product upload failed: ${error.message}`, 400));
  }
};

export const CarouselUpdate = async (req, res, next) => {
  const { id } = req.params;
  const { name, description } = req.body;

  if (!id) {
    return next(new AppError("Carousel ID is required for update.", 400));
  }

  try {
    let imageUploads = [];
    if (req.files && req.files.length > 0) {
      imageUploads = await Promise.all(
        req.files.map(async (file) => {
          const uploadResult = await cloudinary.v2.uploader.upload(file.path, {
            folder: "Carousel",
          });

          await fs.rm(file.path, { force: true });

          return {
            public_id: uploadResult.public_id,
            secure_url: uploadResult.secure_url,
          };
        })
      );
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (imageUploads.length > 0) updateData.images = imageUploads;

    const updatedCarousel = await Carousel.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true, runValidators: true }
    );

    if (!updatedCarousel) {
      return next(
        new AppError("Failed to update the carousel. Please try again.", 400)
      );
    }

    res.status(200).json({
      success: true,
      message: "Carousel successfully updated.",
      data: updatedCarousel,
    });
  } catch (error) {
    return next(new AppError(error.message, 500));
  }
};

export const CarouselDelete = async (req, res, next) => {
  const { id } = req.params;

  if (!id) {
    return next(new AppError("carousel update to id is required..", 400));
  }
  try {
    const carousel = await Carousel.findByIdAndDelete(id);
    if (!carousel) {
      return next(
        new AppError(" carousel failed  to Delete.., Please try again..", 400)
      );
    }
    res.status(200).json({
      success: true,
      message: "carousel successfully Delete...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};

export const getCarousel = async (req, res, next) => {
  const { id } = req.params;
  console.log(id);
  if (!id) {
    return next(new AppError("carousel update to id is required..", 400));
  }
  try {
    const carousel = await Carousel.findById(id);
    if (!carousel) {
      return next(
        new AppError(" carousel failed  to get.., Please try again..", 400)
      );
    }
    res.status(200).json({
      success: true,
      data: carousel,
      message: "carousel successfully get...",
    });
  } catch (error) {
    return next(new AppError(error.message, 400));
  }
};
export const getAllCarousel = async (req, res, next) => {
  const carousel = await Carousel.find({});

  const totalCarousel = await Carousel.countDocuments({});

  if (!carousel) {
    return next(
      new AppError("carousels failed to load. Please try again.", 400)
    );
  }

  res.status(200).json({
    success: true,
    data: carousel,
    message: "carousel successfully retrieved.",

    totalCarousel,
  });
};
