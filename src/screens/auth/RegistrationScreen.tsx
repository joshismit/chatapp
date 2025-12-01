/**
 * Registration Screen
 * Modern, polished sign-up page with enhanced UX
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import {
  generateRegistrationOTP,
  verifyRegistrationOTP,
} from '../../services/api/registrationService';
import { COLORS } from '../../app/constants';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/toast';

type RegistrationScreenProps = StackScreenProps<RootStackParamList, 'Registration'>;

type RegistrationStep = 'details' | 'otp';

export default function RegistrationScreen({ navigation, route }: RegistrationScreenProps) {
  // Get pre-filled values from navigation params
  const prefillEmail = route.params?.prefillEmail;
  const prefillPhone = route.params?.prefillPhone;
  
  // Step in registration process
  const [step, setStep] = useState<RegistrationStep>('details');
  
  // Form inputs
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState(prefillEmail || '');
  const [phoneNumber, setPhoneNumber] = useState(prefillPhone || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [otp, setOtp] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Timer for OTP expiry
  React.useEffect(() => {
    if (otpSent && otpExpiresIn > 0) {
      const timer = setInterval(() => {
        setOtpExpiresIn((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [otpSent, otpExpiresIn]);

  // Format phone number display
  const formatPhoneNumber = (text: string) => {
    const cleaned = text.replace(/\D/g, '');
    if (cleaned && !text.startsWith('+')) {
      return '+' + cleaned;
    }
    return text;
  };

  // Validate phone number
  const validatePhoneNumber = (phone: string): boolean => {
    const phoneRegex = /^\+[1-9]\d{9,14}$/;
    return phoneRegex.test(phone);
  };

  // Validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Validate password strength
  const validatePasswordStrength = (password: string): { isValid: boolean; message: string; strength: number } => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (password.length >= 12) strength++;
    if (/[A-Z]/.test(password)) strength++;
    if (/[a-z]/.test(password)) strength++;
    if (/[0-9]/.test(password)) strength++;
    if (/[^A-Za-z0-9]/.test(password)) strength++;

    if (password.length < 8) {
      return { isValid: false, message: 'Password must be at least 8 characters long', strength: 0 };
    }
    if (!/[A-Z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one uppercase letter', strength };
    }
    if (!/[a-z]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one lowercase letter', strength };
    }
    if (!/[0-9]/.test(password)) {
      return { isValid: false, message: 'Password must contain at least one number', strength };
    }
    return { isValid: true, message: 'Password is valid', strength };
  };

  // Get password strength color
  const getPasswordStrengthColor = (strength: number): string => {
    if (strength <= 2) return COLORS.ERROR;
    if (strength <= 4) return COLORS.WARNING;
    return COLORS.SUCCESS;
  };

  // Get password strength label
  const getPasswordStrengthLabel = (strength: number): string => {
    if (strength <= 2) return 'Weak';
    if (strength <= 4) return 'Medium';
    return 'Strong';
  };

  // Validate all fields
  const validateAllFields = (): { isValid: boolean; error: string | null } => {
    if (!firstName.trim() || firstName.trim().length < 2) {
      return { isValid: false, error: 'First name is required (minimum 2 characters)' };
    }

    if (!lastName.trim() || lastName.trim().length < 2) {
      return { isValid: false, error: 'Last name is required (minimum 2 characters)' };
    }

    if (!email.trim()) {
      return { isValid: false, error: 'Email is required' };
    }

    if (!validateEmail(email)) {
      return { isValid: false, error: 'Please enter a valid email address' };
    }

    if (!phoneNumber.trim()) {
      return { isValid: false, error: 'Phone number is required' };
    }

    if (!validatePhoneNumber(phoneNumber)) {
      return { isValid: false, error: 'Please enter a valid phone number (e.g., +1234567890)' };
    }

    if (!password) {
      return { isValid: false, error: 'Password is required' };
    }

    const passwordValidation = validatePasswordStrength(password);
    if (!passwordValidation.isValid) {
      return { isValid: false, error: passwordValidation.message };
    }

    if (!confirmPassword) {
      return { isValid: false, error: 'Please confirm your password' };
    }

    if (password !== confirmPassword) {
      return { isValid: false, error: 'Passwords do not match' };
    }

    return { isValid: true, error: null };
  };

  // Generate OTP
  const handleGenerateOTP = async () => {
    // Validate all fields first
    const validation = validateAllFields();
    if (!validation.isValid) {
      setError(validation.error);
      showErrorToast(validation.error || 'Please fill all fields correctly', 'Validation Error');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await generateRegistrationOTP({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim().toLowerCase(),
        phoneNumber: phoneNumber.trim(),
        password: password,
        confirmPassword: confirmPassword,
      });

      if (response.success) {
        setOtpSent(true);
        setOtpExpiresIn(response.expiresIn || 300);
        setStep('otp');
        
        // In development, show OTP if provided
        if (response.otp) {
          showInfoToast(
            `Your OTP is: ${response.otp}\n\n(Development mode)`,
            'OTP Generated'
          );
        } else {
          showSuccessToast(
            `OTP has been sent to ${email}`,
            'OTP Sent'
          );
        }
      } else {
        setError(response.message || 'Failed to generate OTP');
        showErrorToast(response.message || 'Failed to generate OTP', 'Error');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to generate OTP';
      setError(errorMsg);
      showErrorToast(errorMsg, 'Error');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and complete registration
  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setError('Please enter OTP');
      showErrorToast('Please enter OTP', 'Validation Error');
      return;
    }

    if (otp.length < 4) {
      setError('OTP must be at least 4 digits');
      showErrorToast('OTP must be at least 4 digits', 'Validation Error');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await verifyRegistrationOTP({
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      if (response.success) {
        showSuccessToast(
          'Your account has been created successfully. Please login to continue.',
          'Registration Successful'
        );
        
        // Navigate to login after a short delay
        setTimeout(() => {
          navigation.replace('Login');
        }, 2000);
      } else {
        const errorMsg = response.message || 'Failed to complete registration';
        setError(errorMsg);
        showErrorToast(errorMsg, 'Registration Failed');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to verify OTP';
      setError(errorMsg);
      showErrorToast(errorMsg, 'Verification Failed');
    } finally {
      setLoading(false);
    }
  };

  // Render input field with enhanced styling
  const renderInputField = (
    fieldName: string,
    placeholder: string,
    value: string,
    onChangeText: (text: string) => void,
    icon: string,
    keyboardType: 'default' | 'email-address' | 'phone-pad' = 'default',
    secureTextEntry?: boolean,
    showToggle?: boolean,
    toggleValue?: boolean,
    onToggle?: () => void,
    autoCapitalize: 'none' | 'words' = 'none'
  ) => {
    const isFocused = focusedField === fieldName;
    const hasValue = value.length > 0;
    const isValid = fieldName === 'email' ? !value || validateEmail(value) : 
                     fieldName === 'phoneNumber' ? !value || validatePhoneNumber(value) : true;

    return (
      <View style={styles.inputWrapper}>
        <View
          style={[
            styles.inputContainer,
            isFocused && styles.inputContainerFocused,
            !isValid && hasValue && styles.inputContainerError,
          ]}
        >
          <Ionicons
            name={icon as any}
            size={20}
            color={isFocused ? COLORS.PRIMARY : isValid || !hasValue ? '#666' : COLORS.ERROR}
            style={styles.inputIcon}
          />
          <TextInput
            style={styles.input}
            placeholder={placeholder}
            placeholderTextColor="#666"
            value={value}
            onChangeText={onChangeText}
            onFocus={() => setFocusedField(fieldName)}
            onBlur={() => setFocusedField(null)}
            keyboardType={keyboardType}
            secureTextEntry={secureTextEntry}
            autoCapitalize={autoCapitalize}
            autoCorrect={false}
            editable={!loading}
          />
          {showToggle && (
            <TouchableOpacity onPress={onToggle} style={styles.eyeIcon} activeOpacity={0.7}>
              <Ionicons
                name={toggleValue ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color="#666"
              />
            </TouchableOpacity>
          )}
        </View>
        {!isValid && hasValue && (
          <Text style={styles.fieldErrorText}>
            {fieldName === 'email' && 'Invalid email address'}
            {fieldName === 'phoneNumber' && 'Invalid phone number format'}
          </Text>
        )}
      </View>
    );
  };

  // Render details step
  const renderDetailsStep = () => {
    const passwordValidation = password.length > 0 ? validatePasswordStrength(password) : null;
    const passwordStrength = passwordValidation?.strength || 0;

    return (
      <View style={styles.stepContainer}>
        <View style={styles.headerSection}>
          <View style={styles.iconContainer}>
            <Ionicons name="person-add" size={48} color={COLORS.PRIMARY} />
          </View>
          <Text style={styles.stepTitle}>Create Account</Text>
          <Text style={styles.stepSubtitle}>
            Join us today! Fill in your details to get started
          </Text>
        </View>

        <View style={styles.formSection}>
          {/* First Name */}
          {renderInputField(
            'firstName',
            'First Name',
            firstName,
            (text) => {
              setFirstName(text);
              setError(null);
            },
            'person-outline',
            'default',
            false,
            false,
            undefined,
            undefined,
            'words'
          )}

          {/* Last Name */}
          {renderInputField(
            'lastName',
            'Last Name',
            lastName,
            (text) => {
              setLastName(text);
              setError(null);
            },
            'person-outline',
            'default',
            false,
            false,
            undefined,
            undefined,
            'words'
          )}

          {/* Email */}
          {renderInputField(
            'email',
            'Email Address',
            email,
            (text) => {
              setEmail(text.toLowerCase().trim());
              setError(null);
            },
            'mail-outline',
            'email-address'
          )}

          {/* Phone Number */}
          {renderInputField(
            'phoneNumber',
            'Phone Number (e.g., +1234567890)',
            phoneNumber,
            (text) => {
              setPhoneNumber(formatPhoneNumber(text));
              setError(null);
            },
            'call-outline',
            'phone-pad'
          )}

          {/* Password */}
          <View style={styles.inputWrapper}>
            {renderInputField(
              'password',
              'Create Password',
              password,
              (text) => {
                setPassword(text);
                setError(null);
              },
              'lock-closed-outline',
              'default',
              !showPassword,
              true,
              showPassword,
              () => setShowPassword(!showPassword)
            )}
            
            {/* Password Strength Indicator */}
            {password.length > 0 && passwordValidation && (
              <View style={styles.passwordStrengthContainer}>
                <View style={styles.passwordStrengthBar}>
                  <View
                    style={[
                      styles.passwordStrengthFill,
                      {
                        width: `${(passwordStrength / 6) * 100}%`,
                        backgroundColor: getPasswordStrengthColor(passwordStrength),
                      },
                    ]}
                  />
                </View>
                <Text style={[styles.passwordStrengthText, { color: getPasswordStrengthColor(passwordStrength) }]}>
                  {getPasswordStrengthLabel(passwordStrength)}
                </Text>
              </View>
            )}

            {/* Password Requirements */}
            {password.length > 0 && (
              <View style={styles.passwordRequirements}>
                <Text style={styles.passwordRequirementText}>Requirements:</Text>
                <View style={styles.requirementRow}>
                  <Ionicons
                    name={password.length >= 8 ? 'checkmark-circle' : 'ellipse-outline'}
                    size={14}
                    color={password.length >= 8 ? COLORS.SUCCESS : '#666'}
                  />
                  <Text style={[styles.passwordRequirementItem, password.length >= 8 && styles.requirementMet]}>
                    At least 8 characters
                  </Text>
                </View>
                <View style={styles.requirementRow}>
                  <Ionicons
                    name={/[A-Z]/.test(password) ? 'checkmark-circle' : 'ellipse-outline'}
                    size={14}
                    color={/[A-Z]/.test(password) ? COLORS.SUCCESS : '#666'}
                  />
                  <Text style={[styles.passwordRequirementItem, /[A-Z]/.test(password) && styles.requirementMet]}>
                    One uppercase letter
                  </Text>
                </View>
                <View style={styles.requirementRow}>
                  <Ionicons
                    name={/[a-z]/.test(password) ? 'checkmark-circle' : 'ellipse-outline'}
                    size={14}
                    color={/[a-z]/.test(password) ? COLORS.SUCCESS : '#666'}
                  />
                  <Text style={[styles.passwordRequirementItem, /[a-z]/.test(password) && styles.requirementMet]}>
                    One lowercase letter
                  </Text>
                </View>
                <View style={styles.requirementRow}>
                  <Ionicons
                    name={/[0-9]/.test(password) ? 'checkmark-circle' : 'ellipse-outline'}
                    size={14}
                    color={/[0-9]/.test(password) ? COLORS.SUCCESS : '#666'}
                  />
                  <Text style={[styles.passwordRequirementItem, /[0-9]/.test(password) && styles.requirementMet]}>
                    One number
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Confirm Password */}
          {renderInputField(
            'confirmPassword',
            'Re-enter Password',
            confirmPassword,
            (text) => {
              setConfirmPassword(text);
              setError(null);
            },
            'lock-closed-outline',
            'default',
            !showConfirmPassword,
            true,
            showConfirmPassword,
            () => setShowConfirmPassword(!showConfirmPassword)
          )}

          {/* Password Match Indicator */}
          {confirmPassword.length > 0 && (
            <View style={styles.passwordMatchContainer}>
              {password === confirmPassword ? (
                <View style={styles.passwordMatch}>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.SUCCESS} />
                  <Text style={[styles.passwordMatchText, { marginLeft: 8 }]}>Passwords match</Text>
                </View>
              ) : (
                <View style={styles.passwordMatch}>
                  <Ionicons name="close-circle" size={18} color={COLORS.ERROR} />
                  <Text style={[styles.passwordMatchText, styles.passwordMismatch, { marginLeft: 8 }]}>
                    Passwords do not match
                  </Text>
                </View>
              )}
            </View>
          )}

          {/* Error Message */}
          {error && (
            <View style={styles.errorContainer}>
              <Ionicons name="alert-circle" size={20} color={COLORS.ERROR} style={{ marginRight: 8 }} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Continue Button */}
          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleGenerateOTP}
            disabled={loading}
            activeOpacity={0.8}
          >
            {loading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Text style={styles.buttonText}>Continue</Text>
                <Ionicons name="arrow-forward" size={20} color="#fff" style={{ marginLeft: 8 }} />
              </>
            )}
          </TouchableOpacity>

          {/* Login Link */}
          <View style={styles.loginLinkContainer}>
            <Text style={styles.loginLinkText}>Already have an account? </Text>
            <TouchableOpacity onPress={() => navigation.navigate('Login')} activeOpacity={0.7}>
              <Text style={styles.loginLinkBold}>Login</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    );
  };

  // Render OTP step
  const renderOtpStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          setStep('details');
          setOtp('');
          setOtpSent(false);
          setError(null);
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.PRIMARY} />
      </TouchableOpacity>

      <View style={styles.headerSection}>
        <View style={styles.iconContainer}>
          <Ionicons name="lock-closed" size={48} color={COLORS.PRIMARY} />
        </View>
        <Text style={styles.stepTitle}>Verify Your Email</Text>
        <Text style={styles.stepSubtitle}>
          We sent a verification code to{'\n'}
          <Text style={styles.emailHighlight}>{email}</Text>
        </Text>
      </View>

      <View style={styles.formSection}>
        <View style={[styles.inputContainer, focusedField === 'otp' && styles.inputContainerFocused]}>
          <Ionicons
            name="keypad-outline"
            size={20}
            color={focusedField === 'otp' ? COLORS.PRIMARY : '#666'}
            style={styles.inputIcon}
          />
          <TextInput
            style={[styles.input, styles.otpInput]}
            placeholder="Enter 6-digit OTP"
            placeholderTextColor="#666"
            value={otp}
            onChangeText={(text) => {
              setOtp(text.replace(/\D/g, '').slice(0, 6));
              setError(null);
            }}
            onFocus={() => setFocusedField('otp')}
            onBlur={() => setFocusedField(null)}
            keyboardType="number-pad"
            maxLength={6}
            autoFocus
            editable={!loading}
          />
        </View>

        {otpExpiresIn > 0 && (
          <View style={styles.otpTimerContainer}>
            <Ionicons name="time-outline" size={16} color="#999" />
            <Text style={styles.otpTimer}>
              Code expires in {Math.floor(otpExpiresIn / 60)}:{(otpExpiresIn % 60).toString().padStart(2, '0')}
            </Text>
          </View>
        )}

        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={20} color={COLORS.ERROR} style={{ marginRight: 8 }} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        <TouchableOpacity
          style={[styles.button, (loading || otp.length < 4) && styles.buttonDisabled]}
          onPress={handleVerifyOTP}
          disabled={loading || otp.length < 4}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Text style={styles.buttonText}>Complete Registration</Text>
              <Ionicons name="checkmark-circle" size={20} color="#fff" style={{ marginLeft: 8 }} />
            </>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.resendButton}
          onPress={handleGenerateOTP}
          disabled={loading}
          activeOpacity={0.7}
        >
          <Ionicons name="refresh-outline" size={16} color={COLORS.PRIMARY} style={{ marginRight: 6 }} />
          <Text style={styles.resendButtonText}>Resend Code</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {step === 'details' && renderDetailsStep()}
        {step === 'otp' && renderOtpStep()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a0a',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  stepContainer: {
    width: '100%',
    maxWidth: 440,
    alignSelf: 'center',
  },
  headerSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(98, 0, 238, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  stepTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  stepSubtitle: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    lineHeight: 22,
  },
  emailHighlight: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  formSection: {
    width: '100%',
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 14,
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderWidth: 2,
    borderColor: '#2a2a2a',
  },
  inputContainerFocused: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: '#1f1f1f',
    ...Platform.select({
      ios: {
        shadowColor: COLORS.PRIMARY,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
    }),
  },
  inputContainerError: {
    borderColor: COLORS.ERROR,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 0,
  },
  otpInput: {
    fontSize: 20,
    letterSpacing: 4,
    textAlign: 'center',
    fontWeight: '600',
  },
  eyeIcon: {
    padding: 4,
    marginLeft: 8,
  },
  fieldErrorText: {
    fontSize: 12,
    color: COLORS.ERROR,
    marginTop: 6,
    marginLeft: 4,
  },
  passwordStrengthContainer: {
    marginTop: 12,
    marginBottom: 8,
  },
  passwordStrengthBar: {
    height: 4,
    backgroundColor: '#2a2a2a',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 6,
  },
  passwordStrengthFill: {
    height: '100%',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
  passwordStrengthText: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'right',
  },
  passwordRequirements: {
    backgroundColor: '#151515',
    padding: 14,
    borderRadius: 10,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#2a2a2a',
  },
  passwordRequirementText: {
    fontSize: 12,
    color: '#999',
    marginBottom: 10,
    fontWeight: '600',
  },
  requirementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  passwordRequirementItem: {
    fontSize: 13,
    color: '#666',
    marginLeft: 8,
  },
  requirementMet: {
    color: COLORS.SUCCESS,
  },
  passwordMatchContainer: {
    marginTop: -8,
    marginBottom: 8,
  },
  passwordMatch: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  passwordMatchText: {
    fontSize: 13,
    color: COLORS.SUCCESS,
    fontWeight: '500',
  },
  passwordMismatch: {
    color: COLORS.ERROR,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(244, 67, 54, 0.1)',
    padding: 14,
    borderRadius: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(244, 67, 54, 0.3)',
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.ERROR,
    fontWeight: '500',
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 18,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 8,
    minHeight: 56,
    ...Platform.select({
      ios: {
        shadowColor: COLORS.PRIMARY,
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
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  loginLinkContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
  },
  loginLinkText: {
    fontSize: 15,
    color: '#999',
  },
  loginLinkBold: {
    color: COLORS.PRIMARY,
    fontWeight: '700',
    fontSize: 15,
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 20,
    borderRadius: 10,
    backgroundColor: '#1a1a1a',
  },
  otpTimerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
  otpTimer: {
    fontSize: 14,
    color: '#999',
    marginLeft: 6,
    fontWeight: '500',
  },
  resendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    paddingVertical: 12,
  },
  resendButtonText: {
    fontSize: 15,
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
});
