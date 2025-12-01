/**
 * MongoDB Database Connection
 */

const mongoose = require("mongoose");
require("dotenv").config();

// CRITICAL: Remove hardcoded credentials - use environment variables only
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is required");
  console.error("Please set MONGODB_URI in your .env file or environment variables");
  process.exit(1);
}

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(MONGODB_URI, {
      // Remove deprecated options, use default settings
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`📊 Database: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    console.error("❌ MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

