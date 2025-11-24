import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react-native';
import MessageBubble, { Message } from '../MessageBubble';

// Mock hooks
jest.mock('../../../hooks/useSettings', () => ({
  useSettings: () => ({
    fontSizeMultiplier: 1.0,
  }),
}));

describe('MessageBubble', () => {
  const mockMessage: Message = {
    id: '1',
    text: 'Hello, world!',
    isSent: true,
    timestamp: '2:30 PM',
    status: 'sent',
  };

  const mockReceivedMessage: Message = {
    id: '2',
    text: 'Hi there!',
    isSent: false,
    timestamp: '2:31 PM',
  };

  it('renders sent message correctly', () => {
    render(<MessageBubble message={mockMessage} />);
    
    expect(screen.getByText('Hello, world!')).toBeTruthy();
    expect(screen.getByText('2:30 PM')).toBeTruthy();
  });

  it('renders received message correctly', () => {
    render(<MessageBubble message={mockReceivedMessage} />);
    
    expect(screen.getByText('Hi there!')).toBeTruthy();
    expect(screen.getByText('2:31 PM')).toBeTruthy();
  });

  it('shows date separator when provided', () => {
    render(
      <MessageBubble
        message={mockMessage}
        showDateSeparator={true}
        dateLabel="Today"
      />
    );
    
    expect(screen.getByText('Today')).toBeTruthy();
  });

  it('displays sending status icon', () => {
    const sendingMessage: Message = {
      ...mockMessage,
      status: 'sending',
    };
    
    render(<MessageBubble message={sendingMessage} />);
    expect(screen.getByText('Hello, world!')).toBeTruthy();
  });

  it('displays delivered status icon', () => {
    const deliveredMessage: Message = {
      ...mockMessage,
      status: 'delivered',
    };
    
    render(<MessageBubble message={deliveredMessage} />);
    expect(screen.getByText('Hello, world!')).toBeTruthy();
  });

  it('displays read status icon', () => {
    const readMessage: Message = {
      ...mockMessage,
      status: 'read',
    };
    
    render(<MessageBubble message={readMessage} />);
    expect(screen.getByText('Hello, world!')).toBeTruthy();
  });

  it('displays failed status and retry button', () => {
    const failedMessage: Message = {
      ...mockMessage,
      status: 'failed',
    };
    
    const onRetry = jest.fn();
    render(<MessageBubble message={failedMessage} onRetry={onRetry} />);
    
    expect(screen.getByText('Hello, world!')).toBeTruthy();
    
    // Find retry button by accessibility label
    const retryButton = screen.getByLabelText('messageBubble.retryButton');
    expect(retryButton).toBeTruthy();
    
    fireEvent.press(retryButton);
    expect(onRetry).toHaveBeenCalledWith(failedMessage);
  });

  it('does not show retry button for non-failed messages', () => {
    render(<MessageBubble message={mockMessage} />);
    
    const retryButton = screen.queryByLabelText('messageBubble.retryButton');
    expect(retryButton).toBeNull();
  });

  it('applies correct accessibility labels', () => {
    render(<MessageBubble message={mockMessage} />);
    
    const messageContainer = screen.getByLabelText(
      expect.stringContaining('messageBubble.sentMessage')
    );
    expect(messageContainer).toBeTruthy();
  });

  it('handles long text correctly', () => {
    const longTextMessage: Message = {
      ...mockMessage,
      text: 'A'.repeat(500),
    };
    
    render(<MessageBubble message={longTextMessage} />);
    expect(screen.getByText('A'.repeat(500))).toBeTruthy();
  });

  it('handles empty text gracefully', () => {
    const emptyMessage: Message = {
      ...mockMessage,
      text: '',
    };
    
    render(<MessageBubble message={emptyMessage} />);
    expect(screen.getByText('2:30 PM')).toBeTruthy();
  });
});

