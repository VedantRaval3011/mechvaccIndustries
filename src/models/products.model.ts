// app/models/products.model.ts
import mongoose, { Schema } from 'mongoose';

// Define sub-schemas (assuming these are defined elsewhere or here)
const specificationSchema = new Schema({
  title: { type: String, required: true },
  value: { type: String, required: true },
});

const querySchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  value: { type: String },
});

const productSchema = new Schema({
  name: { type: String, required: true },
  displayTitle: { type: String, required: true },
  group: { type: String, required: true },
  price: { type: Number, min: 0 },
  priceLabel: { type: String, default: '' }, // Ensure this is included
  description: { type: String, default: '' }, // Ensure this is included
  displayImage: { type: String },
  additionalImages: [{ type: String }],
  video: { type: String },
  pdf: { type: String },
  seoKeywords: { type: String },
  specifications: [specificationSchema],
  queries: [querySchema],
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', productSchema);