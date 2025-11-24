import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  TextInput,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { ChatStackParamList } from '../navigation/navigationTypes';
import ChatItem, { ChatItemData } from '../components/chat-list/ChatItem';
import { listActiveConversations, archiveConversation } from '../services/storage';
import { loadConversation } from '../services/storage';

type ChatListScreenNavigationProp = StackNavigationProp<
  ChatStackParamList,
  'ChatList'
>;

// Mock data with WhatsApp-like styling
const mockChats: ChatItemData[] = [
  {
    id: '1',
    userName: 'John Doe',
    lastMessage: 'Hey, how are you doing today?',
    timestamp: '2:30 PM',
    unreadCount: 2,
    avatarColor: '#25D366',
  },
  {
    id: '2',
    userName: 'Jane Smith',
    lastMessage: 'See you tomorrow at the meeting!',
    timestamp: '1:15 PM',
    avatarColor: '#128C7E',
  },
  {
    id: '3',
    userName: 'Bob Johnson',
    lastMessage: 'Thanks for the help with the project',
    timestamp: '12:00 PM',
    unreadCount: 1,
    avatarColor: '#34B7F1',
  },
  {
    id: '4',
    userName: 'Alice Williams',
    lastMessage: 'Are you free tonight for dinner?',
    timestamp: 'Yesterday',
    avatarColor: '#F55376',
  },
  {
    id: '5',
    userName: 'Charlie Brown',
    lastMessage: 'Great meeting today, let\'s follow up',
    timestamp: 'Yesterday',
    avatarColor: '#FF6B6B',
  },
  {
    id: '6',
    userName: 'Diana Prince',
    lastMessage: 'The files have been uploaded',
    timestamp: 'Monday',
    unreadCount: 5,
    avatarColor: '#9B59B6',
  },
  {
    id: '7',
    userName: 'Emma Watson',
    lastMessage: 'Can we reschedule?',
    timestamp: 'Monday',
    avatarColor: '#E67E22',
  },
  {
    id: '8',
    userName: 'Frank Miller',
    lastMessage: 'Looking forward to working together',
    timestamp: 'Sunday',
    avatarColor: '#3498DB',
  },
  {
    id: '9',
    userName: 'Grace Kelly',
    lastMessage: 'The presentation is ready',
    timestamp: 'Sunday',
    unreadCount: 3,
    avatarColor: '#E74C3C',
  },
  {
    id: '10',
    userName: 'Henry Ford',
    lastMessage: 'Thanks for your help!',
    timestamp: 'Saturday',
    avatarColor: '#16A085',
  },
];

export default function ChatListScreen() {
  const navigation = useNavigation<ChatListScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [chats, setChats] = useState<ChatItemData[]>([]);

  const loadConversations = useCallback(async () => {
    try {
      setRefreshing(true);
      const activeConversations = await listActiveConversations();
      
      // Convert metadata to chat items
      const chatItems: ChatItemData[] = await Promise.all(
        activeConversations.map(async (conv) => {
          const messages = await loadConversation(conv.conversationId);
          const lastMessage = messages[0]; // Newest message
          
          // Extract user name from conversationId or use a default
          // In a real app, you'd have a user mapping
          const userName = conv.conversationId.split('_')[0] || 'Unknown User';
          
          return {
            id: conv.conversationId,
            userName: userName.charAt(0).toUpperCase() + userName.slice(1),
            lastMessage: conv.lastMessage || lastMessage?.text || 'No messages',
            timestamp: conv.lastMessageTime
              ? new Date(conv.lastMessageTime).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })
              : 'Now',
            unreadCount: conv.unreadCount,
            avatarColor: '#25D366',
          };
        })
      );

      // If no conversations, use mock data for preview
      if (chatItems.length === 0) {
        setChats(mockChats);
      } else {
        setChats(chatItems);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Fallback to mock data
      setChats(mockChats);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadConversations();
  }, [loadConversations]);

  const handleChatPress = useCallback(
    (conversationId: string) => {
      const chat = chats.find((c) => c.id === conversationId);
      navigation.navigate('ChatScreen', {
        chatId: conversationId,
        conversationId: conversationId,
        userName: chat?.userName,
      });
    },
    [navigation, chats]
  );

  const handleArchive = useCallback(
    async (conversationId: string) => {
      try {
        await archiveConversation(conversationId);
        // Reload conversations to remove archived one
        await loadConversations();
      } catch (error) {
        console.error('Error archiving conversation:', error);
      }
    },
    [loadConversations]
  );

  const handleRefresh = useCallback(() => {
    loadConversations();
  }, [loadConversations]);

  const filteredChats = chats.filter((chat) =>
    chat.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    chat.lastMessage.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderChatItem: ListRenderItem<ChatItemData> = ({ item }) => {
    return (
      <ChatItem
        item={item}
        onPress={handleChatPress}
        onArchive={handleArchive}
      />
    );
  };

  const renderSeparator = () => <View style={styles.separator} />;

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search or start new chat"
          placeholderTextColor="#667781"
          value={searchQuery}
          onChangeText={setSearchQuery}
          autoCapitalize="none"
          autoCorrect={false}
        />
      </View>
      <FlatList
        data={filteredChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={renderSeparator}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            tintColor="#25D366"
            colors={['#25D366']}
          />
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  searchContainer: {
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E4E6EB',
  },
  searchInput: {
    backgroundColor: '#fff',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    color: '#000',
  },
  listContent: {
    paddingTop: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#E4E6EB',
    marginLeft: 84,
  },
});
