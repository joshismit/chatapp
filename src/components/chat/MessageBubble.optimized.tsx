import React, { useMemo, memo } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { t } from '../../i18n';
import { useSettings } from '../../hooks/useSettings';
import { Message } from './MessageBubble';

interface MessageBubbleProps {
  message: Message;
  onRetry?: (message: Message) => void;
  showDateSeparator?: boolean;
  dateLabel?: string;
}

/**
 * Optimized MessageBubble with React.memo and useMemo
 * Prevents unnecessary re-renders when parent updates
 */
const MessageBubbleOptimized = memo<MessageBubbleProps>(function MessageBubble({
  message,
  onRetry,
  showDateSeparator = false,
  dateLabel,
}) {
  const { fontSizeMultiplier } = useSettings();

  // Memoize status icon to avoid recalculating on every render
  const statusIcon = useMemo(() => {
    if (!message.isSent) return null;

    switch (message.status) {
      case 'sending':
        return <Ionicons name="time-outline" size={12} color="rgba(0, 0, 0, 0.45)" />;
      case 'sent':
        return <Ionicons name="checkmark" size={12} color="rgba(0, 0, 0, 0.45)" />;
      case 'delivered':
        return (
          <View style={styles.doubleCheck}>
            <Ionicons name="checkmark" size={12} color="rgba(0, 0, 0, 0.45)" />
            <Ionicons
              name="checkmark"
              size={12}
              color="rgba(0, 0, 0, 0.45)"
              style={styles.secondCheck}
            />
          </View>
        );
      case 'read':
        return (
          <View style={styles.doubleCheck}>
            <Ionicons name="checkmark" size={12} color="#4FC3F7" />
            <Ionicons name="checkmark" size={12} color="#4FC3F7" style={styles.secondCheck} />
          </View>
        );
      case 'failed':
        return <Ionicons name="alert-circle" size={12} color="#F44336" />;
      default:
        return null;
    }
  }, [message.isSent, message.status]);

  // Memoize text style to avoid recalculation
  const textStyle = useMemo(
    () => [
      styles.messageText,
      message.isSent ? styles.sentText : styles.receivedText,
      { fontSize: 14.2 * fontSizeMultiplier },
    ],
    [message.isSent, fontSizeMultiplier]
  );

  // Memoize bubble style
  const bubbleStyle = useMemo(
    () => [
      styles.bubble,
      message.isSent
        ? message.status === 'failed'
          ? styles.failedBubble
          : styles.sentBubble
        : styles.receivedBubble,
    ],
    [message.isSent, message.status]
  );

  // Memoize container style
  const containerStyle = useMemo(
    () => [message.isSent ? styles.sentContainer : styles.receivedContainer],
    [message.isSent]
  );

  // Memoize retry handler to prevent function recreation
  const handleRetry = useMemo(
    () => (onRetry && message.status === 'failed' ? () => onRetry(message) : undefined),
    [onRetry, message]
  );

  return (
    <>
      {showDateSeparator && dateLabel && (
        <View style={styles.dateSeparator} accessibilityLabel={`Date separator: ${dateLabel}`}>
          <View style={styles.dateSeparatorLine} />
          <Text style={styles.dateSeparatorText}>{dateLabel}</Text>
          <View style={styles.dateSeparatorLine} />
        </View>
      )}
      <View
        style={containerStyle}
        accessibilityLabel={message.isSent ? 'Sent message' : 'Received message'}
        accessibilityRole="text"
        testID={`message-${message.id}`}
      >
        <View style={bubbleStyle}>
          <Text style={textStyle} selectable>
            {message.text}
          </Text>
          <View style={styles.footer}>
            <Text
              style={[
                styles.timestamp,
                message.isSent ? styles.sentTimestamp : styles.receivedTimestamp,
              ]}
            >
              {message.timestamp}
            </Text>
            {statusIcon && <View style={styles.statusContainer}>{statusIcon}</View>}
            {message.status === 'failed' && handleRetry && (
              <TouchableOpacity
                onPress={handleRetry}
                style={styles.retryButton}
                accessibilityLabel="Retry sending message"
                accessibilityRole="button"
                testID={`retry-button-${message.id}`}
              >
                <Ionicons name="refresh" size={14} color="#F44336" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </>
  );
}, arePropsEqual);

/**
 * Custom comparison function for React.memo
 * Only re-render if message content, status, or callbacks change
 */
function arePropsEqual(prevProps: MessageBubbleProps, nextProps: MessageBubbleProps): boolean {
  // Compare message properties that affect rendering
  if (
    prevProps.message.id !== nextProps.message.id ||
    prevProps.message.text !== nextProps.message.text ||
    prevProps.message.status !== nextProps.message.status ||
    prevProps.message.timestamp !== nextProps.message.timestamp ||
    prevProps.message.isSent !== nextProps.message.isSent ||
    prevProps.showDateSeparator !== nextProps.showDateSeparator ||
    prevProps.dateLabel !== nextProps.dateLabel
  ) {
    return false;
  }

  // Compare callback functions (reference equality)
  if (prevProps.onRetry !== nextProps.onRetry) {
    return false;
  }

  return true;
}

export default MessageBubbleOptimized;

const styles = StyleSheet.create({
  container: {
    marginVertical: 1,
    paddingHorizontal: 8,
  },
  sentContainer: {
    alignItems: 'flex-end',
    paddingRight: 4,
  },
  receivedContainer: {
    alignItems: 'flex-start',
    paddingLeft: 4,
  },
  bubble: {
    maxWidth: '75%',
    minWidth: 60,
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 7.5,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  sentBubble: {
    backgroundColor: '#DCF8C6',
    borderBottomRightRadius: 2,
  },
  failedBubble: {
    backgroundColor: '#FFE5E5',
    borderBottomRightRadius: 2,
  },
  receivedBubble: {
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 14.2,
    lineHeight: 19,
    letterSpacing: 0.1,
    marginBottom: 2,
  },
  sentText: {
    color: '#000000',
  },
  receivedText: {
    color: '#000000',
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    marginTop: 2,
    paddingTop: 2,
  },
  timestamp: {
    fontSize: 11.5,
    letterSpacing: 0.1,
  },
  sentTimestamp: {
    color: 'rgba(0, 0, 0, 0.45)',
  },
  receivedTimestamp: {
    color: 'rgba(0, 0, 0, 0.45)',
  },
  statusContainer: {
    marginLeft: 4,
    marginRight: 2,
  },
  retryButton: {
    marginLeft: 4,
    padding: 2,
  },
  doubleCheck: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondCheck: {
    marginLeft: -4,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 12,
    paddingHorizontal: 16,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  dateSeparatorText: {
    fontSize: 12.5,
    color: 'rgba(0, 0, 0, 0.6)',
    marginHorizontal: 8,
    fontWeight: '500',
  },
});

