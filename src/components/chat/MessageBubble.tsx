import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { t } from '../../i18n';
import { useSettings } from '../../hooks/useSettings';

export interface Message {
  id: string;
  text: string;
  isSent: boolean;
  timestamp: string;
  createdAt?: string; // ISO timestamp for date grouping
  status?: 'sending' | 'sent' | 'delivered' | 'read' | 'failed';
}

interface MessageBubbleProps {
  message: Message;
  onRetry?: (message: Message) => void;
  showDateSeparator?: boolean;
  dateLabel?: string;
}

export default function MessageBubble({ 
  message, 
  onRetry,
  showDateSeparator = false,
  dateLabel,
}: MessageBubbleProps) {
  const { fontSizeMultiplier } = useSettings();

  const getStatusIcon = () => {
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
            <Ionicons name="checkmark" size={12} color="#53BDEB" />
            <Ionicons name="checkmark" size={12} color="#53BDEB" style={styles.secondCheck} />
          </View>
        );
      case 'failed':
        return <Ionicons name="alert-circle" size={12} color="#F44336" />;
      default:
        return <Ionicons name="checkmark" size={12} color="rgba(0, 0, 0, 0.45)" />;
    }
  };

  const getStatusLabel = (): string => {
    if (!message.isSent) return '';
    switch (message.status) {
      case 'sending':
        return t('messageBubble.statusSending');
      case 'sent':
        return t('messageBubble.statusSent');
      case 'delivered':
        return t('messageBubble.statusDelivered');
      case 'read':
        return t('messageBubble.statusRead');
      case 'failed':
        return t('messageBubble.statusFailed');
      default:
        return '';
    }
  };

  const accessibilityLabel = message.isSent
    ? t('messageBubble.sentMessage', { text: message.text })
    : t('messageBubble.receivedMessage', { text: message.text });

  const timestampLabel = t('messageBubble.timestamp', { time: message.timestamp });

  // Dynamic styles with font size multiplier
  const dynamicStyles = StyleSheet.create({
    messageText: {
      ...styles.messageText,
      fontSize: styles.messageText.fontSize * fontSizeMultiplier,
      lineHeight: styles.messageText.lineHeight * fontSizeMultiplier,
    },
    timestamp: {
      ...styles.timestamp,
      fontSize: styles.timestamp.fontSize * fontSizeMultiplier,
    },
    dateSeparatorText: {
      ...styles.dateSeparatorText,
      fontSize: styles.dateSeparatorText.fontSize * fontSizeMultiplier,
    },
  });

  return (
    <>
      {showDateSeparator && dateLabel && (
        <View 
          style={styles.dateSeparator}
          accessibilityRole="text"
          accessibilityLabel={dateLabel}
        >
          <View style={styles.dateSeparatorLine} />
          <Text style={dynamicStyles.dateSeparatorText}>{dateLabel}</Text>
          <View style={styles.dateSeparatorLine} />
        </View>
      )}
      <View
        style={[
          styles.container,
          message.isSent ? styles.sentContainer : styles.receivedContainer,
        ]}
        accessibilityRole="text"
        accessibilityLabel={`${accessibilityLabel}. ${timestampLabel}. ${getStatusLabel()}`}
      >
        <View
          style={[
            styles.bubble,
            message.isSent
              ? message.status === 'failed'
                ? styles.failedBubble
                : styles.sentBubble
              : styles.receivedBubble,
          ]}
        >
          <Text
            style={[
              dynamicStyles.messageText,
              message.isSent ? styles.sentText : styles.receivedText,
            ]}
            accessibilityRole="text"
          >
            {message.text}
          </Text>
          <View style={styles.footer}>
            <Text
              style={[
                dynamicStyles.timestamp,
                message.isSent ? styles.sentTimestamp : styles.receivedTimestamp,
              ]}
              accessibilityLabel={timestampLabel}
            >
              {message.timestamp}
            </Text>
            {message.isSent && (
              <View 
                style={styles.statusContainer}
                accessibilityLabel={getStatusLabel()}
                accessibilityRole="text"
              >
                {getStatusIcon()}
              </View>
            )}
            {message.status === 'failed' && onRetry && (
              <TouchableOpacity
                style={styles.retryButton}
                onPress={() => onRetry(message)}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel={t('messageBubble.retryButton')}
                accessibilityHint="Press to retry sending this message"
              >
                <Ionicons name="refresh" size={14} color="#F44336" />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </>
  );
}

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
    paddingHorizontal: 12,
    fontWeight: '500',
  },
});
