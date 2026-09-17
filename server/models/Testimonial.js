const mongoose = require("mongoose");

const customAnswerSchema = new mongoose.Schema({
  questionId: { type: String, required: true },
  answer: { type: String, default: "" },
}, { _id: false });

const testimonialSchema = new mongoose.Schema(
  {
    space: { type: mongoose.Schema.Types.ObjectId, ref: "Space", required: true },
    clientName: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    customerName: { type: String, required: true },
    customerEmail: { type: String, required: true },
    companyRole: { type: String, default: "Customer" },
    company: { type: String, default: "" },
    rating: { type: Number, min: 1, max: 5, required: false },
    reviewText: { type: String, required: true },
    text: { type: String, required: true },
    avatar: { type: String, default: "" },
    customAnswers: { type: [customAnswerSchema], default: [] },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "archived"],
      default: "pending",
    },
    isFeatured: { type: Boolean, default: false },
    isLiked: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },
    liked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

testimonialSchema.index({ space: 1 });
testimonialSchema.index({ status: 1 });
testimonialSchema.index({ rating: 1 });
testimonialSchema.index({ createdAt: -1 });
testimonialSchema.index({ space: 1, status: 1, createdAt: -1 });

module.exports = mongoose.model("Testimonial", testimonialSchema);
