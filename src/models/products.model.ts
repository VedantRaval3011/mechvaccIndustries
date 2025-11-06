// app/models/products.model.ts
import mongoose, { Schema } from 'mongoose';

const specificationSchema = new Schema({
  title: { type: String, required: true },
  value: { type: String, required: true },
});

const querySchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, required: true },
  value: { type: String },
});

 const customSectionSchema = new Schema({
     title: { type: String, required: true },
     content: { type: String, required: true },
   });

const productSchema = new Schema({
  name: { type: String, required: true, unique: true },
  displayTitle: { type: String, required: true },
  group: { type: String, required: true },
  price: { type: Number, min: 0 },
  priceLabel: { type: String, default: '' },
  description: { type: String, default: '' },
  displayImage: { type: String },
  additionalImages: [{ type: String }],
  video: { type: String },
  pdf: { type: String },
  seoKeywords: { type: String },
  applications: { type: String, default: '' }, // New field
  specifications: [specificationSchema],
  queries: [querySchema],
   customSections: [customSectionSchema],
}, { timestamps: true });

export default mongoose.models.Product || mongoose.model('Product', productSchema);