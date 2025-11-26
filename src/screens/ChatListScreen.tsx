import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
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
import { getConversations } from '../services/api/conversationService';
import { seedDataAfterLogin } from '../utils/seedDataHelper';
import AsyncStorage from '@react-native-async-storage/async-storage';

type ChatListScreenNavigationProp = StackNavigationProp<
  ChatStackParamList,
  'ChatList'
>;

// Mock data removed - now fetching from API

export default function ChatListScreen() {
  const navigation = useNavigation<ChatListScreenNavigationProp>();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [chats, setChats] = useState<ChatItemData[]>([]);

  const loadConversations = useCallback(async () => {
    try {
      setRefreshing(true);
      
      // Get current user ID from storage (set after login)
      const currentUserId = await AsyncStorage.getItem('currentUserId');
      
      if (!currentUserId) {
        console.warn('No user ID found, conversations cannot be loaded');
        setChats([]);
        return;
      }

      // Fetch conversations from API
      const response = await getConversations(currentUserId);
      
      if (response.success && response.conversations) {
        // Convert API response to chat items
        const chatItems: ChatItemData[] = response.conversations.map((conv) => {
          // Get the other participant (not current user)
          const otherParticipant = conv.participants.find(p => p.userId !== currentUserId);
          const participantUserId = otherParticipant?.userId || '';
          
          // Extract display name from participant or use userId
          const userName = otherParticipant?.displayName || 
                          participantUserId.replace('user_', '').replace(/_/g, ' ')
                          .split(' ')
                          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                          .join(' ') || 'Unknown User';
          
          // Format timestamp
          let timestamp = 'Now';
          if (conv.lastMessage?.timestamp) {
            const messageDate = new Date(conv.lastMessage.timestamp);
            const now = new Date();
            const diffMs = now.getTime() - messageDate.getTime();
            const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
            
            if (diffDays === 0) {
              timestamp = messageDate.toLocaleTimeString('en-US', {
                hour: 'numeric',
                minute: '2-digit',
                hour12: true,
              });
            } else if (diffDays === 1) {
              timestamp = 'Yesterday';
            } else if (diffDays < 7) {
              timestamp = messageDate.toLocaleDateString('en-US', { weekday: 'short' });
            } else {
              timestamp = messageDate.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric'
              });
            }
          }
          
          return {
            id: conv.conversationId,
            userName: userName,
            lastMessage: conv.lastMessage?.text || 'No messages',
            timestamp: timestamp,
            unreadCount: conv.unreadCount || 0,
            avatarColor: '#25D366',
          };
        });
        
        setChats(chatItems);
      } else {
        setChats([]);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setChats([]);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    // Check if data has been seeded, if not, seed it
    const checkAndSeedData = async () => {
      const dataSeeded = await AsyncStorage.getItem('dataSeeded');
      if (!dataSeeded) {
        await seedDataAfterLogin();
        await AsyncStorage.setItem('dataSeeded', 'true');
      }
      loadConversations();
    };
    
    checkAndSeedData();
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
      {filteredChats.length === 0 && !refreshing ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No conversations yet</Text>
          <Text style={styles.emptySubtext}>
            Pull down to refresh or start a new chat
          </Text>
        </View>
      ) : (
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
      )}
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
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 20,
    fontWeight: '600',
    color: '#000',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 16,
    color: '#667781',
    textAlign: 'center',
  },
});
