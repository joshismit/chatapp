/**
 * English translations
 */
export const en = {
  // Chat List
  chatList: {
    archive: 'Archive',
    unarchive: 'Unarchive',
    cancel: 'Cancel',
    chatWith: 'Chat with {name}',
    lastMessage: 'Last message: {message}',
    unreadMessages: '{count} unread messages',
    noUnread: 'No unread messages',
    timestamp: 'Last seen {time}',
  },
  // Chat Input
  chatInput: {
    placeholder: 'Type a message',
    sendButton: 'Send message',
    attachButton: 'Attach file',
    micButton: 'Record voice message',
    inputLabel: 'Message input',
  },
  // Message Bubble
  messageBubble: {
    sentMessage: 'Sent message: {text}',
    receivedMessage: 'Received message: {text}',
    timestamp: 'Sent at {time}',
    statusSending: 'Sending',
    statusSent: 'Sent',
    statusDelivered: 'Delivered',
    statusRead: 'Read',
    statusFailed: 'Failed to send',
    retryButton: 'Retry sending message',
  },
  // Chat Screen
  chatScreen: {
    online: 'online',
    typing: 'typing...',
    noMessages: 'No messages yet',
    startConversation: 'Start the conversation!',
    loadingOlder: 'Loading older messages...',
    backButton: 'Go back',
    videoCall: 'Start video call',
    voiceCall: 'Start voice call',
    moreOptions: 'More options',
  },
  // Date formatting
  date: {
    today: 'Today',
    yesterday: 'Yesterday',
  },
};

export type TranslationKey = keyof typeof en;

