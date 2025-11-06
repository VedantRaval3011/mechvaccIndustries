import mongoose, { Schema } from 'mongoose';

const specificationSchema = new Schema({
  title: { type: String, required: true },
  value: { type: String, required: true },
});

const querySchema = new Schema({
  title: { type: String, required: true },
  type: { type: String, required: true, enum: ['number', 'string'] },
});

const customSectionSchema = new Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
});

const serviceSchema = new Schema({
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
  applications: { type: String, default: '' },
  customSections: [customSectionSchema],
  specifications: [specificationSchema],
  queries: [querySchema],
}, { timestamps: true });

export default mongoose.models.Service || mongoose.model('Service', serviceSchema);