/**
 * Registration Screen Styles
 * Separate style file for RegistrationScreen component
 */

import { StyleSheet, Platform } from 'react-native';
import { theme } from '../../../theme';

export const registrationScreenStyles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.md,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.md : theme.spacing.sm,
    paddingBottom: theme.spacing.sm,
  },
  stepContainer: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.md,
    paddingTop: 0,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.primaryAlpha(0.1),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  stepTitle: {
    fontSize: theme.typography.fontSize.xl + 2,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: theme.typography.fontSize.sm + 1,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.fontSize.md * theme.typography.lineHeight.tight,
    paddingHorizontal: theme.spacing.md,
  },
  emailHighlight: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  formSection: {
    width: '100%',
    paddingTop: 0,
  },
  inputsGroup: {
    width: '100%',
  },
  rowContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  halfWidth: {
    flex: 1,
    marginRight: theme.spacing.xs + 2,
    overflow: 'hidden',
  },
  halfWidthLast: {
    flex: 1,
    marginLeft: theme.spacing.xs + 2,
    overflow: 'hidden',
  },
  inputWrapper: {
    marginBottom: theme.spacing.sm,
    overflow: 'hidden',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.sm + 4,
    paddingVertical: theme.spacing.sm,
    minHeight: 44,
    borderWidth: 2,
    borderColor: theme.colors.inputBorder,
  },
  inputContainerFocused: {
    borderColor: theme.colors.inputBorderFocused,
    backgroundColor: theme.colors.surfaceElevated,
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 2,
      },
      web: {
        boxShadow: `0 0 0 2px ${theme.colors.primaryAlpha(0.25)}`,
      },
    }),
  },
  inputContainerError: {
    borderColor: theme.colors.error,
  },
  inputIcon: {
    marginRight: theme.spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.md + 1,
    color: theme.colors.textPrimary,
    paddingVertical: 0,
    ...Platform.select({
      web: {
        outline: 'none',
        outlineStyle: 'none',
        border: 'none',
      },
    }),
  },
  otpInput: {
    fontSize: theme.typography.fontSize.xl,
    letterSpacing: 4,
    textAlign: 'center',
    fontWeight: theme.typography.fontWeight.semibold,
  },
  eyeIcon: {
    padding: theme.spacing.xs,
    marginLeft: theme.spacing.sm,
  },
  fieldErrorText: {
    fontSize: theme.typography.fontSize.xs + 1,
    color: theme.colors.error,
    marginTop: 3,
    marginLeft: theme.spacing.xs,
  },
  passwordStrengthContainer: {
    marginTop: 4,
    marginBottom: 2,
  },
  passwordStrengthBar: {
    height: 3,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    marginBottom: 4,
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  passwordStrengthText: {
    fontSize: theme.typography.fontSize.xs + 1,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'right',
  },
  passwordRequirements: {
    backgroundColor: theme.colors.backgroundTertiary,
    padding: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.sm,
    marginTop: 4,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  requirementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 3,
    width: '48%',
  },
  passwordRequirementItem: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textTertiary,
    marginLeft: 4,
  },
  requirementMet: {
    color: theme.colors.success,
  },
  passwordMatchContainer: {
    marginTop: -2,
    marginBottom: 2,
    marginLeft: theme.spacing.xs,
  },
  passwordMatch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordMatchText: {
    fontSize: theme.typography.fontSize.xs + 1,
    color: theme.colors.success,
    fontWeight: theme.typography.fontWeight.medium,
  },
  passwordMismatch: {
    color: theme.colors.error,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.errorLight + '1A', // 10% opacity
    padding: theme.spacing.xs + 2,
    borderRadius: theme.borderRadius.sm,
    marginTop: 2,
    marginBottom: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.errorLight + '4D', // 30% opacity
  },
  errorText: {
    flex: 1,
    fontSize: theme.typography.fontSize.sm + 1,
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeight.medium,
  },
  button: {
    backgroundColor: theme.colors.buttonPrimary,
    paddingVertical: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
    minHeight: 44,
    width: '100%',
    ...Platform.select({
      ios: {
        shadowColor: theme.colors.primary,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.2,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  buttonDisabled: {
    opacity: theme.opacity.disabled,
  },
  buttonText: {
    color: theme.colors.buttonText,
    fontSize: theme.typography.fontSize.md + 1,
    fontWeight: theme.typography.fontWeight.bold,
    letterSpacing: 0.3,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  loginLinkText: {
    fontSize: theme.typography.fontSize.sm + 1,
    color: theme.colors.textSecondary,
  },
  loginLinkBold: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.sm + 1,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: theme.spacing.sm + 2,
    marginBottom: theme.spacing.xl,
    borderRadius: theme.borderRadius.md + 2,
    backgroundColor: theme.colors.inputBackground,
    marginLeft: -theme.spacing.xs,
  },
  otpTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.sm + 4,
    marginBottom: theme.spacing.xl,
  },
  otpTimer: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    marginLeft: theme.spacing.sm,
    fontWeight: theme.typography.fontWeight.medium,
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: theme.spacing.lg,
    paddingVertical: theme.spacing.sm + 4,
  },
  resendButtonText: {
    fontSize: theme.typography.fontSize.md + 1,
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});

