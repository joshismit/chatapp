/**
 * Script to seed dummy data into MongoDB
 * Usage: node scripts/seedData.js <userId>
 */

require("dotenv").config();
const connectDB = require("../config/database");
const { User } = require("../models");

const userId = process.argv[2] || "user_1764149384784";

async function seedData() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await connectDB();

    console.log(`🌱 Seeding dummy data for user: ${userId}...`);

    // Dummy users
    const dummyUsers = [
      { userId: "user_john", displayName: "John Doe", avatar: null },
      { userId: "user_jane", displayName: "Jane Smith", avatar: null },
      { userId: "user_bob", displayName: "Bob Johnson", avatar: null },
      { userId: "user_alice", displayName: "Alice Williams", avatar: null },
      { userId: "user_charlie", displayName: "Charlie Brown", avatar: null },
      { userId: "user_diana", displayName: "Diana Prince", avatar: null },
      { userId: "user_emma", displayName: "Emma Watson", avatar: null },
      { userId: "user_frank", displayName: "Frank Miller", avatar: null },
      { userId: "user_grace", displayName: "Grace Kelly", avatar: null },
      { userId: "user_henry", displayName: "Henry Ford", avatar: null },
    ];

    // Create or update dummy users
    for (const userData of dummyUsers) {
      await User.findOneAndUpdate({ userId: userData.userId }, userData, {
        upsert: true,
        new: true,
      });
    }

    console.log(`✅ Created/Updated ${dummyUsers.length} dummy users`);
    console.log("\n✨ Data seeding completed successfully!");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seedData();

