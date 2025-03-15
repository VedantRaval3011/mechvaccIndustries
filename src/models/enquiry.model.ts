import mongoose from "mongoose";

const enquirySchema = new mongoose.Schema(
  {
    firstname: {
      type: String,
      required: true,
    },
    lastname: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    contact: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true
    }
  },
  { strict: false, timestamps: true }
);

export default mongoose.models.Enquiry ||
  mongoose.model("Enquiry", enquirySchema);
