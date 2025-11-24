export interface StoredMessage {
  id: string;
  text: string;
  senderId: string;
  createdAt: string; // ISO 8601 format
  status: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
  archived?: boolean;
  serverId?: string; // Server-assigned ID after successful send
  errorMessage?: string; // Error message if failed
}

export interface ConversationMetadata {
  conversationId: string;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
  archived?: boolean;
}

