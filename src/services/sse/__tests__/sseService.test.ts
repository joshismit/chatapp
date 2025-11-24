import { subscribeToSSE, SSESubscribeOptions } from '../sseService';
import EventSource from 'eventsource';

// Mock EventSource
jest.mock('eventsource');

const mockEventSource = EventSource as jest.MockedClass<typeof EventSource>;

describe('SSE Service', () => {
  let mockEventSourceInstance: any;
  let onMessageCallback: (event: any) => void;
  let onErrorCallback: (event: any) => void;
  let onStatusUpdateCallback: (messageId: string, status: 'delivered' | 'read') => void;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mock EventSource instance
    mockEventSourceInstance = {
      addEventListener: jest.fn((event: string, callback: (event: any) => void) => {
        if (event === 'message') {
          onMessageCallback = callback;
        } else if (event === 'error') {
          onErrorCallback = callback;
        }
      }),
      close: jest.fn(),
      readyState: EventSource.OPEN,
    };

    mockEventSource.mockImplementation(() => mockEventSourceInstance);
  });

  describe('subscribeToSSE', () => {
    const mockOptions: SSESubscribeOptions = {
      conversationId: 'conv_123',
      token: 'test_token',
      onMessage: jest.fn(),
      onStatusUpdate: jest.fn(),
      onError: jest.fn(),
      onConnect: jest.fn(),
      onDisconnect: jest.fn(),
    };

    it('creates EventSource connection with correct URL', () => {
      const subscription = subscribeToSSE(mockOptions);

      expect(mockEventSource).toHaveBeenCalledWith(
        expect.stringContaining('conversationId=conv_123')
      );
      expect(mockEventSource).toHaveBeenCalledWith(
        expect.stringContaining('token=test_token')
      );

      subscription.unsubscribe();
    });

    it('handles new message events', () => {
      const subscription = subscribeToSSE(mockOptions);

      // Simulate message event
      const mockEvent = {
        data: JSON.stringify({
          id: 'msg_123',
          text: 'Test message',
          senderId: 'user_456',
          createdAt: new Date().toISOString(),
          status: 'sent',
        }),
      };

      // Trigger message event
      if (onMessageCallback) {
        onMessageCallback(mockEvent);
      }

      expect(mockOptions.onMessage).toHaveBeenCalledWith(
        expect.objectContaining({
          id: 'msg_123',
          text: 'Test message',
        })
      );

      subscription.unsubscribe();
    });

    it('handles status update events', () => {
      const subscription = subscribeToSSE(mockOptions);

      // Simulate status update event
      const mockStatusEvent = {
        type: 'status_update',
        data: JSON.stringify({
          messageId: 'msg_123',
          status: 'delivered',
        }),
      };

      // Find status update handler
      const statusUpdateHandler = mockEventSourceInstance.addEventListener.mock.calls.find(
        (call: any[]) => call[0] === 'status_update'
      );

      if (statusUpdateHandler) {
        statusUpdateHandler[1](mockStatusEvent);
        expect(mockOptions.onStatusUpdate).toHaveBeenCalledWith('msg_123', 'delivered');
      }

      subscription.unsubscribe();
    });

    it('handles connection errors', () => {
      const subscription = subscribeToSSE(mockOptions);

      // Simulate error event
      if (onErrorCallback) {
        onErrorCallback(new Error('Connection failed'));
      }

      expect(mockOptions.onError).toHaveBeenCalledWith(
        expect.any(Error)
      );

      subscription.unsubscribe();
    });

    it('calls onConnect when connection opens', () => {
      const subscription = subscribeToSSE(mockOptions);

      // Simulate open event
      const openHandler = mockEventSourceInstance.addEventListener.mock.calls.find(
        (call: any[]) => call[0] === 'open'
      );

      if (openHandler) {
        openHandler[1]();
        expect(mockOptions.onConnect).toHaveBeenCalled();
      }

      subscription.unsubscribe();
    });

    it('unsubscribes and closes connection', () => {
      const subscription = subscribeToSSE(mockOptions);

      subscription.unsubscribe();

      expect(mockEventSourceInstance.close).toHaveBeenCalled();
    });

    it('handles invalid JSON in message event', () => {
      const subscription = subscribeToSSE(mockOptions);

      const mockEvent = {
        data: 'invalid json',
      };

      // Should not throw, but onError might be called
      if (onMessageCallback) {
        expect(() => onMessageCallback(mockEvent)).not.toThrow();
      }

      subscription.unsubscribe();
    });

    it('handles reconnection logic', () => {
      const subscription = subscribeToSSE(mockOptions);

      // Simulate connection close
      mockEventSourceInstance.readyState = EventSource.CLOSED;

      // Trigger error to initiate reconnection
      if (onErrorCallback) {
        onErrorCallback(new Error('Connection lost'));
      }

      // Reconnection should be attempted
      // (Implementation depends on your reconnection logic)

      subscription.unsubscribe();
    });

    it('includes token in URL when provided', () => {
      const optionsWithToken: SSESubscribeOptions = {
        ...mockOptions,
        token: 'auth_token_123',
      };

      const subscription = subscribeToSSE(optionsWithToken);

      expect(mockEventSource).toHaveBeenCalledWith(
        expect.stringContaining('token=auth_token_123')
      );

      subscription.unsubscribe();
    });

    it('works without token', () => {
      const optionsWithoutToken: SSESubscribeOptions = {
        ...mockOptions,
        token: undefined,
      };

      const subscription = subscribeToSSE(optionsWithoutToken);

      expect(mockEventSource).toHaveBeenCalled();

      subscription.unsubscribe();
    });
  });
});

