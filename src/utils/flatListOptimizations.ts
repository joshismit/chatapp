import { ListRenderItemInfo } from 'react-native';
import { Message } from '../components/chat/MessageBubble';

/**
 * Estimated height for a message bubble
 * Used for getItemLayout when exact height is unknown
 */
export const ESTIMATED_MESSAGE_HEIGHT = 60;

/**
 * Height of date separator
 */
export const DATE_SEPARATOR_HEIGHT = 44;

/**
 * Padding between messages
 */
export const MESSAGE_PADDING = 2;

/**
 * Calculate item layout for FlatList
 * Improves scroll performance by pre-calculating item positions
 * 
 * @param data - Array of messages
 * @param index - Index of the item
 * @returns Layout information for the item
 */
export function getMessageItemLayout(
  data: Array<Message & { showDateSeparator?: boolean }> | null | undefined,
  index: number
): { length: number; offset: number; index: number } {
  if (!data || data.length === 0) {
    return { length: ESTIMATED_MESSAGE_HEIGHT, offset: 0, index };
  }

  let offset = 0;

  // Calculate offset by summing heights of previous items
  for (let i = 0; i < index; i++) {
    const item = data[i];
    
    // Add date separator height if present
    if (item.showDateSeparator) {
      offset += DATE_SEPARATOR_HEIGHT;
    }

    // Calculate message height based on text length
    // Rough estimate: ~20px per line, min 1 line, max ~10 lines
    const textLength = item.text?.length || 0;
    const estimatedLines = Math.max(1, Math.min(10, Math.ceil(textLength / 40)));
    const messageHeight = Math.max(ESTIMATED_MESSAGE_HEIGHT, estimatedLines * 20 + 20);

    offset += messageHeight + MESSAGE_PADDING;
  }

  // Calculate current item height
  const currentItem = data[index];
  let itemHeight = ESTIMATED_MESSAGE_HEIGHT;

  if (currentItem.showDateSeparator) {
    itemHeight += DATE_SEPARATOR_HEIGHT;
  }

  // Estimate height based on text length
  const textLength = currentItem.text?.length || 0;
  const estimatedLines = Math.max(1, Math.min(10, Math.ceil(textLength / 40)));
  const messageHeight = Math.max(ESTIMATED_MESSAGE_HEIGHT, estimatedLines * 20 + 20);
  itemHeight = Math.max(itemHeight, messageHeight);

  return {
    length: itemHeight,
    offset,
    index,
  };
}

/**
 * Optimized FlatList props for chat messages
 */
export const CHAT_FLATLIST_PROPS = {
  // Initial render optimization
  initialNumToRender: 15, // Render first 15 items
  maxToRenderPerBatch: 10, // Render 10 items per batch
  windowSize: 21, // Keep 21 screens worth of items in memory (10.5 above + 10.5 below)
  updateCellsBatchingPeriod: 50, // Batch updates every 50ms

  // Performance optimizations
  removeClippedSubviews: true, // Remove off-screen views (Android)
  getItemLayout: undefined, // Set this in component with actual data

  // Scroll optimization
  onEndReachedThreshold: 0.5, // Trigger load more at 50% from end

  // Other optimizations
  maintainVisibleContentPosition: {
    minIndexForVisible: 0,
  },
  showsVerticalScrollIndicator: false,
};

