import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { t } from '../../i18n';
import { useSettings } from '../../hooks/useSettings';

export interface ChatItemData {
  id: string;
  userName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount?: number;
  avatarColor?: string;
}

interface ChatItemProps {
  item: ChatItemData;
  onPress: (conversationId: string) => void;
  onArchive?: (conversationId: string) => void;
}

export default function ChatItem({ item, onPress, onArchive }: ChatItemProps) {
  const [menuVisible, setMenuVisible] = useState(false);
  const { fontSizeMultiplier } = useSettings();
  const avatarInitial = item.userName.charAt(0).toUpperCase();
  const avatarBgColor = item.avatarColor || '#25D366';

  // Accessibility labels
  const chatAccessibilityLabel = t('chatList.chatWith', { name: item.userName });
  const unreadAccessibilityLabel = item.unreadCount && item.unreadCount > 0
    ? t('chatList.unreadMessages', { count: item.unreadCount })
    : t('chatList.noUnread');
  const menuAccessibilityLabel = t('chatScreen.moreOptions');

  const handleMenuPress = () => {
    setMenuVisible(true);
  };

  const handleArchive = () => {
    setMenuVisible(false);
    onArchive?.(item.id);
  };

  const handleChatPress = () => {
    if (!menuVisible) {
      onPress(item.id);
    }
  };

  // Dynamic styles with font size multiplier
  const dynamicStyles = StyleSheet.create({
    userName: {
      ...styles.userName,
      fontSize: styles.userName.fontSize * fontSizeMultiplier,
    },
    timestamp: {
      ...styles.timestamp,
      fontSize: styles.timestamp.fontSize * fontSizeMultiplier,
    },
    lastMessage: {
      ...styles.lastMessage,
      fontSize: styles.lastMessage.fontSize * fontSizeMultiplier,
    },
    unreadText: {
      ...styles.unreadText,
      fontSize: styles.unreadText.fontSize * fontSizeMultiplier,
    },
    menuItemText: {
      ...styles.menuItemText,
      fontSize: styles.menuItemText.fontSize * fontSizeMultiplier,
    },
    menuItemTextCancel: {
      ...styles.menuItemTextCancel,
      fontSize: styles.menuItemTextCancel.fontSize * fontSizeMultiplier,
    },
  });

  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={handleChatPress}
        activeOpacity={0.7}
        onLongPress={handleMenuPress}
        accessibilityRole="button"
        accessibilityLabel={chatAccessibilityLabel}
        accessibilityHint={t('chatList.lastMessage', { message: item.lastMessage })}
        accessibilityState={{
          selected: false,
        }}
      >
        <View style={styles.avatarContainer} accessibilityIgnoresInvertColors>
          <View 
            style={[styles.avatar, { backgroundColor: avatarBgColor }]}
            accessibilityLabel={`${item.userName} avatar`}
            accessibilityRole="image"
          >
            <Text style={styles.avatarText}>{avatarInitial}</Text>
          </View>
        </View>
        <View style={styles.contentContainer}>
          <View style={styles.headerRow}>
            <Text 
              style={dynamicStyles.userName} 
              numberOfLines={1}
              accessibilityLabel={item.userName}
            >
              {item.userName}
            </Text>
            <View style={styles.headerRight}>
              <Text 
                style={dynamicStyles.timestamp}
                accessibilityLabel={t('chatList.timestamp', { time: item.timestamp })}
              >
                {item.timestamp}
              </Text>
              <TouchableOpacity
                style={styles.menuButton}
                onPress={handleMenuPress}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                accessibilityRole="button"
                accessibilityLabel={menuAccessibilityLabel}
                accessibilityHint="Long press to open menu"
              >
                <Ionicons name="ellipsis-vertical" size={20} color="#667781" />
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.messageRow}>
            <Text 
              style={dynamicStyles.lastMessage} 
              numberOfLines={1}
              accessibilityLabel={t('chatList.lastMessage', { message: item.lastMessage })}
            >
              {item.lastMessage}
            </Text>
            {item.unreadCount && item.unreadCount > 0 && (
              <View 
                style={styles.unreadBadge}
                accessibilityRole="text"
                accessibilityLabel={unreadAccessibilityLabel}
                accessibilityLiveRegion="polite"
              >
                <Text style={dynamicStyles.unreadText}>
                  {item.unreadCount > 99 ? '99+' : item.unreadCount}
                </Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>

      <Modal
        visible={menuVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setMenuVisible(false)}
        accessibilityViewIsModal
      >
        <Pressable
          style={styles.modalOverlay}
          onPress={() => setMenuVisible(false)}
          accessibilityLabel={t('chatList.cancel')}
        >
          <View 
            style={styles.menuContainer}
            accessibilityRole="menu"
          >
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleArchive}
              activeOpacity={0.7}
              accessibilityRole="menuitem"
              accessibilityLabel={t('chatList.archive')}
              accessibilityHint={`Archive conversation with ${item.userName}`}
            >
              <Ionicons name="archive-outline" size={22} color="#000" style={styles.menuIcon} />
              <Text style={dynamicStyles.menuItemText}>{t('chatList.archive')}</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => setMenuVisible(false)}
              activeOpacity={0.7}
              accessibilityRole="menuitem"
              accessibilityLabel={t('chatList.cancel')}
            >
              <Text style={dynamicStyles.menuItemTextCancel}>{t('chatList.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 10,
    backgroundColor: '#fff',
    minHeight: 72,
  },
  avatarContainer: {
    marginRight: 12,
    justifyContent: 'center',
  },
  avatar: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: '500',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: 8,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  userName: {
    fontSize: 17,
    fontWeight: '400',
    color: '#000',
    flex: 1,
    marginRight: 8,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timestamp: {
    fontSize: 13,
    color: '#667781',
    fontWeight: '400',
  },
  menuButton: {
    padding: 4,
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  lastMessage: {
    fontSize: 14,
    color: '#667781',
    flex: 1,
    marginRight: 8,
  },
  unreadBadge: {
    backgroundColor: '#25D366',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  menuContainer: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingVertical: 8,
    minWidth: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  menuItemText: {
    fontSize: 16,
    color: '#000',
  },
  menuItemTextCancel: {
    fontSize: 16,
    color: '#667781',
    fontWeight: '500',
  },
  menuIcon: {
    marginRight: 12,
  },
});
