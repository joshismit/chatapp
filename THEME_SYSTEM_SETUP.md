# 🎨 Theme System Setup Complete

## Overview

A comprehensive theme system has been created for the React Native frontend, similar to SCSS variables but designed for React Native's StyleSheet API.

## 📁 File Structure

```
src/
├── theme/
│   ├── theme.ts          # Main theme definitions (light & dark themes)
│   ├── index.ts          # Theme exports
│   └── README.md         # Detailed documentation
│
└── screens/
    └── auth/
        └── styles/
            ├── RegistrationScreen.styles.ts
            └── LoginScreen.styles.ts
```

## ✅ What's Been Created

### 1. **Global Theme System** (`src/theme/theme.ts`)
- Complete color palette (primary, secondary, status colors, backgrounds, text, borders, etc.)
- Spacing system (xs, sm, md, lg, xl, xxl)
- Typography system (font sizes, weights, line heights)
- Border radius values
- Shadow presets
- Opacity values
- Both light and dark theme support

### 2. **Separate Style Files**
- `RegistrationScreen.styles.ts` - All styles for registration screen
- `LoginScreen.styles.ts` - All styles for login screen
- `MessageBubble.styles.ts` - Message bubble component styles

### 3. **Updated Components**
- `RegistrationScreen.tsx` - Now uses theme system and separate styles file

## 🎯 How to Use

### Import Theme
```typescript
import { theme } from '../theme';
```

### Use in Styles
```typescript
import { theme } from '../theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
    borderRadius: theme.borderRadius.md,
  },
  text: {
    color: theme.colors.textPrimary,
    fontSize: theme.typography.fontSize.lg,
  },
});
```

### Create Page-Specific Styles
1. Create a new file: `ComponentName.styles.ts`
2. Import theme and create styles
3. Export styles
4. Import in component

Example:
```typescript
// src/screens/auth/styles/MyScreen.styles.ts
import { StyleSheet } from 'react-native';
import { theme } from '../../../theme';

export const myScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  // ... more styles
});
```

## 🎨 Changing Colors

To change colors globally, edit `src/theme/theme.ts`:

```typescript
export const darkTheme: Theme = {
  colors: {
    primary: '#6200ee',  // Change this to update primary color everywhere
    // ... other colors
  },
};
```

All components using `theme.colors.primary` will automatically update!

## 📋 Available Theme Properties

### Colors
- `primary`, `primaryLight`, `primaryDark`, `primaryAlpha()`
- `secondary`, `secondaryLight`, `secondaryDark`
- `success`, `error`, `warning`, `info` (with Light variants)
- `background`, `backgroundSecondary`, `backgroundTertiary`
- `surface`, `surfaceElevated`
- `textPrimary`, `textSecondary`, `textTertiary`, `textInverse`
- `border`, `borderLight`, `borderDark`
- `inputBackground`, `inputBorder`, `inputBorderFocused`
- `buttonPrimary`, `buttonSecondary`, `buttonDisabled`
- `messageSent`, `messageReceived`, `messageFailed`
- And more...

### Spacing
- `xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, `xl: 32`, `xxl: 48`

### Typography
- Font sizes: `xs`, `sm`, `md`, `lg`, `xl`, `xxl`, `xxxl`
- Font weights: `regular`, `medium`, `semibold`, `bold`
- Line heights: `tight`, `normal`, `relaxed`

### Border Radius
- `sm: 4`, `md: 8`, `lg: 12`, `xl: 16`, `round: 9999`

## 🔄 Migration Guide

To migrate other components:

1. **Create style file**: `ComponentName.styles.ts`
2. **Import theme**: `import { theme } from '../../../theme'`
3. **Replace hardcoded values**:
   - Colors: `'#6200ee'` → `theme.colors.primary`
   - Spacing: `16` → `theme.spacing.md`
   - Font sizes: `24` → `theme.typography.fontSize.xxl`
4. **Export styles**: `export const componentStyles = StyleSheet.create({...})`
5. **Import in component**: `import { componentStyles as styles } from './styles/ComponentName.styles'`

## 📚 Documentation

See `src/theme/README.md` for complete documentation with examples.

## ✨ Benefits

1. **Easy Color Changes** - Update colors in one place
2. **Consistent Design** - All components use same spacing/typography
3. **Better Organization** - Separate style files for each component
4. **Type Safety** - TypeScript types for all theme properties
5. **Future-Proof** - Easy to add theme switching (light/dark mode)

## 🚀 Next Steps

1. Migrate remaining screens to use theme system
2. Create style files for all components
3. Consider adding theme switching (light/dark mode toggle)
4. Update constants file to use theme instead of hardcoded COLORS

---

**Status**: ✅ Theme system is ready to use! Start migrating components to use the new theme system.

