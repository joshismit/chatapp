/**
 * Quick script to generate a login token
 * Usage: node generate-token.js [userId]
 */

require("dotenv").config();
const connectDB = require("./db/connection");
const { User, AuthToken } = require("./mongodb-schemas");

async function generateToken() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await connectDB();

    const userId = process.argv[2] || `user_${Date.now()}`;
    
    // Generate a unique token
    const token = `test_token_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
    
    console.log(`\n👤 Creating/updating user: ${userId}`);
    
    // Create or get user
    let user = await User.findOne({ userId });
    
    if (!user) {
      user = await User.create({
        userId: userId,
        displayName: `User ${userId}`,
        isOnline: true,
        lastSeen: new Date(),
      });
      console.log(`✅ Created new user`);
    } else {
      console.log(`✅ User already exists`);
    }
    
    // Create auth token record
    const authToken = await AuthToken.create({
      token: token,
      userId: user.userId,
      type: "jwt",
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      usedAt: new Date(),
    });
    
    console.log(`\n✨ Token generated successfully!`);
    console.log(`\n📋 Login Details:`);
    console.log(`   Token: ${token}`);
    console.log(`   User ID: ${user.userId}`);
    console.log(`   Expires: ${authToken.expiresAt.toISOString()}`);
    console.log(`\n🔗 Use this token to login:`);
    console.log(`   POST http://localhost:3000/api/login`);
    console.log(`   Body: { "token": "${token}" }`);
    console.log(`\n💡 Or use it in your app's login screen!`);
    
    process.exit(0);
  } catch (error) {
    console.error("❌ Error generating token:", error);
    process.exit(1);
  }
}

generateToken();

