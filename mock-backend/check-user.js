/**
 * Script to check if a user exists in the database
 * Usage: node check-user.js <email> or <phoneNumber>
 */

require("dotenv").config();
const connectDB = require("./config/database");
const { User } = require("./models");

const email = "sjstriker94@gmail.com";
const phoneNumber = "+9033868859";
const firstName = "Smit";
const lastName = "Joshi";

async function checkUser() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await connectDB();

    console.log("\n🔍 Searching for user with:");
    console.log(`   Email: ${email}`);
    console.log(`   Phone: ${phoneNumber}`);
    console.log(`   Name: ${firstName} ${lastName}`);

    // Search by email
    const userByEmail = await User.findOne({ email: email.toLowerCase().trim() }).select("+password");
    
    // Search by phone
    const userByPhone = await User.findOne({ phoneNumber: phoneNumber });

    // Search by name
    const userByName = await User.findOne({ 
      firstName: firstName.trim(),
      lastName: lastName.trim()
    }).select("+password");

    console.log("\n" + "=".repeat(60));
    console.log("📊 SEARCH RESULTS");
    console.log("=".repeat(60));

    if (userByEmail) {
      console.log("\n✅ USER FOUND BY EMAIL:");
      console.log(JSON.stringify({
        userId: userByEmail.userId,
        firstName: userByEmail.firstName,
        lastName: userByEmail.lastName,
        email: userByEmail.email,
        phoneNumber: userByEmail.phoneNumber,
        displayName: userByEmail.displayName,
        isRegistered: userByEmail.isRegistered,
        registrationMethod: userByEmail.registrationMethod,
        password: userByEmail.password ? "***HASHED***" : "NOT SET",
        createdAt: userByEmail.createdAt,
        updatedAt: userByEmail.updatedAt,
      }, null, 2));
    } else {
      console.log("\n❌ USER NOT FOUND BY EMAIL");
    }

    if (userByPhone) {
      console.log("\n✅ USER FOUND BY PHONE:");
      console.log(JSON.stringify({
        userId: userByPhone.userId,
        firstName: userByPhone.firstName,
        lastName: userByPhone.lastName,
        email: userByPhone.email,
        phoneNumber: userByPhone.phoneNumber,
        displayName: userByPhone.displayName,
        isRegistered: userByPhone.isRegistered,
        registrationMethod: userByPhone.registrationMethod,
        createdAt: userByPhone.createdAt,
        updatedAt: userByPhone.updatedAt,
      }, null, 2));
    } else {
      console.log("\n❌ USER NOT FOUND BY PHONE");
    }

    if (userByName && userByName.email === email.toLowerCase().trim()) {
      console.log("\n✅ USER FOUND BY NAME (matches email):");
      console.log(JSON.stringify({
        userId: userByName.userId,
        firstName: userByName.firstName,
        lastName: userByName.lastName,
        email: userByName.email,
        phoneNumber: userByName.phoneNumber,
        displayName: userByName.displayName,
        isRegistered: userByName.isRegistered,
        registrationMethod: userByName.registrationMethod,
        createdAt: userByName.createdAt,
        updatedAt: userByName.updatedAt,
      }, null, 2));
    } else if (userByName) {
      console.log("\n⚠️  USER FOUND BY NAME (but different email):");
      console.log(JSON.stringify({
        userId: userByName.userId,
        firstName: userByName.firstName,
        lastName: userByName.lastName,
        email: userByName.email,
        phoneNumber: userByName.phoneNumber,
      }, null, 2));
    } else {
      console.log("\n❌ USER NOT FOUND BY NAME");
    }

    // Check all users with similar email/phone
    console.log("\n" + "=".repeat(60));
    console.log("📋 ALL USERS WITH SIMILAR DATA");
    console.log("=".repeat(60));

    const allUsers = await User.find({
      $or: [
        { email: { $regex: email.split("@")[0], $options: "i" } },
        { phoneNumber: { $regex: phoneNumber.slice(-4), $options: "i" } },
        { firstName: { $regex: firstName, $options: "i" } },
        { lastName: { $regex: lastName, $options: "i" } },
      ]
    }).limit(10);

    if (allUsers.length > 0) {
      console.log(`\nFound ${allUsers.length} user(s) with similar data:\n`);
      allUsers.forEach((user, index) => {
        console.log(`${index + 1}. ${user.displayName} (${user.userId})`);
        console.log(`   Email: ${user.email || "N/A"}`);
        console.log(`   Phone: ${user.phoneNumber || "N/A"}`);
        console.log(`   Registered: ${user.isRegistered ? "Yes" : "No"}`);
        console.log("");
      });
    } else {
      console.log("\n❌ No users found with similar data");
    }

    // Summary
    console.log("\n" + "=".repeat(60));
    console.log("📝 SUMMARY");
    console.log("=".repeat(60));
    
    if (userByEmail || userByPhone) {
      console.log("\n✅ USER EXISTS IN DATABASE");
      const foundUser = userByEmail || userByPhone;
      console.log(`   User ID: ${foundUser.userId}`);
      console.log(`   Registered: ${foundUser.isRegistered ? "Yes" : "No"}`);
      console.log(`   Created: ${foundUser.createdAt}`);
    } else {
      console.log("\n❌ USER DOES NOT EXIST IN DATABASE");
      console.log("   This user has not been registered yet.");
    }

    process.exit(0);
  } catch (error) {
    console.error("❌ Error checking user:", error);
    process.exit(1);
  }
}

checkUser();

