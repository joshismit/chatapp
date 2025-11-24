import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  saveConversation,
  loadConversation,
  archiveConversation,
  listConversations,
} from '../../storage';
import { StoredMessage } from '../../../types/message';

const mockAsyncStorage = AsyncStorage as jest.Mocked<typeof AsyncStorage>;

describe('Storage Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('saveConversation', () => {
    it('saves messages to AsyncStorage', async () => {
      const conversationId = 'conv_123';
      const messages: StoredMessage[] = [
        {
          id: 'msg_1',
          text: 'Hello',
          senderId: 'user_1',
          createdAt: new Date().toISOString(),
          status: 'sent',
        },
      ];

      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      await saveConversation(conversationId, messages);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        `conversation:${conversationId}`,
        JSON.stringify(messages)
      );
    });

    it('handles empty messages array', async () => {
      const conversationId = 'conv_123';
      const messages: StoredMessage[] = [];

      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      await saveConversation(conversationId, messages);

      expect(mockAsyncStorage.setItem).toHaveBeenCalledWith(
        `conversation:${conversationId}`,
        JSON.stringify([])
      );
    });
  });

  describe('loadConversation', () => {
    it('loads messages from AsyncStorage', async () => {
      const conversationId = 'conv_123';
      const storedMessages: StoredMessage[] = [
        {
          id: 'msg_1',
          text: 'Hello',
          senderId: 'user_1',
          createdAt: new Date().toISOString(),
          status: 'sent',
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(storedMessages));

      const result = await loadConversation(conversationId);

      expect(mockAsyncStorage.getItem).toHaveBeenCalledWith(
        `conversation:${conversationId}`
      );
      expect(result).toEqual(storedMessages);
    });

    it('returns empty array when no messages exist', async () => {
      const conversationId = 'conv_123';

      mockAsyncStorage.getItem.mockResolvedValue(null);

      const result = await loadConversation(conversationId);

      expect(result).toEqual([]);
    });
  });

  describe('archiveConversation', () => {
    it('marks conversation as archived', async () => {
      const conversationId = 'conv_123';
      const messages: StoredMessage[] = [
        {
          id: 'msg_1',
          text: 'Hello',
          senderId: 'user_1',
          createdAt: new Date().toISOString(),
          status: 'sent',
        },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(messages));
      mockAsyncStorage.setItem.mockResolvedValue(undefined);

      await archiveConversation(conversationId);

      expect(mockAsyncStorage.setItem).toHaveBeenCalled();
    });
  });

  describe('listConversations', () => {
    it('returns list of all conversations', async () => {
      const conversations = [
        { id: 'conv_1', userName: 'User 1', lastMessage: 'Hello', timestamp: '2:30 PM' },
        { id: 'conv_2', userName: 'User 2', lastMessage: 'Hi', timestamp: '3:00 PM' },
      ];

      mockAsyncStorage.getItem.mockResolvedValue(JSON.stringify(conversations));

      const result = await listConversations();

      expect(result).toEqual(conversations);
    });
  });
});

