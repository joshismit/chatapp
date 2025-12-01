/**
 * Login Screen Styles
 * Separate style file for LoginScreen component
 */

import { StyleSheet, Platform } from 'react-native';
import { theme } from '../../../theme';

export const loginScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: theme.spacing.lg,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl + theme.spacing.md,
  },
  headerTitle: {
    fontSize: theme.typography.fontSize.xxxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    marginTop: theme.spacing.md,
  },
  stepContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  stepTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  stepSubtitle: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  methodContainer: {
    flexDirection: 'row',
    gap: theme.spacing.sm + 4,
    marginBottom: theme.spacing.xl,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.inputBackground,
    borderWidth: 2,
    borderColor: 'transparent',
    gap: theme.spacing.sm,
  },
  methodButtonActive: {
    borderColor: theme.colors.primary,
    backgroundColor: theme.colors.primaryAlpha(0.1),
  },
  methodButtonText: {
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textTertiary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  methodButtonTextActive: {
    color: theme.colors.primary,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  inputIcon: {
    marginRight: theme.spacing.sm + 4,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.lg,
    color: theme.colors.textPrimary,
    paddingVertical: theme.spacing.md,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.errorLight + '1A',
    padding: theme.spacing.sm + 4,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  errorText: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.error,
  },
  button: {
    backgroundColor: theme.colors.buttonPrimary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: theme.spacing.md,
    minHeight: 52,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 6,
      },
    }),
  },
  buttonDisabled: {
    opacity: theme.opacity.disabled,
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: theme.typography.fontSize.lg + 1,
    fontWeight: theme.typography.fontWeight.bold,
  },
  qrContainer: {
    alignItems: 'center',
    marginVertical: theme.spacing.xl,
    padding: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
  },
  qrCode: {
    marginBottom: theme.spacing.md,
  },
  qrInstructions: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    marginTop: theme.spacing.md,
  },
  loadingContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
  },
  loadingText: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginTop: theme.spacing.md,
  },
});

