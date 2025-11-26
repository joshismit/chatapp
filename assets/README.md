# Assets Directory

This directory contains app icons and splash screens.

## Required Files

- `icon.png` - App icon (1024x1024px)
- `splash.png` - Splash screen (1242x2436px or 2048x2732px)
- `adaptive-icon.png` - Android adaptive icon foreground (1024x1024px)
- `favicon.png` - Web favicon (48x48px)

## Quick Setup

### Option 1: Generate Placeholder Assets (Recommended for Development)

```bash
# Install sharp (image processing library)
npm install sharp --save-dev

# Generate placeholder images
node create-assets.js
```

### Option 2: Use Online Tools

1. **App Icon Generator**: https://www.appicon.co/
2. **Expo Asset Generator**: Use Expo's built-in tools
3. **Manual Creation**: Create PNG images with the specified dimensions

### Option 3: Temporarily Disable Assets (Development Only)

If you want to skip asset generation for now, you can comment out asset references in `app.json`:

```json
{
  "expo": {
    // "icon": "./assets/icon.png",  // Comment out
    "splash": {
      // "image": "./assets/splash.png",  // Comment out
      "backgroundColor": "#ffffff"
    }
  }
}
```

## Production

For production builds, make sure to:
1. Replace placeholder assets with your actual app branding
2. Follow platform-specific guidelines:
   - iOS: https://developer.apple.com/design/human-interface-guidelines/app-icons
   - Android: https://developer.android.com/guide/practices/ui_guidelines/icon_design

