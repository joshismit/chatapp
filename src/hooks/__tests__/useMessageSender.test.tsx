import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useMessageSender } from '../useMessageSender';
import * as messageService from '../../services/api/messageService';
import * as storage from '../../services/storage';
import { Message } from '../../components/chat/MessageBubble';

// Mock dependencies
jest.mock('../../services/api/messageService');
jest.mock('../../services/storage');

const mockMessageService = messageService as jest.Mocked<typeof messageService>;
const mockStorage = storage as jest.Mocked<typeof storage>;

describe('useMessageSender', () => {
  const mockConversationId = 'conv_123';
  const mockSenderId = 'user_456';
  const mockOnMessageUpdate = jest.fn();
  const mockCurrentMessages: Message[] = [];

  beforeEach(() => {
    jest.clearAllMocks();
    mockStorage.saveConversation.mockResolvedValue(undefined);
  });

  describe('sendMessage', () => {
    it('creates optimistic message and updates UI immediately', async () => {
      const mockResponse = {
        messageId: 'msg_789',
        text: 'Test message',
        senderId: mockSenderId,
        createdAt: new Date().toISOString(),
      };

      mockMessageService.sendMessage.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useMessageSender({
          conversationId: mockConversationId,
          senderId: mockSenderId,
          onMessageUpdate: mockOnMessageUpdate,
          currentMessages: mockCurrentMessages,
        })
      );

      await act(async () => {
        await result.current.sendMessage('Test message');
      });

      // Verify optimistic update was called
      expect(mockOnMessageUpdate).toHaveBeenCalled();
      const optimisticCall = mockOnMessageUpdate.mock.calls[0][0];
      expect(optimisticCall[0].text).toBe('Test message');
      expect(optimisticCall[0].status).toBe('sending');
      expect(optimisticCall[0].id).toMatch(/^temp_/);

      // Verify storage was called
      expect(mockStorage.saveConversation).toHaveBeenCalled();
    });

    it('sends message to server and updates status to sent', async () => {
      const mockResponse = {
        messageId: 'msg_789',
        text: 'Test message',
        senderId: mockSenderId,
        createdAt: new Date().toISOString(),
      };

      mockMessageService.sendMessage.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useMessageSender({
          conversationId: mockConversationId,
          senderId: mockSenderId,
          onMessageUpdate: mockOnMessageUpdate,
          currentMessages: mockCurrentMessages,
        })
      );

      const sendResult = await act(async () => {
        return await result.current.sendMessage('Test message');
      });

      // Verify API was called
      expect(mockMessageService.sendMessage).toHaveBeenCalledWith({
        conversationId: mockConversationId,
        text: 'Test message',
        senderId: mockSenderId,
      });

      // Verify success result
      expect(sendResult.success).toBe(true);
      expect(sendResult.error).toBeUndefined();

      // Verify message was updated with server ID
      await waitFor(() => {
        const updateCalls = mockOnMessageUpdate.mock.calls;
        const finalCall = updateCalls[updateCalls.length - 1];
        expect(finalCall[0][0].id).toBe('msg_789');
        expect(finalCall[0][0].status).toBe('sent');
      });
    });

    it('handles API failure and marks message as failed', async () => {
      const mockError = {
        message: 'Network error',
        code: 'NETWORK_ERROR',
      };

      mockMessageService.sendMessage.mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useMessageSender({
          conversationId: mockConversationId,
          senderId: mockSenderId,
          onMessageUpdate: mockOnMessageUpdate,
          currentMessages: mockCurrentMessages,
        })
      );

      const sendResult = await act(async () => {
        return await result.current.sendMessage('Test message');
      });

      // Verify failure result
      expect(sendResult.success).toBe(false);
      expect(sendResult.error).toEqual(mockError);

      // Verify message was marked as failed
      await waitFor(() => {
        const updateCalls = mockOnMessageUpdate.mock.calls;
        const finalCall = updateCalls[updateCalls.length - 1];
        expect(finalCall[0][0].status).toBe('failed');
      });
    });

    it('persists messages to AsyncStorage', async () => {
      const mockResponse = {
        messageId: 'msg_789',
        text: 'Test message',
        senderId: mockSenderId,
        createdAt: new Date().toISOString(),
      };

      mockMessageService.sendMessage.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useMessageSender({
          conversationId: mockConversationId,
          senderId: mockSenderId,
          onMessageUpdate: mockOnMessageUpdate,
          currentMessages: mockCurrentMessages,
        })
      );

      await act(async () => {
        await result.current.sendMessage('Test message');
      });

      // Verify storage was called multiple times (optimistic + final)
      expect(mockStorage.saveConversation).toHaveBeenCalledTimes(2);
    });
  });

  describe('retryMessage', () => {
    it('retries failed message successfully', async () => {
      const failedMessage: Message = {
        id: 'msg_failed',
        text: 'Failed message',
        isSent: true,
        timestamp: '2:30 PM',
        status: 'failed',
      };

      const mockResponse = {
        messageId: 'msg_retry_789',
        text: 'Failed message',
        senderId: mockSenderId,
        createdAt: new Date().toISOString(),
      };

      mockMessageService.retrySendMessage.mockResolvedValue(mockResponse);

      const { result } = renderHook(() =>
        useMessageSender({
          conversationId: mockConversationId,
          senderId: mockSenderId,
          onMessageUpdate: mockOnMessageUpdate,
          currentMessages: [failedMessage],
        })
      );

      const retryResult = await act(async () => {
        return await result.current.retryMessage(failedMessage);
      });

      expect(retryResult.success).toBe(true);
      expect(mockMessageService.retrySendMessage).toHaveBeenCalled();
    });

    it('handles retry failure', async () => {
      const failedMessage: Message = {
        id: 'msg_failed',
        text: 'Failed message',
        isSent: true,
        timestamp: '2:30 PM',
        status: 'failed',
      };

      const mockError = {
        message: 'Retry failed',
        code: 'RETRY_ERROR',
      };

      mockMessageService.retrySendMessage.mockRejectedValue(mockError);

      const { result } = renderHook(() =>
        useMessageSender({
          conversationId: mockConversationId,
          senderId: mockSenderId,
          onMessageUpdate: mockOnMessageUpdate,
          currentMessages: [failedMessage],
        })
      );

      const retryResult = await act(async () => {
        return await result.current.retryMessage(failedMessage);
      });

      expect(retryResult.success).toBe(false);
      expect(retryResult.error).toEqual(mockError);
    });
  });
});

