const Space = require("../models/Space");
const Testimonial = require("../models/Testimonial");
const { storeImage } = require("../services/storage");

const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const sanitizeText = (value, maxLength) => String(value || "").replace(/<[^>]*>/g, "").replace(/[\u0000-\u001f\u007f]/g, "").trim().slice(0, maxLength);
const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const toClient = (review) => ({ id: String(review._id), spaceId: String(review.space), status: review.status, featured: review.isFeatured ?? review.featured, isFeatured: review.isFeatured ?? review.featured, liked: review.isLiked ?? review.liked, isLiked: review.isLiked ?? review.liked, name: review.clientName || review.customerName, email: review.email || review.customerEmail, role: review.companyRole, company: review.company, rating: review.rating, review: review.reviewText || review.text, avatar: review.avatar, customAnswers: review.customAnswers, createdAt: review.createdAt, updatedAt: review.updatedAt });

const submitTestimonial = async (req, res, next) => {
  try {
    const space = await Space.findOne({ slug: req.params.slug || req.params.spaceSlug });
    if (!space) return res.status(404).json({ success: false, message: "Space not found" });
    if (req.body.website) return res.status(202).json({ success: true, message: "Review received for moderation" });
    const { name, email, role, company, rating, review, avatar, customAnswers } = req.body;
    const ratingRequired = space.starRatingEnabled ?? space.settings?.starRatingRequired ?? true;
    const cleanName = sanitizeText(name, 120);
    const cleanEmail = String(email || "").trim().toLowerCase();
    const cleanRole = sanitizeText(role || "Customer", 120);
    const cleanCompany = sanitizeText(company, 120);
    const cleanReview = sanitizeText(review, 5000);
    const numericRating = rating === "" || rating === undefined ? undefined : Number(rating);
    if (!cleanName || !emailPattern.test(cleanEmail) || !cleanReview || (ratingRequired && !Number.isInteger(numericRating))) return res.status(400).json({ success: false, message: "Valid name, email, review, and required rating are needed" });
    if (numericRating !== undefined && (!Number.isInteger(numericRating) || numericRating < 1 || numericRating > 5)) return res.status(400).json({ success: false, message: "Rating must be an integer from 1 to 5" });
    if (!space.avatarEnabled && req.file) return res.status(400).json({ success: false, message: "Avatar uploads are disabled for this Space" });
    let answers = {};
    try { answers = typeof customAnswers === "string" ? JSON.parse(customAnswers) : (customAnswers || {}); } catch { answers = {}; }
    const answerById = Array.isArray(answers) ? Object.fromEntries(answers.map((item) => [item.questionId, item.answer])) : answers;
    const requiredQuestions = (space.customQuestions || []).filter((question) => question.required);
    const missingQuestion = requiredQuestions.find((question) => !String(answerById[question.id] || "").trim());
    if (missingQuestion) return res.status(400).json({ success: false, message: `Answer required: ${missingQuestion.question}` });
    const safeAnswers = Array.isArray(answers)
      ? answers.slice(0, 20).map((item) => ({ questionId: sanitizeText(item.questionId, 100), answer: sanitizeText(item.answer, 1000) })).filter((item) => item.questionId)
      : Object.entries(answers).slice(0, 20).map(([key, value]) => ({ questionId: sanitizeText(key, 100), answer: sanitizeText(value, 1000) }));
    const submission = await Testimonial.create({ space: space._id, clientName: cleanName, email: cleanEmail, customerName: cleanName, customerEmail: cleanEmail, companyRole: cleanRole, company: cleanCompany, rating: ratingRequired ? numericRating : undefined, reviewText: cleanReview, text: cleanReview, avatar: await storeImage(req.file), customAnswers: safeAnswers, status: "pending", isFeatured: false, isLiked: false, featured: false, liked: false });
    return res.status(201).json({ success: true, message: "Review submitted for moderation", submission: toClient(submission) });
  } catch (error) { return next(error); }
};

const findOwnedTestimonial = async (testimonialId, ownerId) => {
  const review = await Testimonial.findById(testimonialId).populate("space", "owner");
  if (!review) return { review: null, forbidden: false };
  return { review, forbidden: String(review.space.owner) !== String(ownerId) };
};

const getSpaceTestimonials = async (req, res, next) => {
  try {
    const space = await Space.findOne({ _id: req.params.spaceId, owner: req.user.id });
    if (!space) return res.status(404).json({ success: false, message: "Space not found" });
    const filter = { space: space._id };
    if (["pending", "approved", "rejected", "archived"].includes(req.query.status)) filter.status = req.query.status;
    if (req.query.rating !== undefined) {
      const rating = Number(req.query.rating);
      if (!Number.isInteger(rating) || rating < 1 || rating > 5) return res.status(400).json({ success: false, message: "Rating filter must be an integer from 1 to 5" });
      filter.rating = rating;
    }
    const search = String(req.query.search || "").trim().slice(0, 100);
    if (search) {
      const pattern = new RegExp(escapeRegex(search), "i");
      filter.$or = [
        { clientName: pattern },
        { customerName: pattern },
        { reviewText: pattern },
        { text: pattern },
        { companyRole: pattern },
        { email: pattern },
        { customerEmail: pattern },
      ];
    }
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
    const [reviews, total] = await Promise.all([
      Testimonial.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Testimonial.countDocuments(filter),
    ]);
    const data = reviews.map(toClient);
    const approvedReviews = await Testimonial.find({ ...filter, status: "approved" }).select("rating").lean();
    const ratedApproved = approvedReviews.filter((review) => Number.isInteger(review.rating));
    const distribution = [5, 4, 3, 2, 1].map((star) => ({ star, count: ratedApproved.filter((review) => review.rating === star).length }));
    const approvedCount = await Testimonial.countDocuments({ ...filter, status: "approved" });
    return res.json({ success: true, data, testimonials: data, reviews: data, metrics: { totalReviews: total, approvedReviews: approvedCount, averageRating: ratedApproved.length ? (ratedApproved.reduce((sum, review) => sum + review.rating, 0) / ratedApproved.length).toFixed(1) : "0.0", distribution }, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { return next(error); }
};

const getSpaceMetrics = async (req, res, next) => {
  try {
    const space = await Space.findOne({ _id: req.params.spaceId, owner: req.user.id }).select("_id");
    if (!space) return res.status(404).json({ success: false, message: "Space not found" });
    const [metrics] = await Testimonial.aggregate([
      { $match: { space: space._id, status: "approved", rating: { $gte: 1, $lte: 5 } } },
      { $facet: {
        summary: [{ $group: { _id: null, averageRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } }],
        distribution: [{ $group: { _id: "$rating", count: { $sum: 1 } } }],
      } },
    ]);
    const distribution = { "5": 0, "4": 0, "3": 0, "2": 0, "1": 0 };
    (metrics?.distribution || []).forEach((entry) => { distribution[String(entry._id)] = entry.count; });
    return res.json({ success: true, averageRating: Number((metrics?.summary?.[0]?.averageRating || 0).toFixed(1)), totalReviews: metrics?.summary?.[0]?.totalReviews || 0, distribution });
  } catch (error) { return next(error); }
};

const updateTestimonialStatus = async (req, res, next) => {
  try {
    const { review, forbidden } = await findOwnedTestimonial(req.params.testimonialId, req.user.id);
    if (!review) return res.status(404).json({ success: false, message: "Testimonial not found" });
    if (forbidden) return res.status(403).json({ success: false, message: "You do not own this testimonial's Space" });
    if (!["pending", "approved", "rejected", "archived"].includes(req.body.status)) return res.status(400).json({ success: false, message: "Invalid testimonial status" });
    review.status = req.body.status;
    await review.save();
    return res.json({ success: true, testimonial: toClient(review) });
  } catch (error) { return next(error); }
};

const updateTestimonialFeatured = async (req, res, next) => {
  try {
    const { review, forbidden } = await findOwnedTestimonial(req.params.testimonialId, req.user.id);
    if (!review) return res.status(404).json({ success: false, message: "Testimonial not found" });
    if (forbidden) return res.status(403).json({ success: false, message: "You do not own this testimonial's Space" });
    review.isFeatured = Boolean(req.body.featured);
    review.featured = review.isFeatured;
    await review.save();
    return res.json({ success: true, testimonial: toClient(review) });
  } catch (error) { return next(error); }
};

const updateTestimonialLiked = async (req, res, next) => {
  try {
    const { review, forbidden } = await findOwnedTestimonial(req.params.testimonialId, req.user.id);
    if (!review) return res.status(404).json({ success: false, message: "Testimonial not found" });
    if (forbidden) return res.status(403).json({ success: false, message: "You do not own this testimonial's Space" });
    review.isLiked = Boolean(req.body.liked);
    review.liked = review.isLiked;
    await review.save();
    return res.json({ success: true, testimonial: toClient(review) });
  } catch (error) { return next(error); }
};

const deleteTestimonial = async (req, res, next) => {
  try {
    const { review, forbidden } = await findOwnedTestimonial(req.params.testimonialId, req.user.id);
    if (!review) return res.status(404).json({ success: false, message: "Testimonial not found" });
    if (forbidden) return res.status(403).json({ success: false, message: "You do not own this testimonial's Space" });
    await review.deleteOne();
    return res.json({ success: true, message: "Testimonial deleted" });
  } catch (error) { return next(error); }
};

const getInbox = async (req, res, next) => {
  try {
    const ownerSpaces = await Space.find({ owner: req.user.id }).select("_id");
    const filter = { space: { $in: ownerSpaces.map((space) => space._id) } };
    const page = Math.max(1, Number.parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, Math.max(1, Number.parseInt(req.query.limit, 10) || 10));
    const [reviews, total] = await Promise.all([
      Testimonial.find(filter).sort({ createdAt: -1 }).skip((page - 1) * limit).limit(limit),
      Testimonial.countDocuments(filter),
    ]);
    const data = reviews.map(toClient);
    const approvedReviews = await Testimonial.find({ ...filter, status: "approved" }).select("rating").lean();
    const ratedApproved = approvedReviews.filter((review) => Number.isInteger(review.rating));
    const distribution = [5, 4, 3, 2, 1].map((star) => ({ star, count: ratedApproved.filter((review) => review.rating === star).length }));
    const approvedCount = await Testimonial.countDocuments({ ...filter, status: "approved" });
    return res.json({ success: true, data, reviews: data, metrics: { totalReviews: total, approvedReviews: approvedCount, averageRating: ratedApproved.length ? (ratedApproved.reduce((sum, review) => sum + review.rating, 0) / ratedApproved.length).toFixed(1) : "0.0", distribution }, pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } });
  } catch (error) { return next(error); }
};

const moderateReview = async (req, res, next) => {
  try {
    const review = await Testimonial.findById(req.params.id).populate("space", "owner");
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });
    if (String(review.space.owner) !== String(req.user.id)) return res.status(403).json({ success: false, message: "You do not have access to moderate this review" });
    const { action, featured } = req.body;
    if (action === "approve") review.status = "approved";
    if (action === "reject") review.status = "rejected";
    if (action === "archive") review.status = "archived";
    if (action === "feature" || action === "featured") { review.isFeatured = true; review.featured = true; }
    if (action === "unfeature") { review.isFeatured = false; review.featured = false; }
    if (action === "like") { review.isLiked = true; review.liked = true; }
    if (action === "unlike") { review.isLiked = false; review.liked = false; }
    await review.save();
    return res.json({ success: true, review: toClient(review) });
  } catch (error) { return next(error); }
};

module.exports = { submitTestimonial, getInbox, getSpaceTestimonials, getSpaceMetrics, updateTestimonialStatus, updateTestimonialFeatured, updateTestimonialLiked, deleteTestimonial, moderateReview };
