// app/models/interestedUser.model.ts
import mongoose, { Schema } from 'mongoose';

const interestedUserSchema = new Schema({
  productId: { type: String, required: true },
  productTitle: { type: String, required: true },
  queries: [{
    title: { type: String, required: true },
    type: { type: String, required: true },
    value: { type: String, default: '' }
  }],
  createdAt: { type: Date, default: Date.now },
});

export const InterestedUser = mongoose.models.InterestedUser || 
  mongoose.model('InterestedUser', interestedUserSchema);