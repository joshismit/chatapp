import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { t } from '../../i18n';
import { useSettings } from '../../hooks/useSettings';

interface ChatInputProps {
  onSendMessage: (text: string) => void;
  onAttachPress?: () => void;
}

export default function ChatInput({ onSendMessage, onAttachPress }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const { fontSizeMultiplier } = useSettings();

  const handleSend = () => {
    if (message.trim()) {
      onSendMessage(message.trim());
      setMessage('');
    }
  };

  // Dynamic styles with font size multiplier
  const dynamicStyles = StyleSheet.create({
    input: {
      ...styles.input,
      fontSize: styles.input.fontSize * fontSizeMultiplier,
      lineHeight: styles.input.lineHeight * fontSizeMultiplier,
    },
  });

  return (
    <View 
      style={styles.container}
      accessibilityRole="toolbar"
      accessibilityLabel={t('chatInput.inputLabel')}
    >
      <TouchableOpacity
        style={styles.attachButton}
        onPress={onAttachPress}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t('chatInput.attachButton')}
        accessibilityHint="Press to attach a file"
      >
        <Ionicons name="attach-outline" size={24} color="#54656F" />
      </TouchableOpacity>
      <View style={styles.inputWrapper}>
        <TextInput
          style={dynamicStyles.input}
          placeholder={t('chatInput.placeholder')}
          placeholderTextColor="#667781"
          value={message}
          onChangeText={setMessage}
          multiline
          maxLength={4096}
          textAlignVertical="center"
          accessibilityLabel={t('chatInput.inputLabel')}
          accessibilityHint="Type your message here"
          accessibilityRole="textbox"
          accessibilityState={{
            disabled: false,
          }}
        />
      </View>
      {message.trim() ? (
        <TouchableOpacity
          style={styles.sendButton}
          onPress={handleSend}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('chatInput.sendButton')}
          accessibilityHint="Press to send your message"
          accessibilityState={{
            disabled: !message.trim(),
          }}
        >
          <Ionicons name="send" size={20} color="#fff" />
        </TouchableOpacity>
      ) : (
        <TouchableOpacity
          style={styles.micButton}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel={t('chatInput.micButton')}
          accessibilityHint="Press and hold to record a voice message"
        >
          <Ionicons name="mic-outline" size={24} color="#54656F" />
        </TouchableOpacity>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingHorizontal: 6,
    paddingVertical: 6,
    backgroundColor: '#F0F2F5',
    borderTopWidth: 0.5,
    borderTopColor: 'rgba(0, 0, 0, 0.08)',
    paddingBottom: Platform.OS === 'ios' ? 6 : 6,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  attachButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
    borderRadius: 18,
  },
  inputWrapper: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 0,
    paddingHorizontal: 14,
    paddingVertical: Platform.OS === 'ios' ? 8 : 6,
    maxHeight: 100,
    minHeight: 36,
    justifyContent: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 1,
      },
      android: {
        elevation: 1,
      },
    }),
  },
  input: {
    fontSize: 15,
    color: '#000',
    padding: 0,
    margin: 0,
    lineHeight: 20,
    ...Platform.select({
      ios: {
        paddingTop: 4,
        paddingBottom: 4,
      },
    }),
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#25D366',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#25D366',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.2,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  micButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 4,
    borderRadius: 18,
  },
});
