/**
 * Script to seed conversations and messages from existing users
 */

require("dotenv").config();
const connectDB = require("./db/connection");
const { User, Conversation, Message } = require("./mongodb-schemas");

async function seedConversations() {
  try {
    console.log("🔄 Connecting to MongoDB...");
    await connectDB();

    console.log("👥 Fetching users from database...");
    const users = await User.find().limit(10);
    
    if (users.length < 2) {
      console.log("⚠️  Need at least 2 users to create conversations");
      process.exit(0);
    }

    console.log(`✅ Found ${users.length} users`);

    // Get existing conversations count
    const existingConvCount = await Conversation.countDocuments();
    if (existingConvCount > 0) {
      console.log(`\n⚠️  ${existingConvCount} conversations already exist. Adding more...`);
    }

    console.log("\n💬 Creating conversations...");

    // Create conversations between users
    const conversations = [];
    const messages = [];

    // Create conversations between multiple user pairs
    // This ensures any logged-in user will see at least some conversations
    
    for (let i = 0; i < Math.min(users.length, 5); i++) {
      const user1 = users[i];
      // Create conversations with next 2-3 users (wrapping around if needed)
      const pairsToCreate = Math.min(3, users.length - 1);
      
      for (let j = 1; j <= pairsToCreate; j++) {
        const user2Index = (i + j) % users.length;
        if (user2Index === i) continue; // Skip self
        
        const user2 = users[user2Index];
        const conversationId = `conv_${user1.userId}_${user2.userId}_${Date.now()}_${i}_${j}`;
        
        // Check if conversation already exists
        const existing = await Conversation.findOne({ conversationId });
        if (existing) continue;
        
        const conversation = {
          conversationId: conversationId,
          participants: [
            {
              userId: user1.userId,
              joinedAt: new Date(),
              isArchived: false,
              isMuted: false,
            },
            {
              userId: user2.userId,
              joinedAt: new Date(),
              isArchived: false,
              isMuted: false,
            },
          ],
          type: "direct",
          createdBy: user1.userId,
          lastMessage: null,
          unreadCount: new Map(),
        };

        // Create some sample messages for this conversation
        const messageTexts = [
          `Hey ${user2.displayName}, how are you?`,
          `I wanted to discuss the project we talked about.`,
          `Are you available for a call later?`,
          `Thanks for your help with this!`,
          `Let me know when you're free.`,
          `That sounds great!`,
          `Looking forward to it.`,
        ];

        const conversationMessages = [];
        let lastMessage = null;

        // Create 3-5 messages per conversation
        const messageCount = Math.floor(Math.random() * 3) + 3;
        for (let k = 0; k < messageCount; k++) {
          const sender = k % 2 === 0 ? user2 : user1;
          const messageId = `msg_${conversationId}_${k}_${Date.now()}`;
          const timestamp = new Date(Date.now() - (messageCount - k) * 60 * 60 * 1000); // Messages spread over hours
          
          const message = {
            messageId: messageId,
            conversationId: conversationId,
            senderId: sender.userId,
            text: messageTexts[k % messageTexts.length],
            type: "text",
            status: "delivered",
            replyTo: null,
            deletedAt: null,
            reactions: [],
            createdAt: timestamp,
            updatedAt: timestamp,
          };

          conversationMessages.push(message);
          lastMessage = {
            messageId: messageId,
            text: message.text,
            senderId: sender.userId,
            timestamp: timestamp,
          };
        }

        conversation.lastMessage = lastMessage;
        // Random unread count for one of the participants
        const unreadFor = Math.random() > 0.5 ? user1.userId : user2.userId;
        conversation.unreadCount = new Map([[unreadFor, Math.floor(Math.random() * 5) + 1]]);

        conversations.push(conversation);
        messages.push(...conversationMessages);
      }
    }

    // Insert conversations
    console.log(`📝 Inserting ${conversations.length} conversations...`);
    for (const conv of conversations) {
      await Conversation.create(conv);
    }

    // Insert messages
    console.log(`📨 Inserting ${messages.length} messages...`);
    for (const msg of messages) {
      await Message.create(msg);
    }

    console.log("\n✨ Seeding completed successfully!");
    console.log(`📊 Summary:`);
    console.log(`   - Conversations created: ${conversations.length}`);
    console.log(`   - Messages created: ${messages.length}`);
    console.log(`\n🎉 Conversations are now available in the app!`);

    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding conversations:", error);
    process.exit(1);
  }
}

seedConversations();

