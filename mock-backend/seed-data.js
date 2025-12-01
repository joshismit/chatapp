/**
 * Script to seed dummy data into MongoDB
 * Usage: node seed-data.js <userId>
 */

require("dotenv").config();
const connectDB = require("./db/connection");
const { User, Conversation, Message } = require("./mongodb-schemas");

const userId = process.argv[2] || "user_1764149384784";

async function seedData() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await connectDB();

    console.log(`🌱 Seeding dummy data for user: ${userId}...`);

    // Get existing users from database (excluding current user)
    console.log("👥 Fetching users from database...");
    const existingUsers = await User.find({ userId: { $ne: userId } }).limit(
      10
    );

    if (existingUsers.length === 0) {
      console.log("⚠️  No users found in database. Please create users first.");
      process.exit(0);
    }

    console.log(`✅ Found ${existingUsers.length} users in database`);

    // Get existing conversations and messages from database
    console.log("💬 Fetching conversations from database...");
    const existingConversations = await Conversation.find({
      "participants.userId": userId,
    }).limit(10);

    // If no conversations exist, create them using existing users
    let conversationsToProcess = [];

    if (existingConversations.length === 0) {
      console.log(
        "📝 No conversations found. Creating conversations from existing users..."
      );

      // Get existing messages from database
      console.log("📨 Fetching messages from database...");
      const dbMessages = await Message.find().sort({ createdAt: -1 }).limit(10);

      for (let i = 0; i < Math.min(existingUsers.length, 10); i++) {
        const otherUser = existingUsers[i];
        const hoursAgo = (i + 1) * 2;

        // Get a message from database for this user, or use a default
        const userMessage = dbMessages.find(
          (msg) => msg.senderId === otherUser.userId
        );

        conversationsToProcess.push({
          conversationId: `conv_${i + 1}_${Date.now()}`,
          participants: [
            {
              userId: userId,
              joinedAt: new Date(),
              isArchived: false,
              isMuted: false,
            },
            {
              userId: otherUser.userId,
              joinedAt: new Date(),
              isArchived: false,
              isMuted: false,
            },
          ],
          type: "direct",
          createdBy: userId,
          lastMessage: {
            messageId: `msg_${i + 1}_${Date.now()}`,
            text: userMessage
              ? userMessage.text
              : `Hello from ${otherUser.displayName}`,
            senderId: otherUser.userId,
            timestamp: userMessage
              ? userMessage.createdAt
              : new Date(Date.now() - hoursAgo * 60 * 60 * 1000),
          },
          unreadCount: new Map(
            i % 3 === 0 ? [[userId, Math.floor(Math.random() * 5) + 1]] : []
          ),
        });
      }
    } else {
      console.log(
        `✅ Found ${existingConversations.length} existing conversations`
      );
      conversationsToProcess = existingConversations.map((conv) =>
        conv.toObject()
      );
    }

    // Create or update conversations
    console.log("💬 Processing conversations...");
    let createdCount = 0;
    let existingCount = 0;

    for (const convData of conversationsToProcess) {
      const existingConv = await Conversation.findOne({
        conversationId: convData.conversationId,
      });

      if (!existingConv) {
        await Conversation.findOneAndUpdate(
          { conversationId: convData.conversationId },
          convData,
          { upsert: true, new: true }
        );
        createdCount++;

        // Create a sample message for new conversations
        if (convData.lastMessage) {
          await Message.findOneAndUpdate(
            { messageId: convData.lastMessage.messageId },
            {
              messageId: convData.lastMessage.messageId,
              conversationId: convData.conversationId,
              senderId: convData.lastMessage.senderId,
              text: convData.lastMessage.text,
              type: "text",
              status: "delivered",
              createdAt: convData.lastMessage.timestamp,
              updatedAt: convData.lastMessage.timestamp,
            },
            { upsert: true, new: true }
          );
        }
      } else {
        existingCount++;
      }
    }

    // Get existing messages count for all conversations
    const conversationIds = conversationsToProcess.map((c) => c.conversationId);
    const existingMessages = await Message.find({
      conversationId: { $in: conversationIds },
    });

    console.log(`✅ Processed ${conversationsToProcess.length} conversations`);
    if (createdCount > 0) {
      console.log(`   - Created: ${createdCount}`);
    }
    if (existingCount > 0) {
      console.log(`   - Already existed: ${existingCount}`);
    }
    console.log(`   - Messages found: ${existingMessages.length}`);

    console.log("\n✨ Data processing completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Users found in database: ${existingUsers.length}`);
    console.log(
      `   - Conversations processed: ${conversationsToProcess.length}`
    );
    console.log(`   - Messages in database: ${existingMessages.length}`);
    console.log(`\n🎉 You can now see the chats in your app!`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding data:", error);
    process.exit(1);
  }
}

seedData();
