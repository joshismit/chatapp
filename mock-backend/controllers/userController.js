/**
 * User Controller
 * Handles user-related operations
 */

const { User } = require("../models");

/**
 * Seed dummy data endpoint
 */
const seedDummyData = async (req, res) => {
  try {
    const { userId } = req.body;

    if (!userId) {
      return res.status(400).json({
        success: false,
        message: "userId is required",
      });
    }

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

    res.status(200).json({
      success: true,
      message: `Dummy users seeded successfully`,
      usersCreated: dummyUsers.length,
    });
  } catch (error) {
    console.error("Error seeding dummy data:", error);
    res.status(500).json({
      success: false,
      message: "Failed to seed dummy data",
    });
  }
};

module.exports = {
  seedDummyData,
};

