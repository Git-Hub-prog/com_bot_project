const mongoose = require("mongoose");

const connectDB = async () => {
    try {
        if (!process.env.MONGO_URI) {
            if (process.env.NODE_ENV === "production") {
                throw new Error("MONGO_URI is required in production");
            }
            console.warn("No MONGO_URI configured; running in local demo mode without MongoDB connection.");
            return;
        }

        await mongoose.connect(process.env.MONGO_URI, {
            serverSelectionTimeoutMS: 10000,
            maxPoolSize: 10,
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        if (process.env.NODE_ENV === "production") throw error;
        console.warn("MongoDB connection failed, continuing in local demo mode:", error.message);
    }
};

module.exports = connectDB;