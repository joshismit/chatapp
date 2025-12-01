import React, { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  ListRenderItem,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ChatStackParamList } from '../types/navigation';
import { listArchivedConversations, unarchiveConversation } from '../services/storage';
import { ConversationMetadata } from '../types/message';
import { loadConversation } from '../services/storage';

type ArchivedScreenNavigationProp = StackNavigationProp<
  ChatStackParamList,
  'ChatList'
>;

interface ArchivedChatItem {
  conversationId: string;
  userName: string;
  lastMessage?: string;
  timestamp?: string;
  unreadCount?: number;
}

export default function ArchivedScreen() {
  const navigation = useNavigation<ArchivedScreenNavigationProp>();
  const [archivedChats, setArchivedChats] = useState<ArchivedChatItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadArchivedConversations = useCallback(async () => {
    try {
      setLoading(true);
      const archived = await listArchivedConversations();
      
      // Convert metadata to chat items
      const chatItems: ArchivedChatItem[] = await Promise.all(
        archived.map(async (conv) => {
          // Try to get user name from messages or use conversationId
          const messages = await loadConversation(conv.conversationId);
          const lastMessage = messages[0]; // Newest message
          
          // Extract user name from conversationId or use a default
          // In a real app, you'd have a user mapping
          const userName = conv.conversationId.split('_')[0] || 'Unknown User';
          
          return {
            conversationId: conv.conversationId,
            userName: userName.charAt(0).toUpperCase() + userName.slice(1),
            lastMessage: conv.lastMessage || lastMessage?.text || 'No messages',
            timestamp: conv.lastMessageTime
              ? new Date(conv.lastMessageTime).toLocaleTimeString('en-US', {
                  hour: 'numeric',
                  minute: '2-digit',
                  hour12: true,
                })
              : undefined,
            unreadCount: conv.unreadCount,
          };
        })
      );

      setArchivedChats(chatItems);
    } catch (error) {
      console.error('Error loading archived conversations:', error);
      setArchivedChats([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadArchivedConversations();
  }, [loadArchivedConversations]);

  const handleUnarchive = useCallback(
    async (conversationId: string) => {
      try {
        await unarchiveConversation(conversationId);
        // Reload archived conversations
        await loadArchivedConversations();
      } catch (error) {
        console.error('Error unarchiving conversation:', error);
      }
    },
    [loadArchivedConversations]
  );

  const handleChatPress = useCallback(
    (conversationId: string) => {
      const chat = archivedChats.find((c) => c.conversationId === conversationId);
      navigation.navigate('ChatScreen', {
        chatId: conversationId,
        conversationId: conversationId,
        userName: chat?.userName,
      });
    },
    [navigation, archivedChats]
  );

  const renderChatItem: ListRenderItem<ArchivedChatItem> = ({ item }) => {
    const avatarInitial = item.userName.charAt(0).toUpperCase();
    const avatarColor = '#667781'; // Gray for archived

    return (
      <TouchableOpacity
        style={styles.chatItem}
        onPress={() => handleChatPress(item.conversationId)}
        activeOpacity={0.7}
      >
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text style={styles.userName} numberOfLines={1}>
              {item.userName}
            </Text>
            {item.timestamp && (
              <Text style={styles.timestamp}>{item.timestamp}</Text>
            )}
          </View>
          <View style={styles.messageRow}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.lastMessage}
            </Text>
            <TouchableOpacity
              style={styles.unarchiveButton}
              onPress={() => handleUnarchive(item.conversationId)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="archive" size={20} color="#25D366" />
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  if (loading && archivedChats.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.loadingText}>Loading archived chats...</Text>
        </View>
      </View>
    );
  }

  if (archivedChats.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.icon}>📦</Text>
          <Text style={styles.title}>Archived Chats</Text>
          <Text style={styles.subtitle}>
            Your archived conversations will appear here
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={archivedChats}
        renderItem={renderChatItem}
        keyExtractor={(item) => item.conversationId}
        contentContainerStyle={styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={loadArchivedConversations}
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
  listContent: {
    paddingTop: 4,
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    minHeight: 72,
  },
  avatarContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 13,
    color: '#667781',
    fontWeight: '400',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: '#667781',
    flex: 1,
    marginRight: 8,
  },
  unarchiveButton: {
    padding: 4,
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
    paddingHorizontal: 32,
  },
  icon: {
    fontSize: 64,
    marginBottom: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#667781',
  },
});
