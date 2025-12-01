# Theme System Documentation

## Overview

This theme system provides a centralized way to manage colors, spacing, typography, and other design tokens across the entire application. Similar to SCSS variables, but designed for React Native.

## Structure

```
src/theme/
├── theme.ts          # Main theme definitions (light & dark)
├── index.ts          # Exports
└── README.md         # This file
```

## Usage

### Import Theme

```typescript
import { theme } from '../theme';
// or
import { theme, lightTheme, darkTheme } from '../theme';
```

### Using Colors

```typescript
import { theme } from '../theme';

const styles = StyleSheet.create({
  container: {
    backgroundColor: theme.colors.background,
    borderColor: theme.colors.border,
  },
  text: {
    color: theme.colors.textPrimary,
  },
  button: {
    backgroundColor: theme.colors.buttonPrimary,
  },
});
```

### Using Spacing

```typescript
import { theme } from '../theme';

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.md,      // 16px
    marginTop: theme.spacing.lg,    // 24px
    gap: theme.spacing.sm,         // 8px
  },
});
```

### Using Typography

```typescript
import { theme } from '../theme';

const styles = StyleSheet.create({
  title: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    lineHeight: theme.typography.fontSize.xxl * theme.typography.lineHeight.normal,
  },
  body: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
  },
});
```

### Using Border Radius

```typescript
import { theme } from '../theme';

const styles = StyleSheet.create({
  card: {
    borderRadius: theme.borderRadius.lg,  // 12px
  },
  button: {
    borderRadius: theme.borderRadius.round,  // 9999px (fully rounded)
  },
});
```

### Using Shadows

```typescript
import { theme } from '../theme';

const styles = StyleSheet.create({
  elevatedCard: {
    ...theme.shadows.md,
  },
  floatingButton: {
    ...theme.shadows.lg,
  },
});
```

## Creating Page-Specific Styles

Create a separate style file for each screen/component:

```
src/screens/auth/styles/
├── RegistrationScreen.styles.ts
└── LoginScreen.styles.ts
```

Example:

```typescript
// src/screens/auth/styles/RegistrationScreen.styles.ts
import { StyleSheet } from 'react-native';
import { theme } from '../../../theme';

export const registrationScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: theme.spacing.lg,
  },
  // ... more styles
});
```

Then import in your component:

```typescript
// src/screens/auth/RegistrationScreen.tsx
import { registrationScreenStyles as styles } from './styles/RegistrationScreen.styles';

export default function RegistrationScreen() {
  return (
    <View style={styles.container}>
      {/* ... */}
    </View>
  );
}
```

## Changing Colors

To change colors globally, edit `src/theme/theme.ts`:

```typescript
export const darkTheme: Theme = {
  colors: {
    primary: '#6200ee',  // Change this to update primary color everywhere
    // ... other colors
  },
  // ... rest of theme
};
```

## Available Theme Properties

### Colors
- `primary`, `primaryLight`, `primaryDark`, `primaryAlpha()`
- `secondary`, `secondaryLight`, `secondaryDark`
- `success`, `error`, `warning`, `info` (with Light variants)
- `background`, `backgroundSecondary`, `backgroundTertiary`
- `surface`, `surfaceElevated`
- `textPrimary`, `textSecondary`, `textTertiary`, `textInverse`, `textDisabled`
- `border`, `borderLight`, `borderDark`
- `inputBackground`, `inputBorder`, `inputBorderFocused`, `inputPlaceholder`
- `buttonPrimary`, `buttonSecondary`, `buttonDisabled`, `buttonText`
- `messageSent`, `messageReceived`, `messageFailed`
- `overlay`, `overlayDark`
- `iconPrimary`, `iconSecondary`, `iconTertiary`

### Spacing
- `xs: 4`, `sm: 8`, `md: 16`, `lg: 24`, `xl: 32`, `xxl: 48`

### Border Radius
- `sm: 4`, `md: 8`, `lg: 12`, `xl: 16`, `round: 9999`

### Typography
- `fontSize`: `xs`, `sm`, `md`, `lg`, `xl`, `xxl`, `xxxl`
- `fontWeight`: `regular`, `medium`, `semibold`, `bold`
- `lineHeight`: `tight`, `normal`, `relaxed`

### Shadows
- `sm`, `md`, `lg`, `xl`

### Opacity
- `disabled: 0.6`, `hover: 0.8`, `pressed: 0.9`

## Best Practices

1. **Always use theme variables** - Never hardcode colors or spacing
2. **Create separate style files** - One style file per component/screen
3. **Use semantic color names** - `textPrimary` instead of `#FFFFFF`
4. **Consistent spacing** - Use theme spacing values, not arbitrary numbers
5. **Update theme, not components** - Change colors in theme.ts, not in individual files

## Migration Guide

To migrate existing components:

1. Create a style file: `ComponentName.styles.ts`
2. Import theme: `import { theme } from '../../../theme'`
3. Replace hardcoded values:
   - Colors: `'#6200ee'` → `theme.colors.primary`
   - Spacing: `16` → `theme.spacing.md`
   - Font sizes: `24` → `theme.typography.fontSize.xxl`
4. Export styles: `export const componentStyles = StyleSheet.create({...})`
5. Import in component: `import { componentStyles as styles } from './styles/ComponentName.styles'`

## Future Enhancements

- Theme switching (light/dark mode toggle)
- Custom theme creation
- Theme persistence (save user preference)
- Platform-specific theme variants

