const mongoose = require("mongoose");

const customQuestionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  question: { type: String, required: true },
  required: { type: Boolean, default: false },
}, { _id: false });

const spaceSchema = new mongoose.Schema(
  {
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    logo: { type: String, default: "" },
    description: { type: String, default: "" },
    customPrompt: { type: String, default: "What was your experience?" },
    avatarEnabled: { type: Boolean, default: true },
    starRatingEnabled: { type: Boolean, default: true },
    customQuestions: { type: [customQuestionSchema], default: [] },
    brandColor: { type: String, default: "#A8C96F" },
    embedSettings: {
      theme: { type: String, enum: ["light", "dark", "auto"], default: "light" },
      layout: { type: String, enum: ["grid", "carousel", "badge"], default: "grid" },
      showRatings: { type: Boolean, default: true },
      showAvatars: { type: Boolean, default: true },
      featuredOnly: { type: Boolean, default: false },
      count: { type: Number, min: 1, max: 24, default: 6 },
    },
    prompt: { type: String, default: "What was your experience?" },
    settings: {
      avatarRequired: { type: Boolean, default: true },
      starRatingRequired: { type: Boolean, default: true },
      customQuestions: [customQuestionSchema],
    },
  },
  { timestamps: true }
);

spaceSchema.virtual("testimonials", {
  ref: "Testimonial",
  localField: "_id",
  foreignField: "space",
});
spaceSchema.index({ owner: 1, createdAt: -1 });
spaceSchema.set("toObject", { virtuals: true });
spaceSchema.set("toJSON", { virtuals: true });

module.exports = mongoose.model("Space", spaceSchema);
