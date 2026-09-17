require("dotenv").config({ path: require("path").resolve(__dirname, "..", ".env") });

const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");
const User = require("../models/User");
const Space = require("../models/Space");
const Testimonial = require("../models/Testimonial");

const demoOwner = {
  name: "Ava Morgan",
  email: "demo@testimonialhub.local",
  passwordHash: bcrypt.hashSync("DemoPass1", 12),
  isVerified: true,
};

const testimonials = [
  { clientName: "Alex Morgan", email: "alex@example.com", companyRole: "Head of Product", company: "Northstar", rating: 5, reviewText: "TestimonialHub helped us turn customer wins into a repeatable source of social proof.", status: "approved", isFeatured: true, isLiked: true },
  { clientName: "Priya Shah", email: "priya@example.com", companyRole: "Founder", company: "Lumen", rating: 5, reviewText: "The collection page was live in minutes and our customers actually enjoyed sharing feedback.", status: "approved", isFeatured: true, isLiked: false },
  { clientName: "Jon Bell", email: "jon@example.com", companyRole: "Marketing Lead", company: "Orbit", rating: 4, reviewText: "A simple workflow for turning great conversations into polished customer stories.", status: "pending", isFeatured: false, isLiked: true },
  { clientName: "Maya Chen", email: "maya@example.com", companyRole: "Customer Success", company: "Fieldwork", rating: 3, reviewText: "The moderation queue gives our team a clear place to review every submission.", status: "rejected", isFeatured: false, isLiked: false },
  { clientName: "Sam Rivera", email: "sam@example.com", companyRole: "Operations Director", company: "Common Ground", rating: 4, reviewText: "We can keep feedback organized by campaign without losing the human voice.", status: "archived", isFeatured: false, isLiked: false },
  { clientName: "Nora Williams", email: "nora@example.com", companyRole: "CEO", company: "Brightside", rating: 5, reviewText: "Our Wall of Love became one of the most useful pages in our sales toolkit.", status: "approved", isFeatured: false, isLiked: true },
];

const run = async () => {
  if (process.env.NODE_ENV === "production") throw new Error("The development seed cannot run in production");
  if (!process.env.MONGO_URI) throw new Error("MONGO_URI is required to seed the database");
  await mongoose.connect(process.env.MONGO_URI);
  const owner = await User.findOneAndUpdate({ email: demoOwner.email }, { $set: { ...demoOwner } }, { upsert: true, new: true, setDefaultsOnInsert: true });
  const space = await Space.findOneAndUpdate(
    { slug: "acme-corp" },
    { $set: { owner: owner._id, name: "Acme Corp", slug: "acme-corp", description: "Customer stories from a team that cares about the details.", customPrompt: "What changed for you?", prompt: "What changed for you?", brandColor: "#A8C96F", avatarEnabled: true, starRatingEnabled: true, customQuestions: [{ id: "q1", question: "What did you like most about our service?", required: true }] } },
    { upsert: true, new: true, setDefaultsOnInsert: true },
  );
  await Testimonial.deleteMany({ space: space._id });
  await Testimonial.insertMany(testimonials.map((testimonial) => ({ ...testimonial, customerName: testimonial.clientName, customerEmail: testimonial.email, reviewText: testimonial.reviewText, text: testimonial.reviewText, featured: testimonial.isFeatured, liked: testimonial.isLiked, space: space._id })));
  console.log(`Seeded demo owner ${owner.email}, Space /${space.slug}, and ${testimonials.length} testimonials.`);
  console.log("Demo password: DemoPass1");
};

run().catch((error) => { console.error("Seed failed:", error.message); process.exitCode = 1; }).finally(async () => { await mongoose.disconnect(); });
