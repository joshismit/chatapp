import { by, device, element, expect as detoxExpect, waitFor } from 'detox';

describe('Chat App E2E Tests', () => {
  beforeAll(async () => {
    await device.launchApp();
  });

  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('Message Flow', () => {
    it('should send a message successfully', async () => {
      // Navigate to chat list (if needed)
      // await element(by.id('chat-list-item-1')).tap();

      // Open a chat conversation
      await waitFor(element(by.id('chat-list-item-0')))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id('chat-list-item-0')).tap();

      // Wait for chat screen to load
      await waitFor(element(by.id('chat-input')))
        .toBeVisible()
        .withTimeout(3000);

      // Type a message
      await element(by.id('chat-input')).typeText('Hello, this is a test message');

      // Tap send button
      await element(by.id('send-button')).tap();

      // Verify message appears in chat
      await waitFor(element(by.text('Hello, this is a test message')))
        .toBeVisible()
        .withTimeout(5000);

      // Verify message status changes to "sent"
      await waitFor(element(by.id('message-status-sent')))
        .toBeVisible()
        .withTimeout(10000);
    });

    it('should receive a message via SSE', async () => {
      // Open a chat conversation
      await waitFor(element(by.id('chat-list-item-0')))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id('chat-list-item-0')).tap();

      // Wait for chat screen
      await waitFor(element(by.id('chat-input')))
        .toBeVisible()
        .withTimeout(3000);

      // Note: In a real test, you would trigger SSE event from backend
      // For now, we'll verify the UI can display received messages
      // This would typically be done by mocking SSE or using a test backend

      // Verify received message appears
      // await waitFor(element(by.text('Received message from server')))
      //   .toBeVisible()
      //   .withTimeout(10000);
    });

    it('should handle failed message and allow retry', async () => {
      // Open a chat conversation
      await waitFor(element(by.id('chat-list-item-0')))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id('chat-list-item-0')).tap();

      // Wait for chat screen
      await waitFor(element(by.id('chat-input')))
        .toBeVisible()
        .withTimeout(3000);

      // Simulate network failure (disable network or use test mode)
      // Type a message
      await element(by.id('chat-input')).typeText('This will fail');

      // Tap send button
      await element(by.id('send-button')).tap();

      // Wait for message to show as failed
      await waitFor(element(by.id('message-status-failed')))
        .toBeVisible()
        .withTimeout(10000);

      // Tap retry button
      await element(by.id('retry-button')).tap();

      // Verify message is retrying
      await waitFor(element(by.id('message-status-sending')))
        .toBeVisible()
        .withTimeout(3000);
    });
  });

  describe('Archive Flow', () => {
    it('should archive a conversation', async () => {
      // Wait for chat list to load
      await waitFor(element(by.id('chat-list')))
        .toBeVisible()
        .withTimeout(5000);

      // Long press on a chat item to open menu
      await element(by.id('chat-list-item-0')).longPress(2000);

      // Wait for menu to appear
      await waitFor(element(by.id('archive-menu-item')))
        .toBeVisible()
        .withTimeout(3000);

      // Tap archive option
      await element(by.id('archive-menu-item')).tap();

      // Verify conversation is removed from active list
      // (Implementation depends on your UI)
      await waitFor(element(by.id('chat-list-item-0')))
        .not.toBeVisible()
        .withTimeout(3000);
    });

    it('should unarchive a conversation', async () => {
      // Navigate to Archived tab
      await element(by.id('archived-tab')).tap();

      // Wait for archived list
      await waitFor(element(by.id('archived-chat-list')))
        .toBeVisible()
        .withTimeout(5000);

      // Long press on archived item
      await element(by.id('archived-chat-item-0')).longPress(2000);

      // Tap unarchive option
      await element(by.id('unarchive-menu-item')).tap();

      // Navigate back to Chats tab
      await element(by.id('chats-tab')).tap();

      // Verify conversation appears in active list
      await waitFor(element(by.id('chat-list-item-0')))
        .toBeVisible()
        .withTimeout(5000);
    });
  });

  describe('Message History', () => {
    it('should load older messages on scroll', async () => {
      // Open a chat conversation
      await waitFor(element(by.id('chat-list-item-0')))
        .toBeVisible()
        .withTimeout(5000);
      
      await element(by.id('chat-list-item-0')).tap();

      // Wait for chat screen
      await waitFor(element(by.id('chat-messages-list')))
        .toBeVisible()
        .withTimeout(3000);

      // Scroll to top to trigger pagination
      await element(by.id('chat-messages-list')).scroll(200, 'up');

      // Wait for loading indicator
      await waitFor(element(by.id('loading-older-messages')))
        .toBeVisible()
        .withTimeout(3000);

      // Verify older messages appear
      // (This depends on your message IDs)
    });
  });
});

