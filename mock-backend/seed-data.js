/**
 * Script to seed dummy data into MongoDB
 * Usage: node seed-data.js <userId>
 */

require('dotenv').config();
const connectDB = require('./db/connection');
const { User, Conversation, Message } = require('./mongodb-schemas');

const userId = process.argv[2] || 'user_1764149384784';

async function seedData() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await connectDB();

    console.log(`🌱 Seeding dummy data for user: ${userId}...`);

    // Dummy users
    const dummyUsers = [
      { userId: 'user_john', displayName: 'John Doe', avatar: null },
      { userId: 'user_jane', displayName: 'Jane Smith', avatar: null },
      { userId: 'user_bob', displayName: 'Bob Johnson', avatar: null },
      { userId: 'user_alice', displayName: 'Alice Williams', avatar: null },
      { userId: 'user_charlie', displayName: 'Charlie Brown', avatar: null },
      { userId: 'user_diana', displayName: 'Diana Prince', avatar: null },
      { userId: 'user_emma', displayName: 'Emma Watson', avatar: null },
      { userId: 'user_frank', displayName: 'Frank Miller', avatar: null },
      { userId: 'user_grace', displayName: 'Grace Kelly', avatar: null },
      { userId: 'user_henry', displayName: 'Henry Ford', avatar: null },
    ];

    // Create or update dummy users
    console.log('👥 Creating users...');
    for (const userData of dummyUsers) {
      await User.findOneAndUpdate(
        { userId: userData.userId },
        userData,
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Created ${dummyUsers.length} users`);

    // Dummy conversations with messages
    const dummyConversations = [
      {
        conversationId: 'conv_1',
        participants: [
          { userId: userId, joinedAt: new Date(), isArchived: false, isMuted: false },
          { userId: 'user_john', joinedAt: new Date(), isArchived: false, isMuted: false }
        ],
        type: 'direct',
        createdBy: userId,
        lastMessage: {
          messageId: 'msg_1_1',
          text: 'Hey, how are you doing today?',
          senderId: 'user_john',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000)
        },
        unreadCount: new Map([[userId, 2]])
      },
      {
        conversationId: 'conv_2',
        participants: [
          { userId: userId, joinedAt: new Date(), isArchived: false, isMuted: false },
          { userId: 'user_jane', joinedAt: new Date(), isArchived: false, isMuted: false }
        ],
        type: 'direct',
        createdBy: userId,
        lastMessage: {
          messageId: 'msg_2_1',
          text: 'See you tomorrow at the meeting!',
          senderId: 'user_jane',
          timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000)
        },
        unreadCount: new Map()
      },
      {
        conversationId: 'conv_3',
        participants: [
          { userId: userId, joinedAt: new Date(), isArchived: false, isMuted: false },
          { userId: 'user_bob', joinedAt: new Date(), isArchived: false, isMuted: false }
        ],
        type: 'direct',
        createdBy: userId,
        lastMessage: {
          messageId: 'msg_3_1',
          text: 'Thanks for the help with the project',
          senderId: 'user_bob',
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000)
        },
        unreadCount: new Map([[userId, 1]])
      },
      {
        conversationId: 'conv_4',
        participants: [
          { userId: userId, joinedAt: new Date(), isArchived: false, isMuted: false },
          { userId: 'user_alice', joinedAt: new Date(), isArchived: false, isMuted: false }
        ],
        type: 'direct',
        createdBy: userId,
        lastMessage: {
          messageId: 'msg_4_1',
          text: 'Are you free tonight for dinner?',
          senderId: 'user_alice',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000)
        },
        unreadCount: new Map()
      },
      {
        conversationId: 'conv_5',
        participants: [
          { userId: userId, joinedAt: new Date(), isArchived: false, isMuted: false },
          { userId: 'user_charlie', joinedAt: new Date(), isArchived: false, isMuted: false }
        ],
        type: 'direct',
        createdBy: userId,
        lastMessage: {
          messageId: 'msg_5_1',
          text: 'Great meeting today, let\'s follow up',
          senderId: 'user_charlie',
          timestamp: new Date(Date.now() - 25 * 60 * 60 * 1000)
        },
        unreadCount: new Map()
      },
      {
        conversationId: 'conv_6',
        participants: [
          { userId: userId, joinedAt: new Date(), isArchived: false, isMuted: false },
          { userId: 'user_diana', joinedAt: new Date(), isArchived: false, isMuted: false }
        ],
        type: 'direct',
        createdBy: userId,
        lastMessage: {
          messageId: 'msg_6_1',
          text: 'The files have been uploaded',
          senderId: 'user_diana',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        unreadCount: new Map([[userId, 5]])
      },
      {
        conversationId: 'conv_7',
        participants: [
          { userId: userId, joinedAt: new Date(), isArchived: false, isMuted: false },
          { userId: 'user_emma', joinedAt: new Date(), isArchived: false, isMuted: false }
        ],
        type: 'direct',
        createdBy: userId,
        lastMessage: {
          messageId: 'msg_7_1',
          text: 'Can we reschedule?',
          senderId: 'user_emma',
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        },
        unreadCount: new Map()
      },
      {
        conversationId: 'conv_8',
        participants: [
          { userId: userId, joinedAt: new Date(), isArchived: false, isMuted: false },
          { userId: 'user_frank', joinedAt: new Date(), isArchived: false, isMuted: false }
        ],
        type: 'direct',
        createdBy: userId,
        lastMessage: {
          messageId: 'msg_8_1',
          text: 'Looking forward to working together',
          senderId: 'user_frank',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        unreadCount: new Map()
      },
      {
        conversationId: 'conv_9',
        participants: [
          { userId: userId, joinedAt: new Date(), isArchived: false, isMuted: false },
          { userId: 'user_grace', joinedAt: new Date(), isArchived: false, isMuted: false }
        ],
        type: 'direct',
        createdBy: userId,
        lastMessage: {
          messageId: 'msg_9_1',
          text: 'The presentation is ready',
          senderId: 'user_grace',
          timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
        },
        unreadCount: new Map([[userId, 3]])
      },
      {
        conversationId: 'conv_10',
        participants: [
          { userId: userId, joinedAt: new Date(), isArchived: false, isMuted: false },
          { userId: 'user_henry', joinedAt: new Date(), isArchived: false, isMuted: false }
        ],
        type: 'direct',
        createdBy: userId,
        lastMessage: {
          messageId: 'msg_10_1',
          text: 'Thanks for your help!',
          senderId: 'user_henry',
          timestamp: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000)
        },
        unreadCount: new Map()
      },
    ];

    // Create conversations
    console.log('💬 Creating conversations...');
    for (const convData of dummyConversations) {
      await Conversation.findOneAndUpdate(
        { conversationId: convData.conversationId },
        convData,
        { upsert: true, new: true }
      );

      // Create a sample message for each conversation
      await Message.findOneAndUpdate(
        { messageId: convData.lastMessage.messageId },
        {
          messageId: convData.lastMessage.messageId,
          conversationId: convData.conversationId,
          senderId: convData.lastMessage.senderId,
          text: convData.lastMessage.text,
          type: 'text',
          status: 'delivered',
          createdAt: convData.lastMessage.timestamp,
          updatedAt: convData.lastMessage.timestamp
        },
        { upsert: true, new: true }
      );
    }
    console.log(`✅ Created ${dummyConversations.length} conversations with messages`);

    console.log('\n✨ Dummy data seeded successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users created: ${dummyUsers.length}`);
    console.log(`   - Conversations created: ${dummyConversations.length}`);
    console.log(`   - Messages created: ${dummyConversations.length}`);
    console.log(`\n🎉 You can now see the chats in your app!`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding data:', error);
    process.exit(1);
  }
}

seedData();

