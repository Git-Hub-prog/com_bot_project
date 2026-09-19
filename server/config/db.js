const mongoose = require("mongoose");
const { MONGO_URI, MONGO_DB_NAME, MONGO_DNS_SERVERS } = require("./env");

const connectDB = async () => {
    try {
        if (!MONGO_URI) {
            if (process.env.NODE_ENV === "production") {
                throw new Error("MONGO_URI is required in production");
            }
            console.warn("No MONGO_URI configured; running in local demo mode without MongoDB connection.");
            return;
        }

        await mongoose.connect(MONGO_URI, {
            dbName: MONGO_DB_NAME,
            serverSelectionTimeoutMS: 10000,
            maxPoolSize: 10,
        });
        console.log("MongoDB connected successfully");
    } catch (error) {
        if (error.code === "ECONNREFUSED" && error.syscall === "querySrv") {
            const configuredServers = MONGO_DNS_SERVERS.length
                ? `Configured DNS servers: ${MONGO_DNS_SERVERS.join(", ")}.`
                : "Set MONGO_DNS_SERVERS=1.1.1.1,8.8.8.8 if your local DNS server refuses Atlas SRV lookups.";
            throw new Error(`MongoDB Atlas DNS lookup failed. ${configuredServers}`);
        }
        // A configured database must be reachable; otherwise the app could
        // appear healthy while silently failing to persist user data.
        throw error;
    }
};

module.exports = connectDB;
