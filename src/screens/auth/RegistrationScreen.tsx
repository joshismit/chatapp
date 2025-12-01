/**
 * Registration Screen
 * Handles user registration via phone or email
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import {
  checkAvailability,
  generateRegistrationOTP,
  verifyRegistrationOTP,
} from '../../services/api/registrationService';
import { COLORS } from '../../app/constants';

type RegistrationScreenProps = StackScreenProps<RootStackParamList, 'Registration'>;

type RegistrationMethod = 'phone' | 'email';

export default function RegistrationScreen({ navigation }: RegistrationScreenProps) {
  // Registration method (phone or email)
  const [method, setMethod] = useState<RegistrationMethod>('phone');
  
  // Step in registration process
  const [step, setStep] = useState<'input' | 'otp' | 'name'>('input');
  
  // Form inputs
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [displayName, setDisplayName] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);
  const [available, setAvailable] = useState<boolean | null>(null);

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
    // Remove all non-digit characters
    const cleaned = text.replace(/\D/g, '');
    
    // Add + prefix if not present
    if (cleaned && !text.startsWith('+')) {
      return '+' + cleaned;
    }
    return text;
  };

  // Validate phone number
  const validatePhoneNumber = (phone: string): boolean => {
    // Basic validation: should start with + and have at least 10 digits
    const phoneRegex = /^\+[1-9]\d{9,14}$/;
    return phoneRegex.test(phone);
  };

  // Validate email
  const validateEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Check availability
  const handleCheckAvailability = async () => {
    const identifier = method === 'phone' ? phoneNumber : email;
    
    if (!identifier.trim()) {
      setError(method === 'phone' ? 'Please enter phone number' : 'Please enter email');
      return;
    }

    if (method === 'phone' && !validatePhoneNumber(phoneNumber)) {
      setError('Please enter a valid phone number (e.g., +1234567890)');
      return;
    }

    if (method === 'email' && !validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await checkAvailability(
        method === 'phone' ? phoneNumber : undefined,
        method === 'email' ? email : undefined
      );

      if (response.available) {
        setAvailable(true);
        // Automatically proceed to generate OTP
        await handleGenerateOTP();
      } else {
        setAvailable(false);
        Alert.alert(
          'Already Registered',
          response.message || 'This phone/email is already registered. Please login instead.',
          [
            {
              text: 'Go to Login',
              onPress: () => navigation.navigate('Login'),
            },
            {
              text: 'Cancel',
              style: 'cancel',
            },
          ]
        );
      }
    } catch (err: any) {
      setError(err.message || 'Failed to check availability');
      setAvailable(null);
    } finally {
      setLoading(false);
    }
  };

  // Generate OTP
  const handleGenerateOTP = async () => {
    const identifier = method === 'phone' ? phoneNumber : email;
    
    if (!identifier.trim()) {
      setError(method === 'phone' ? 'Please enter phone number' : 'Please enter email');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await generateRegistrationOTP({
        phoneNumber: method === 'phone' ? phoneNumber : undefined,
        email: method === 'email' ? email : undefined,
      });

      if (response.success) {
        setOtpSent(true);
        setOtpExpiresIn(response.expiresIn || 300); // 5 minutes default
        setStep('otp');
        
        // In development, show OTP if provided
        if (response.otp) {
          Alert.alert('OTP Generated', `Your OTP is: ${response.otp}\n\n(Development mode)`);
        } else {
          Alert.alert(
            'OTP Sent',
            method === 'phone'
              ? `OTP has been sent to ${phoneNumber}`
              : `OTP has been sent to ${email}`
          );
        }
      } else {
        setError(response.message || 'Failed to generate OTP');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to generate OTP');
    } finally {
      setLoading(false);
    }
  };

  // Verify OTP and complete registration
  const handleVerifyOTP = async () => {
    if (!otp.trim()) {
      setError('Please enter OTP');
      return;
    }

    if (otp.length < 4) {
      setError('OTP must be at least 4 digits');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await verifyRegistrationOTP({
        phoneNumber: method === 'phone' ? phoneNumber : undefined,
        email: method === 'email' ? email : undefined,
        otp: otp.trim(),
        displayName: displayName.trim() || 'User',
      });

      if (response.success) {
        if (response.action === 'login') {
          Alert.alert(
            'Registration Successful',
            'Your account has been created. Please login to continue.',
            [
              {
                text: 'Go to Login',
                onPress: () => navigation.replace('Login'),
              },
            ]
          );
        } else {
          // Should not happen, but handle it
          navigation.replace('Login');
        }
      } else {
        setError(response.message || 'Failed to complete registration');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify OTP');
    } finally {
      setLoading(false);
    }
  };

  // Handle OTP input - auto proceed to name if OTP is complete
  const handleOtpChange = (text: string) => {
    setOtp(text);
    setError(null);
    
    // Auto proceed to name step when OTP is entered (6 digits typically)
    if (text.length >= 6) {
      setStep('name');
    }
  };

  // Render input step
  const renderInputStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Create Account</Text>
      <Text style={styles.stepSubtitle}>
        Choose how you want to register
      </Text>

      {/* Method Selection */}
      <View style={styles.methodContainer}>
        <TouchableOpacity
          style={[styles.methodButton, method === 'phone' && styles.methodButtonActive]}
          onPress={() => {
            setMethod('phone');
            setError(null);
            setAvailable(null);
          }}
        >
          <Ionicons
            name="call-outline"
            size={24}
            color={method === 'phone' ? COLORS.PRIMARY : '#666'}
          />
          <Text
            style={[
              styles.methodButtonText,
              method === 'phone' && styles.methodButtonTextActive,
            ]}
          >
            Phone
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.methodButton, method === 'email' && styles.methodButtonActive]}
          onPress={() => {
            setMethod('email');
            setError(null);
            setAvailable(null);
          }}
        >
          <Ionicons
            name="mail-outline"
            size={24}
            color={method === 'email' ? COLORS.PRIMARY : '#666'}
          />
          <Text
            style={[
              styles.methodButtonText,
              method === 'email' && styles.methodButtonTextActive,
            ]}
          >
            Email
          </Text>
        </TouchableOpacity>
      </View>

      {/* Input Field */}
      <View style={styles.inputContainer}>
        <Ionicons
          name={method === 'phone' ? 'call-outline' : 'mail-outline'}
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder={method === 'phone' ? 'Phone Number (e.g., +1234567890)' : 'Email Address'}
          placeholderTextColor="#999"
          value={method === 'phone' ? phoneNumber : email}
          onChangeText={(text) => {
            if (method === 'phone') {
              setPhoneNumber(formatPhoneNumber(text));
            } else {
              setEmail(text.toLowerCase().trim());
            }
            setError(null);
            setAvailable(null);
          }}
          keyboardType={method === 'phone' ? 'phone-pad' : 'email-address'}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
        />
      </View>

      {available === false && (
        <View style={styles.availabilityContainer}>
          <Ionicons name="alert-circle-outline" size={20} color={COLORS.ERROR} />
          <Text style={styles.availabilityText}>
            This {method === 'phone' ? 'phone number' : 'email'} is already registered
          </Text>
        </View>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={20} color={COLORS.ERROR} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleCheckAvailability}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Continue</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={() => navigation.navigate('Login')}
      >
        <Text style={styles.linkText}>
          Already have an account? <Text style={styles.linkTextBold}>Login</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render OTP step
  const renderOtpStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          setStep('input');
          setOtp('');
          setOtpSent(false);
          setError(null);
        }}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.PRIMARY} />
      </TouchableOpacity>

      <Text style={styles.stepTitle}>Enter OTP</Text>
      <Text style={styles.stepSubtitle}>
        {method === 'phone'
          ? `We sent a code to ${phoneNumber}`
          : `We sent a code to ${email}`}
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons
          name="lock-closed-outline"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Enter OTP"
          placeholderTextColor="#999"
          value={otp}
          onChangeText={handleOtpChange}
          keyboardType="number-pad"
          maxLength={6}
          autoFocus
          editable={!loading}
        />
      </View>

      {otpExpiresIn > 0 && (
        <Text style={styles.otpTimer}>
          OTP expires in {Math.floor(otpExpiresIn / 60)}:
          {(otpExpiresIn % 60).toString().padStart(2, '0')}
        </Text>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={20} color={COLORS.ERROR} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={() => setStep('name')}
        disabled={loading || otp.length < 4}
      >
        <Text style={styles.buttonText}>Continue</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.linkButton}
        onPress={handleGenerateOTP}
        disabled={loading}
      >
        <Text style={styles.linkText}>
          Didn't receive code? <Text style={styles.linkTextBold}>Resend OTP</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render name step
  const renderNameStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          setStep('otp');
          setDisplayName('');
          setError(null);
        }}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.PRIMARY} />
      </TouchableOpacity>

      <Text style={styles.stepTitle}>Your Name</Text>
      <Text style={styles.stepSubtitle}>
        Enter your display name for your profile
      </Text>

      <View style={styles.inputContainer}>
        <Ionicons
          name="person-outline"
          size={20}
          color="#666"
          style={styles.inputIcon}
        />
        <TextInput
          style={styles.input}
          placeholder="Display Name"
          placeholderTextColor="#999"
          value={displayName}
          onChangeText={(text) => {
            setDisplayName(text);
            setError(null);
          }}
          autoCapitalize="words"
          autoCorrect={false}
          editable={!loading}
          autoFocus
        />
      </View>

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={20} color={COLORS.ERROR} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleVerifyOTP}
        disabled={loading || !displayName.trim()}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Complete Registration</Text>
        )}
      </TouchableOpacity>
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
      >
        <View style={styles.header}>
          <Ionicons name="person-add-outline" size={64} color={COLORS.PRIMARY} />
          <Text style={styles.headerTitle}>Sign Up</Text>
        </View>

        {step === 'input' && renderInputStep()}
        {step === 'otp' && renderOtpStep()}
        {step === 'name' && renderNameStep()}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    justifyContent: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 40,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
  },
  stepContainer: {
    width: '100%',
    maxWidth: 400,
    alignSelf: 'center',
  },
  stepTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  stepSubtitle: {
    fontSize: 16,
    color: '#999',
    textAlign: 'center',
    marginBottom: 32,
  },
  methodContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  methodButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    backgroundColor: '#1a1a1a',
    borderWidth: 2,
    borderColor: 'transparent',
    gap: 8,
  },
  methodButtonActive: {
    borderColor: COLORS.PRIMARY,
    backgroundColor: '#1a0a2e',
  },
  methodButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
  methodButtonTextActive: {
    color: COLORS.PRIMARY,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#fff',
    paddingVertical: 16,
  },
  availabilityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a1a1a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  availabilityText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.ERROR,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a1a1a',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
    gap: 8,
  },
  errorText: {
    flex: 1,
    fontSize: 14,
    color: COLORS.ERROR,
  },
  button: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
    minHeight: 52,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  linkButton: {
    marginTop: 24,
    alignItems: 'center',
  },
  linkText: {
    fontSize: 14,
    color: '#999',
  },
  linkTextBold: {
    color: COLORS.PRIMARY,
    fontWeight: '600',
  },
  backButton: {
    alignSelf: 'flex-start',
    padding: 8,
    marginBottom: 16,
  },
  otpTimer: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
});

