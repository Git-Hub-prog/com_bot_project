const { z } = require("zod");

const email = z.string().trim().email().max(254);
const password = z.string().min(8).regex(/[a-z]/, "must include a lowercase letter").regex(/[A-Z]/, "must include an uppercase letter").regex(/\d/, "must include a number");
const optionalRating = z.preprocess((value) => (value === "" || value === undefined || value === null ? undefined : Number(value)), z.number().int().min(1).max(5).optional());
const formBoolean = z.preprocess((value) => (value === "true" || value === true || value === "1" ? true : value === "false" || value === false || value === "0" ? false : value), z.boolean().optional());
const customQuestion = z.object({ id: z.string().max(100), question: z.string().trim().min(1).max(300), required: z.boolean().optional() });
const customAnswer = z.object({ questionId: z.string().max(100), answer: z.string().max(1000) });

const signupSchema = z.object({ name: z.string().trim().min(1).max(120), email, password });
const loginSchema = z.object({ email, password: z.string().min(1).max(200) });
const forgotPasswordSchema = z.object({ email });
const verifyEmailSchema = z.object({ token: z.string().trim().min(20).max(256) });
const resetPasswordSchema = z.object({ token: z.string().trim().min(20).max(256), password });
const spaceSchema = z.object({ name: z.string().trim().min(1).max(120), slug: z.string().trim().min(1).max(100).regex(/^[a-zA-Z0-9 -]+$/), description: z.string().max(1000).optional(), customPrompt: z.string().max(500).optional(), prompt: z.string().max(500).optional(), brandColor: z.string().regex(/^#[0-9a-f]{6}$/i).optional(), avatarEnabled: formBoolean, starRatingEnabled: formBoolean, customQuestions: z.union([z.array(z.union([z.string().max(300), customQuestion])).max(10), z.string().max(4000)]).optional() }).passthrough();
const publicTestimonialSchema = z.object({ name: z.string().trim().min(1).max(120), email, role: z.string().max(120).optional(), company: z.string().max(120).optional(), rating: optionalRating, review: z.string().trim().min(1).max(5000), customAnswers: z.union([z.array(customAnswer).max(20), z.record(z.string(), z.string().max(1000)), z.string().max(20000)]).optional(), website: z.string().max(200).optional() }).passthrough();
const statusSchema = z.object({ status: z.enum(["pending", "approved", "rejected", "archived"]) });
const booleanSchema = z.object({ featured: formBoolean, liked: formBoolean });
const embedSettingsSchema = z.object({ theme: z.enum(["light", "dark", "auto"]).optional(), layout: z.enum(["grid", "carousel", "badge"]).optional(), showRatings: formBoolean, showAvatars: formBoolean, featuredOnly: formBoolean, count: z.coerce.number().int().min(1).max(24).optional() });

module.exports = { signupSchema, loginSchema, forgotPasswordSchema, verifyEmailSchema, resetPasswordSchema, spaceSchema, publicTestimonialSchema, statusSchema, booleanSchema, embedSettingsSchema };
