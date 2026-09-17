const Space = require("../models/Space");
const Testimonial = require("../models/Testimonial");
const { storeImage } = require("../services/storage");

const toClient = (space) => ({ id: String(space._id), ownerId: String(space.owner), name: space.name, slug: space.slug, logo: space.logo, description: space.description, customPrompt: space.customPrompt || space.prompt, prompt: space.customPrompt || space.prompt, avatarEnabled: space.avatarEnabled ?? space.settings?.avatarRequired, starRatingEnabled: space.starRatingEnabled ?? space.settings?.starRatingRequired, customQuestions: space.customQuestions?.length ? space.customQuestions : (space.settings?.customQuestions || []), brandColor: space.brandColor, settings: { avatarRequired: space.avatarEnabled ?? space.settings?.avatarRequired, starRatingRequired: space.starRatingEnabled ?? space.settings?.starRatingRequired, customQuestions: space.customQuestions?.length ? space.customQuestions : (space.settings?.customQuestions || []) }, createdAt: space.createdAt, updatedAt: space.updatedAt });
const toPublicClient = (space) => ({ name: space.name, slug: space.slug, logo: space.logo, description: space.description, customPrompt: space.customPrompt || space.prompt, brandColor: space.brandColor, avatarEnabled: space.avatarEnabled ?? space.settings?.avatarRequired, starRatingEnabled: space.starRatingEnabled ?? space.settings?.starRatingRequired, customQuestions: space.customQuestions?.length ? space.customQuestions : (space.settings?.customQuestions || []) });

const parseJson = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  if (typeof value !== "string") return value;
  try { return JSON.parse(value); } catch { return fallback; }
};

const parseBoolean = (value, fallback) => {
  if (value === undefined || value === null || value === "") return fallback;
  return value === true || value === "true" || value === "1";
};

const getOwnerSpaces = async (req, res, next) => {
  try { const spaces = await Space.find({ owner: req.user.id }).sort({ createdAt: -1 }); return res.json({ success: true, spaces: spaces.map(toClient) }); } catch (error) { return next(error); }
};
const normalizeQuestions = (questions) => (Array.isArray(questions) ? questions : []).map((item, index) => {
  if (typeof item === "string") return { id: `q${index + 1}`, question: item.trim(), required: false };
  return { id: String(item.id || `q${index + 1}`), question: String(item.question || "").trim(), required: Boolean(item.required) };
}).filter((item) => item.question).slice(0, 10);

const getSpace = async (req, res, next) => {
  try {
    const space = await Space.findOne({ _id: req.params.spaceId, owner: req.user.id });
    if (!space) return res.status(404).json({ success: false, message: "Space not found" });
    return res.json({ success: true, space: toClient(space) });
  } catch (error) { return next(error); }
};

const createSpace = async (req, res, next) => {
  try {
    const { name, slug, description, prompt, customPrompt, brandColor } = req.body;
    if (!name || !slug) return res.status(400).json({ success: false, message: "Name and slug are required" });
    const normalizedSlug = slug.toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "");
    if (!normalizedSlug) return res.status(400).json({ success: false, message: "Slug must contain letters or numbers" });
    if (await Space.exists({ slug: normalizedSlug })) return res.status(409).json({ success: false, message: "A space with this slug already exists" });
    const settings = parseJson(req.body.settings, {});
    const customQuestions = normalizeQuestions(parseJson(req.body.customQuestions, settings.customQuestions || []));
    const avatarEnabled = parseBoolean(req.body.avatarEnabled, parseBoolean(settings.avatarRequired, true));
    const starRatingEnabled = parseBoolean(req.body.starRatingEnabled, parseBoolean(settings.starRatingRequired, true));
    const resolvedPrompt = String(customPrompt || prompt || "What did you love most about our product?").trim();
    const resolvedBrandColor = /^#[0-9a-f]{6}$/i.test(String(brandColor || "")) ? brandColor : "#A8C96F";
    const space = await Space.create({ owner: req.user.id, name: name.trim(), slug: normalizedSlug, description: description || "", customPrompt: resolvedPrompt, prompt: resolvedPrompt, avatarEnabled, starRatingEnabled, customQuestions: Array.isArray(customQuestions) ? customQuestions.filter(Boolean).slice(0, 10) : [], brandColor: resolvedBrandColor, logo: await storeImage(req.file), settings: { avatarRequired: avatarEnabled, starRatingRequired: starRatingEnabled, customQuestions: Array.isArray(customQuestions) ? customQuestions.filter(Boolean).slice(0, 10) : [] } });
    return res.status(201).json({ success: true, message: "Space created successfully", space: toClient(space) });
  } catch (error) { return next(error); }
};

const updateSpace = async (req, res, next) => {
  try {
    const space = await Space.findOne({ _id: req.params.id, owner: req.user.id });
    if (!space) return res.status(404).json({ success: false, message: "Space not found" });
    if (req.body.slug !== undefined) {
      const normalizedSlug = String(req.body.slug).toLowerCase().trim().replace(/[^a-z0-9-]+/g, "-").replace(/(^-|-$)/g, "");
      if (!normalizedSlug) return res.status(400).json({ success: false, message: "Slug must contain letters or numbers" });
      if (await Space.exists({ slug: normalizedSlug, _id: { $ne: space._id } })) return res.status(409).json({ success: false, message: "A space with this slug already exists" });
      space.slug = normalizedSlug;
    }
    const settings = parseJson(req.body.settings, {});
    const customQuestions = normalizeQuestions(parseJson(req.body.customQuestions, space.customQuestions || settings.customQuestions || []));
    const avatarEnabled = parseBoolean(req.body.avatarEnabled, space.avatarEnabled);
    const starRatingEnabled = parseBoolean(req.body.starRatingEnabled, space.starRatingEnabled);
    const prompt = String(req.body.customPrompt || req.body.prompt || space.customPrompt || space.prompt).trim();
    if (req.body.name?.trim()) space.name = req.body.name.trim();
    if (req.body.description !== undefined) space.description = req.body.description;
    if (prompt) { space.customPrompt = prompt; space.prompt = prompt; }
    space.avatarEnabled = avatarEnabled;
    space.starRatingEnabled = starRatingEnabled;
    space.customQuestions = Array.isArray(customQuestions) ? customQuestions.filter(Boolean).slice(0, 10) : [];
    space.brandColor = /^#[0-9a-f]{6}$/i.test(String(req.body.brandColor || "")) ? req.body.brandColor : space.brandColor;
    if (req.file) space.logo = await storeImage(req.file);
    space.settings = { avatarRequired: space.avatarEnabled, starRatingRequired: space.starRatingEnabled, customQuestions: space.customQuestions };
    await space.save();
    return res.json({ success: true, message: "Space settings saved", space: toClient(space) });
  } catch (error) { return next(error); }
};

const deleteSpace = async (req, res, next) => {
  try {
    const space = await Space.findOne({ _id: req.params.id, owner: req.user.id });
    if (!space) return res.status(404).json({ success: false, message: "Space not found" });
    await Testimonial.deleteMany({ space: space._id });
    await space.deleteOne();
    return res.json({ success: true, message: "Space deleted" });
  } catch (error) { return next(error); }
};

const getEmbedSettings = async (req, res, next) => {
  try {
    const space = await Space.findOne({ _id: req.params.id, owner: req.user.id }).select("embedSettings slug");
    if (!space) return res.status(404).json({ success: false, message: "Space not found" });
    return res.json({ success: true, data: { spaceId: String(space._id), slug: space.slug, embedSettings: space.embedSettings } });
  } catch (error) { return next(error); }
};

const updateEmbedSettings = async (req, res, next) => {
  try {
    const space = await Space.findOne({ _id: req.params.id, owner: req.user.id });
    if (!space) return res.status(404).json({ success: false, message: "Space not found" });
    space.embedSettings = { ...(space.embedSettings?.toObject?.() || {}), ...req.body };
    await space.save();
    return res.json({ success: true, message: "Embed settings saved", data: space.embedSettings });
  } catch (error) { return next(error); }
};

const getPublicSpace = async (req, res, next) => {
  try {
    const space = await Space.findOne({ slug: req.params.slug || req.params.spaceSlug });
    if (!space) return res.status(404).json({ success: false, message: "Space not found" });
    const reviews = await Testimonial.find({ space: space._id, status: "approved" });
    const averageRating = reviews.length ? (reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length).toFixed(1) : "0.0";
    return res.json({ success: true, space: toPublicClient(space), stats: { totalReviews: reviews.length, averageRating, distribution: [5, 4, 3, 2, 1].map((star) => ({ star, count: reviews.filter((review) => review.rating === star).length })) } });
  } catch (error) { return next(error); }
};

const getWallReviews = async (req, res, next) => {
  try {
    const space = await Space.findOne({ slug: req.params.slug || req.params.spaceSlug });
    if (!space) return res.status(404).json({ success: false, message: "Space not found" });
    const reviews = await Testimonial.find({ space: space._id, status: "approved" }).sort({ featured: -1, createdAt: -1 });
    return res.json({ success: true, testimonials: reviews.map((review) => ({ id: String(review._id), name: review.clientName || review.customerName, role: review.companyRole, company: review.company, rating: review.rating, review: review.reviewText || review.text, avatar: review.avatar, status: review.status, featured: review.isFeatured ?? review.featured, liked: review.isLiked ?? review.liked, createdAt: review.createdAt, updatedAt: review.updatedAt })) });
  } catch (error) { return next(error); }
};

module.exports = { getOwnerSpaces, getSpace, createSpace, updateSpace, deleteSpace, getEmbedSettings, updateEmbedSettings, getPublicSpace, getWallReviews };
