import React, { useRef, useCallback, useState, useMemo } from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { ChatStackParamList } from '../navigation/navigationTypes';
import MessageBubble, { Message } from '../components/chat/MessageBubble';
import ChatInput from '../components/chat/ChatInput';
import TypingIndicator from '../components/chat/TypingIndicator';
import { useConversation } from '../hooks/useConversation';
import { getDateLabel } from '../utils/dateFormatter';

type ChatScreenRouteProp = RouteProp<ChatStackParamList, 'ChatScreen'>;
type ChatScreenNavigationProp = StackNavigationProp<ChatStackParamList, 'ChatScreen'>;

const CURRENT_USER_ID = 'current_user'; // Replace with actual user ID from auth

interface MessageWithDate extends Message {
  dateLabel?: string;
  showDateSeparator?: boolean;
}

export default function ChatScreen() {
  const route = useRoute<ChatScreenRouteProp>();
  const navigation = useNavigation<ChatScreenNavigationProp>();
  const flatListRef = useRef<FlatList>(null);
  const { chatId, conversationId, userName } = route.params;
  const conversationIdToUse = conversationId || chatId;
  const [isTyping, setIsTyping] = useState(false);

  // Use conversation hook - handles all logic internally
  const {
    messages,
    status,
    sendMessage,
    retryMessage,
    loadOlder,
  } = useConversation({
    conversationId: conversationIdToUse,
    senderId: CURRENT_USER_ID,
    token: undefined, // TODO: Get token from auth service
  });

  // Add date labels to messages for grouping
  const messagesWithDates = useMemo((): MessageWithDate[] => {
    return messages.map((msg, index) => {
      const previousMsg = index > 0 ? messages[index - 1] : undefined;
      const currentTimestamp = msg.createdAt || new Date().toISOString();
      const previousTimestamp = previousMsg?.createdAt;

      const dateLabel = getDateLabel(currentTimestamp, previousTimestamp);
      return {
        ...msg,
        dateLabel: dateLabel || undefined,
        showDateSeparator: !!dateLabel,
      };
    });
  }, [messages]);

  // Handle send message
  const handleSendMessage = useCallback(
    async (text: string) => {
      const result = await sendMessage(text);
      if (!result.success && result.error) {
        console.error('Failed to send message:', result.error);
        // Optionally show error toast/alert
      }
    },
    [sendMessage]
  );

  // Handle retry failed message
  const handleRetryMessage = useCallback(
    async (message: Message) => {
      const result = await retryMessage(message);
      if (!result.success && result.error) {
        console.error('Failed to retry message:', result.error);
        // Optionally show error toast/alert
      }
    },
    [retryMessage]
  );

  const handleAttachPress = useCallback(() => {
    // Handle attach functionality
    console.log('Attach pressed');
  }, []);

  const renderMessage = useCallback(
    ({ item }: { item: MessageWithDate }) => (
      <MessageBubble
        message={item}
        onRetry={handleRetryMessage}
        showDateSeparator={item.showDateSeparator}
        dateLabel={item.dateLabel}
      />
    ),
    [handleRetryMessage]
  );

  const renderHeader = () => (
    <View style={styles.header}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.goBack()}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color="#fff" />
      </TouchableOpacity>
      <View style={styles.headerContent}>
        <Text style={styles.headerTitle} numberOfLines={1}>
          {userName || 'Chat'}
        </Text>
        <Text style={styles.headerSubtitle}>
          {isTyping ? 'typing...' : 'online'}
        </Text>
      </View>
      <View style={styles.headerActions}>
        <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
          <Ionicons name="videocam-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
          <Ionicons name="call-outline" size={24} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.headerButton} activeOpacity={0.7}>
          <Ionicons name="ellipsis-vertical-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  if (status.loading) {
    return (
      <View style={styles.container}>
        {renderHeader()}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#25D366" />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messagesWithDates}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
          onEndReached={loadOlder}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>No messages yet</Text>
              <Text style={styles.emptySubtext}>Start the conversation!</Text>
            </View>
          }
          ListHeaderComponent={
            <>
              {isTyping && <TypingIndicator isVisible={isTyping} />}
              {status.loadingOlder ? (
                <View style={styles.loadingOlderContainer}>
                  <ActivityIndicator size="small" color="#25D366" />
                  <Text style={styles.loadingOlderText}>Loading older messages...</Text>
                </View>
              ) : null}
            </>
          }
        />
        <ChatInput
          onSendMessage={handleSendMessage}
          onAttachPress={handleAttachPress}
        />
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ECE5DD',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#075E54',
    paddingHorizontal: 8,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
    borderBottomWidth: 1,
    borderBottomColor: '#054D44',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
    borderRadius: 20,
  },
  headerContent: {
    flex: 1,
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
    letterSpacing: 0.1,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.9)',
    fontWeight: '400',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    borderRadius: 20,
  },
  keyboardView: {
    flex: 1,
  },
  listContent: {
    paddingVertical: 8,
    paddingHorizontal: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ECE5DD',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#667781',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#999',
  },
  loadingOlderContainer: {
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  loadingOlderText: {
    fontSize: 13,
    color: '#667781',
    marginLeft: 8,
    fontWeight: '400',
  },
});
