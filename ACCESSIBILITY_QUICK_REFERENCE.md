# Accessibility & i18n Quick Reference

## 🚀 Quick Start

### 1. Using i18n in Components

```typescript
import { t } from '../i18n';

// Simple translation
<Text>{t('chatList.archive')}</Text>

// With variables
<Text>{t('chatList.chatWith', { name: 'John' })}</Text>
```

### 2. Adding Accessibility Labels

```typescript
<TouchableOpacity
  accessibilityRole="button"
  accessibilityLabel={t('chatInput.sendButton')}
  accessibilityHint="Press to send your message"
>
  <Ionicons name="send" />
</TouchableOpacity>
```

### 3. Using Font Size Multiplier

```typescript
import { useSettings } from '../hooks/useSettings';

function MyComponent() {
  const { fontSizeMultiplier } = useSettings();
  
  return (
    <Text style={{ fontSize: 16 * fontSizeMultiplier }}>
      Adjustable text
    </Text>
  );
}
```

### 4. Changing Font Size (Settings Screen)

```typescript
import { useSettings } from '../hooks/useSettings';
import { FontSize } from '../services/settings';

function SettingsScreen() {
  const { updateFontSize } = useSettings();
  
  return (
    <TouchableOpacity onPress={() => updateFontSize('large')}>
      <Text>Large</Text>
    </TouchableOpacity>
  );
}
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `src/i18n/index.ts` | Main i18n functions (`t()`) |
| `src/i18n/locales/en.ts` | English translations |
| `src/i18n/locales/es.ts` | Spanish translations |
| `src/services/settings.ts` | Font size & locale settings |
| `src/hooks/useSettings.ts` | React hook for settings |
| `src/screens/SettingsScreen.tsx` | Example settings UI |

---

## 🎯 Component Examples

### ChatItem ✅
- ✅ Accessibility labels for chat, unread count, menu
- ✅ i18n for all text (Archive, Cancel, etc.)
- ✅ Font size multiplier applied to all text

### ChatInput ✅
- ✅ Accessibility labels for input, buttons
- ✅ i18n for placeholder, button labels
- ✅ Font size multiplier for input text

### MessageBubble ✅
- ✅ Accessibility labels for message content, status
- ✅ i18n for status messages (sending, sent, etc.)
- ✅ Font size multiplier for message text

---

## 🔍 Testing Accessibility

### iOS (VoiceOver)
1. Enable VoiceOver: Settings → Accessibility → VoiceOver
2. Navigate with swipe gestures
3. Listen to accessibility labels

### Android (TalkBack)
1. Enable TalkBack: Settings → Accessibility → TalkBack
2. Navigate with swipe gestures
3. Listen to accessibility labels

---

## 📝 Adding New Translations

1. Add to `src/i18n/locales/en.ts`:
```typescript
export const en = {
  chatList: {
    newKey: 'New text',
  },
};
```

2. Add to `src/i18n/locales/es.ts`:
```typescript
export const es = {
  chatList: {
    newKey: 'Nuevo texto',
  },
};
```

3. Use in component:
```typescript
<Text>{t('chatList.newKey')}</Text>
```

---

## 🎨 Font Size Options

| Option | Multiplier | Example (16px base) |
|--------|-----------|---------------------|
| Small | 0.85x | 13.6px |
| Medium | 1.0x | 16px |
| Large | 1.15x | 18.4px |
| Extra Large | 1.3x | 20.8px |

---

## ✅ Checklist

- [x] All user-facing text uses `t()` function
- [x] All interactive elements have `accessibilityLabel`
- [x] All text elements use `fontSizeMultiplier`
- [x] Settings screen allows font size changes
- [x] Settings screen allows locale changes
- [x] Accessibility roles are properly set
- [x] Accessibility hints provided where needed

