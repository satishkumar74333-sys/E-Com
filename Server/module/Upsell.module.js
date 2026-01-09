import mongoose, { Schema, model } from "mongoose";

const UpsellSchema = new Schema(
  {
    triggerProduct: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
      unique: true, // one upsell per trigger product
    },
    upsellProducts: [
      {
        product: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Product",
          required: true,
        },
        discountType: {
          type: String,
          enum: ["percentage", "flat"],
          required: true,
        },
        discountValue: {
          type: Number,
          required: true,
          min: 0,
        },
      },
    ],
    minQty: {
      type: Number,
      default: 1,
      min: 1,
    },
    active: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

const Upsell = model("Upsell", UpsellSchema);

// Drop old index if exists
setTimeout(() => {
  Upsell.collection.indexes().then(indexes => {
    const oldIndex = indexes.find(idx => idx.name === 'product_1');
    if (oldIndex) {
      Upsell.collection.dropIndex('product_1').then(() => console.log('Dropped old index product_1')).catch(err => console.log('Error dropping index', err));
    }
  }).catch(err => console.log('Error getting indexes', err));
}, 1000);

export default Upsell;