// models/Service.ts
import mongoose from 'mongoose';

const specificationSchema = new mongoose.Schema({
  title: String,
  value: String,
});

const querySchema = new mongoose.Schema({
  title: String,
  type: { type: String, enum: ['number', 'string'] },
});

const serviceSchema = new mongoose.Schema({
  name: String,
  displayTitle: String,
  group: String,
  price: Number,
  displayImage: String,
  additionalImages: [String],
  video: String,
  pdf: String,
  seoKeywords: String,
  specifications: [specificationSchema],
  queries: [querySchema],
});

export default mongoose.models.Service || mongoose.model('Service', serviceSchema);