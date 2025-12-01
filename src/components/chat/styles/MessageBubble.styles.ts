/**
 * Message Bubble Styles
 * Separate style file for MessageBubble component
 */

import { StyleSheet, Platform } from 'react-native';
import { theme } from '../../../theme';

export const messageBubbleStyles = StyleSheet.create({
  container: {
    marginVertical: 1,
    paddingHorizontal: theme.spacing.sm,
  },
  sentContainer: {
    alignItems: 'flex-end',
    paddingRight: theme.spacing.xs,
  },
  receivedContainer: {
    alignItems: 'flex-start',
    paddingLeft: theme.spacing.xs,
  },
  bubble: {
    maxWidth: '75%',
    minWidth: 60,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.sm - 2,
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
    backgroundColor: theme.colors.messageSent,
    borderBottomRightRadius: 2,
  },
  failedBubble: {
    backgroundColor: theme.colors.messageFailed,
    borderBottomRightRadius: 2,
  },
  receivedBubble: {
    backgroundColor: theme.colors.messageReceived,
    borderBottomLeftRadius: 2,
  },
  messageText: {
    fontSize: 14.2,
    lineHeight: 19,
    letterSpacing: 0.1,
    marginBottom: 2,
  },
  sentText: {
    color: theme.colors.textPrimary,
  },
  receivedText: {
    color: theme.colors.textPrimary,
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
    marginLeft: theme.spacing.xs,
    marginRight: 2,
  },
  retryButton: {
    marginLeft: theme.spacing.xs,
    padding: 2,
  },
  doubleCheck: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  secondCheck: {
    marginLeft: -theme.spacing.xs,
  },
  dateSeparator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: theme.spacing.sm + 4,
    paddingHorizontal: theme.spacing.md,
  },
  dateSeparatorLine: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.12)',
  },
  dateSeparatorText: {
    fontSize: 12.5,
    color: 'rgba(0, 0, 0, 0.6)',
    marginHorizontal: theme.spacing.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
});

