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
import { ChatStackParamList } from '../../types/navigation';
import { MessageBubble, Message, ChatInput, TypingIndicator } from '../../components/chat';
import { useConversation } from '../../hooks/useConversation';
import { getDateLabel } from '../../utils/dateFormatter';

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
        onRetry={item.status === 'failed' ? () => handleRetryMessage(item) : undefined}
      />
    ),
    [handleRetryMessage]
  );

  const renderDateSeparator = useCallback((dateLabel: string) => {
    return (
      <View style={styles.dateSeparator}>
        <Text style={styles.dateSeparatorText}>{dateLabel}</Text>
      </View>
    );
  }, []);

  const renderItem = useCallback(
    ({ item }: { item: MessageWithDate }) => {
      return (
        <View>
          {item.showDateSeparator && item.dateLabel && renderDateSeparator(item.dateLabel)}
          {renderMessage({ item })}
        </View>
      );
    },
    [renderMessage, renderDateSeparator]
  );

  const renderHeader = useCallback(() => {
    if (status.loadingOlder) {
      return (
        <View style={styles.loadingHeader}>
          <ActivityIndicator size="small" color="#6200ee" />
        </View>
      );
    }
    return null;
  }, [status.loadingOlder]);

  const handleLoadOlder = useCallback(() => {
    if (!status.loadingOlder && status.hasMoreMessages) {
      loadOlder();
    }
  }, [status.loadingOlder, status.hasMoreMessages, loadOlder]);

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <View style={styles.headerInfo}>
          <Text style={styles.headerTitle}>{userName || 'Chat'}</Text>
          <Text style={styles.headerSubtitle}>Online</Text>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </View>

      {status.loading && messages.length === 0 ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#6200ee" />
        </View>
      ) : (
        <FlatList
          ref={flatListRef}
          data={messagesWithDates}
          renderItem={renderItem}
          keyExtractor={(item) => item.id}
          inverted
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={renderHeader}
          onEndReached={handleLoadOlder}
          onEndReachedThreshold={0.5}
          showsVerticalScrollIndicator={false}
          maintainVisibleContentPosition={{
            minIndexForVisible: 0,
          }}
        />
      )}

      {isTyping && (
        <View style={styles.typingContainer}>
          <TypingIndicator />
        </View>
      )}

      <ChatInput
        onSend={handleSendMessage}
        onAttach={handleAttachPress}
        disabled={status.loading}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#6200ee',
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingTop: Platform.OS === 'ios' ? 50 : 12,
  },
  backButton: {
    marginRight: 16,
  },
  headerInfo: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#fff',
    opacity: 0.8,
  },
  moreButton: {
    marginLeft: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    paddingVertical: 16,
    paddingHorizontal: 16,
  },
  dateSeparator: {
    alignItems: 'center',
    marginVertical: 16,
  },
  dateSeparatorText: {
    fontSize: 12,
    color: '#667781',
    backgroundColor: '#F0F2F5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  loadingHeader: {
    paddingVertical: 16,
    alignItems: 'center',
  },
  typingContainer: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
});

