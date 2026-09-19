const dotenv = require("dotenv");
const path = require("path");
const dns = require("dns");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });
dotenv.config({ path: path.resolve(__dirname, "..", "..", ".env") });

// Some Windows DNS configurations refuse SRV lookups even though the same
// Atlas hostname resolves normally through public DNS. Keep this opt-in so
// deployments can use their own resolver when required.
const dnsServers = (process.env.MONGO_DNS_SERVERS || "")
  .split(",")
  .map((server) => server.trim())
  .filter(Boolean);

if (dnsServers.length) {
  dns.setServers(dnsServers);
}

const requiredEnv = ["JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];
const missingEnv = requiredEnv.filter((key) => !process.env[key]);
const mongoUri = process.env.MONGO_URI || process.env.ATLASDB_URL;

if (missingEnv.length) {
  throw new Error(`Missing required authentication environment variables: ${missingEnv.join(", ")}`);
}

if (process.env.NODE_ENV === "production" && !process.env.CLIENT_URL) {
  // throw new Error("CLIENT_URL is required in production for credentialed CORS");
}

if (process.env.CLIENT_URL === "*") {
  throw new Error("CLIENT_URL cannot be '*' when authentication cookies are enabled");
}

if (process.env.NODE_ENV === "production" && /^(mongodb:\/\/localhost|mongodb:\/\/127\.0\.0\.1)/i.test(mongoUri || "")) {
  throw new Error("A production deployment must use a hosted MongoDB connection string");
}

module.exports = {
  PORT: process.env.PORT || 5000,
  CLIENT_URL: process.env.CLIENT_URL || "http://localhost:5173",
  MONGO_URI: mongoUri,
  MONGO_DB_NAME: process.env.MONGO_DB_NAME || "testimonialhub",
  MONGO_DNS_SERVERS: dnsServers,
  JWT_ACCESS_SECRET: process.env.JWT_ACCESS_SECRET,
  JWT_REFRESH_SECRET: process.env.JWT_REFRESH_SECRET,
  ACCESS_TOKEN_EXPIRES: process.env.ACCESS_TOKEN_EXPIRES_IN || process.env.ACCESS_TOKEN_EXPIRES || "15m",
  REFRESH_TOKEN_EXPIRES: process.env.REFRESH_TOKEN_EXPIRES_IN || process.env.REFRESH_TOKEN_EXPIRES || "7d",
  COOKIE_SECURE: process.env.COOKIE_SECURE === "true" || process.env.NODE_ENV === "production",
  COOKIE_SAME_SITE: process.env.COOKIE_SAME_SITE || "lax",
  UPLOAD_MAX_SIZE_MB: Number(process.env.UPLOAD_MAX_SIZE_MB || 5),
  EMAIL_FROM: process.env.EMAIL_FROM || process.env.SMTP_FROM || "TestimonialHub <no-reply@testimonialhub.local>",
  IP_HASH_SECRET: process.env.IP_HASH_SECRET || "dev-ip-hash",

  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME,
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY,
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET,
};
