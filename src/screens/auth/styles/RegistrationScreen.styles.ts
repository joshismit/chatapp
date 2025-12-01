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
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? theme.spacing.xl : theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  stepContainer: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
    flex: 1,
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    paddingTop: 0,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: theme.borderRadius.round,
    backgroundColor: theme.colors.primaryAlpha(0.1),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  stepTitle: {
    fontSize: theme.typography.fontSize.xxl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.textPrimary,
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    lineHeight: theme.typography.fontSize.lg * theme.typography.lineHeight.normal,
    paddingHorizontal: theme.spacing.lg,
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
    marginBottom: theme.spacing.md,
  },
  halfWidth: {
    flex: 1,
    marginRight: theme.spacing.sm,
    overflow: 'hidden',
  },
  halfWidthLast: {
    flex: 1,
    marginLeft: theme.spacing.sm,
    overflow: 'hidden',
  },
  inputWrapper: {
    marginBottom: theme.spacing.md,
    overflow: 'hidden',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.inputBackground,
    borderRadius: theme.borderRadius.lg,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md - 2,
    minHeight: 52,
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
    marginRight: theme.spacing.sm + 4,
  },
  input: {
    flex: 1,
    fontSize: theme.typography.fontSize.lg,
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
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.error,
    marginTop: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  passwordStrengthContainer: {
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.xs,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: theme.colors.border,
    borderRadius: theme.borderRadius.sm,
    overflow: 'hidden',
    marginBottom: theme.spacing.sm,
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: theme.borderRadius.sm,
  },
  passwordStrengthText: {
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
    textAlign: 'right',
  },
  passwordRequirements: {
    backgroundColor: theme.colors.backgroundTertiary,
    padding: theme.spacing.sm + 2,
    borderRadius: theme.borderRadius.md,
    marginTop: theme.spacing.sm,
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
    marginBottom: theme.spacing.sm,
    width: '48%',
  },
  passwordRequirementItem: {
    fontSize: theme.typography.fontSize.xs + 1,
    color: theme.colors.textTertiary,
    marginLeft: theme.spacing.sm,
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
    fontSize: theme.typography.fontSize.sm + 1,
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
    padding: theme.spacing.sm + 4,
    borderRadius: theme.borderRadius.md,
    marginTop: 2,
    marginBottom: theme.spacing.md,
    borderWidth: 1,
    borderColor: theme.colors.errorLight + '4D', // 30% opacity
  },
  errorText: {
    flex: 1,
    fontSize: theme.typography.fontSize.md,
    color: theme.colors.error,
    fontWeight: theme.typography.fontWeight.medium,
  },
  button: {
    backgroundColor: theme.colors.buttonPrimary,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
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
    letterSpacing: 0.5,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: theme.spacing.md,
    marginBottom: theme.spacing.sm,
  },
  loginLinkText: {
    fontSize: theme.typography.fontSize.md + 1,
    color: theme.colors.textSecondary,
  },
  loginLinkBold: {
    color: theme.colors.primary,
    fontWeight: theme.typography.fontWeight.bold,
    fontSize: theme.typography.fontSize.md + 1,
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

