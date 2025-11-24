# Accessibility & i18n Implementation Guide

This guide shows how accessibility labels, adjustable font sizes, and internationalization (i18n) are implemented in the chat app.

## 📋 Table of Contents

1. [i18n System](#i18n-system)
2. [Accessibility Labels](#accessibility-labels)
3. [Adjustable Font Sizes](#adjustable-font-sizes)
4. [Usage Examples](#usage-examples)

---

## 🌍 i18n System

### Simple File-Based i18n

We use a lightweight file-based i18n system (no external dependencies).

**File Structure:**
```
src/i18n/
├── index.ts           # Main i18n functions
└── locales/
    ├── en.ts          # English translations
    └── es.ts          # Spanish translations
```

### Usage

```typescript
import { t } from '../i18n';

// Simple translation
const label = t('chatList.archive'); // "Archive" or "Archivar"

// With replacements
const message = t('chatList.chatWith', { name: 'John' });
// English: "Chat with John"
// Spanish: "Chatear con John"
```

### Adding New Translations

1. Add keys to `src/i18n/locales/en.ts`:
```typescript
export const en = {
  chatList: {
    // ... existing keys
    newKey: 'New translation',
  },
};
```

2. Add same keys to `src/i18n/locales/es.ts`:
```typescript
export const es = {
  chatList: {
    // ... existing keys
    newKey: 'Nueva traducción',
  },
};
```

3. Use in components:
```typescript
<Text>{t('chatList.newKey')}</Text>
```

---

## ♿ Accessibility Labels

### React Native Accessibility Props

All interactive components include proper accessibility labels:

- `accessibilityLabel`: Descriptive label for screen readers
- `accessibilityRole`: Semantic role (button, text, textbox, etc.)
- `accessibilityHint`: Additional context
- `accessibilityState`: Current state (selected, disabled, etc.)

### Example: ChatItem Component

```typescript
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel={t('chatList.chatWith', { name: item.userName })}
  accessibilityHint={t('chatList.lastMessage', { message: item.lastMessage })}
  accessibilityState={{ selected: false }}
>
  {/* Component content */}
</TouchableOpacity>
```

### Example: ChatInput Component

```typescript
<TextInput
  accessibilityLabel={t('chatInput.inputLabel')}
  accessibilityHint="Type your message here"
  accessibilityRole="textbox"
  accessibilityState={{ disabled: false }}
/>
```

### Example: MessageBubble Component

```typescript
<View
  accessibilityRole="text"
  accessibilityLabel={`${accessibilityLabel}. ${timestampLabel}. ${getStatusLabel()}`}
>
  {/* Message content */}
</View>
```

---

## 📏 Adjustable Font Sizes

### Settings Service

Font size preferences are stored in AsyncStorage via `src/services/settings.ts`.

**Font Size Options:**
- `small`: 0.85x multiplier
- `medium`: 1.0x multiplier (default)
- `large`: 1.15x multiplier
- `extraLarge`: 1.3x multiplier

### Using Font Size in Components

1. **Import the hook:**
```typescript
import { useSettings } from '../../hooks/useSettings';

function MyComponent() {
  const { fontSizeMultiplier } = useSettings();
  // ...
}
```

2. **Apply to styles:**
```typescript
const dynamicStyles = StyleSheet.create({
  text: {
    fontSize: 16 * fontSizeMultiplier,
    lineHeight: 20 * fontSizeMultiplier,
  },
});
```

3. **Use in component:**
```typescript
<Text style={dynamicStyles.text}>Hello World</Text>
```

### Example: ChatItem with Font Size

```typescript
export default function ChatItem({ item, onPress }: ChatItemProps) {
  const { fontSizeMultiplier } = useSettings();

  const dynamicStyles = StyleSheet.create({
    userName: {
      ...styles.userName,
      fontSize: styles.userName.fontSize * fontSizeMultiplier,
    },
  });

  return (
    <Text style={dynamicStyles.userName}>{item.userName}</Text>
  );
}
```

---

## 💡 Usage Examples

### Complete ChatItem Example

```typescript
import { t } from '../../i18n';
import { useSettings } from '../../hooks/useSettings';

export default function ChatItem({ item, onPress }: ChatItemProps) {
  const { fontSizeMultiplier } = useSettings();

  // Accessibility labels
  const chatLabel = t('chatList.chatWith', { name: item.userName });
  const unreadLabel = item.unreadCount > 0
    ? t('chatList.unreadMessages', { count: item.unreadCount })
    : t('chatList.noUnread');

  // Dynamic styles
  const dynamicStyles = StyleSheet.create({
    userName: {
      fontSize: 17 * fontSizeMultiplier,
    },
  });

  return (
    <TouchableOpacity
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel={chatLabel}
      accessibilityHint={t('chatList.lastMessage', { message: item.lastMessage })}
    >
      <Text style={dynamicStyles.userName}>{item.userName}</Text>
      {item.unreadCount > 0 && (
        <View accessibilityLabel={unreadLabel}>
          <Text>{item.unreadCount}</Text>
        </View>
      )}
    </TouchableOpacity>
  );
}
```

### Complete ChatInput Example

```typescript
import { t } from '../../i18n';
import { useSettings } from '../../hooks/useSettings';

export default function ChatInput({ onSendMessage }: ChatInputProps) {
  const { fontSizeMultiplier } = useSettings();
  const [message, setMessage] = useState('');

  const dynamicStyles = StyleSheet.create({
    input: {
      fontSize: 15 * fontSizeMultiplier,
      lineHeight: 20 * fontSizeMultiplier,
    },
  });

  return (
    <View accessibilityRole="toolbar">
      <TextInput
        style={dynamicStyles.input}
        placeholder={t('chatInput.placeholder')}
        value={message}
        onChangeText={setMessage}
        accessibilityLabel={t('chatInput.inputLabel')}
        accessibilityHint="Type your message here"
        accessibilityRole="textbox"
      />
      <TouchableOpacity
        onPress={() => onSendMessage(message)}
        accessibilityRole="button"
        accessibilityLabel={t('chatInput.sendButton')}
        accessibilityHint="Press to send your message"
      >
        <Ionicons name="send" />
      </TouchableOpacity>
    </View>
  );
}
```

### Settings Screen Example

```typescript
import { useSettings } from '../hooks/useSettings';
import { FontSize } from '../services/settings';

export default function SettingsScreen() {
  const { settings, fontSizeMultiplier, updateFontSize } = useSettings();

  const fontSizeOptions: { label: string; value: FontSize }[] = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'medium' },
    { label: 'Large', value: 'large' },
    { label: 'Extra Large', value: 'extraLarge' },
  ];

  return (
    <ScrollView>
      {fontSizeOptions.map((option) => (
        <TouchableOpacity
          key={option.value}
          onPress={() => updateFontSize(option.value)}
          accessibilityRole="button"
          accessibilityLabel={`Set font size to ${option.label}`}
          accessibilityState={{ selected: settings.fontSize === option.value }}
        >
          <Text style={{ fontSize: 16 * fontSizeMultiplier }}>
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}
```

---

## 🔧 Advanced: Using react-intl (Alternative)

If you prefer `react-intl`, here's how to integrate it:

### Installation

```bash
npm install react-intl
```

### Setup

```typescript
// src/i18n/intl.ts
import { IntlProvider } from 'react-intl';
import enMessages from './locales/en.json';
import esMessages from './locales/es.json';

const messages = {
  en: enMessages,
  es: esMessages,
};

export function I18nProvider({ children, locale }: { children: React.ReactNode; locale: 'en' | 'es' }) {
  return (
    <IntlProvider locale={locale} messages={messages[locale]}>
      {children}
    </IntlProvider>
  );
}
```

### Usage

```typescript
import { useIntl } from 'react-intl';

function MyComponent() {
  const intl = useIntl();
  
  return (
    <Text>
      {intl.formatMessage({ id: 'chatList.archive' })}
    </Text>
  );
}
```

---

## ✅ Best Practices

1. **Always use i18n for user-facing text** - Never hardcode strings
2. **Provide descriptive accessibility labels** - Help screen reader users
3. **Test with screen readers** - Use VoiceOver (iOS) or TalkBack (Android)
4. **Respect font size preferences** - Apply multipliers to all text
5. **Use semantic roles** - `button`, `textbox`, `text`, etc.
6. **Provide hints when needed** - Explain what actions do
7. **Test in different languages** - Ensure UI works with longer translations

---

## 📚 Resources

- [React Native Accessibility](https://reactnative.dev/docs/accessibility)
- [WCAG Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [react-intl Documentation](https://formatjs.io/docs/react-intl/)

