/**
 * Login Screen
 * Updated flow: Phone/Email → Check Registration → QR Code (Desktop) or OTP (Mobile)
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
  TouchableOpacity,
  KeyboardAvoidingView,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../../types/navigation';
import {
  generateOTPForLogin,
  verifyOTPForLogin,
  generateQRCode,
  checkQRStatus,
} from '../../services/api/loginService';
import { checkAvailability } from '../../services/api/registrationService';
import { COLORS } from '../../app/constants';
import { showSuccessToast, showErrorToast, showInfoToast } from '../../utils/toast';

// Conditionally import QR code based on platform
// For web platform, use qrcode.react library
let QRCodeComponent: React.ComponentType<any> | null = null;

if (Platform.OS === 'web') {
  try {
    // Import qrcode.react - version 4+ exports QRCodeSVG
    const QRCodeModule = require('qrcode.react');
    
    // Try QRCodeSVG first (v4+)
    if (QRCodeModule.QRCodeSVG) {
      QRCodeComponent = QRCodeModule.QRCodeSVG;
      console.log('✅ QRCode loaded: QRCodeSVG');
    }
    // Try default export
    else if (QRCodeModule.default) {
      if (QRCodeModule.default.QRCodeSVG) {
        QRCodeComponent = QRCodeModule.default.QRCodeSVG;
        console.log('✅ QRCode loaded: default.QRCodeSVG');
      } else if (typeof QRCodeModule.default === 'function') {
        QRCodeComponent = QRCodeModule.default;
        console.log('✅ QRCode loaded: default function');
      }
    }
    // Try named QRCode export
    else if (QRCodeModule.QRCode) {
      QRCodeComponent = QRCodeModule.QRCode;
      console.log('✅ QRCode loaded: QRCode');
    }
    // Direct function
    else if (typeof QRCodeModule === 'function') {
      QRCodeComponent = QRCodeModule;
      console.log('✅ QRCode loaded: direct function');
    }
    
    if (!QRCodeComponent) {
      console.warn('⚠️ QRCode component not found. Module structure:', Object.keys(QRCodeModule));
    }
  } catch (e) {
    console.error('❌ Failed to load QRCode library:', e);
    QRCodeComponent = null;
  }
}

// Conditionally import CameraView only for native platforms
let CameraView: any;
let CameraType: any;
let useCameraPermissions: any;

if (Platform.OS !== 'web') {
  const cameraModule = require('expo-camera');
  CameraView = cameraModule.CameraView;
  CameraType = cameraModule.CameraType;
  useCameraPermissions = cameraModule.useCameraPermissions;
}

type LoginScreenProps = StackScreenProps<RootStackParamList, 'Login'>;

type LoginStep = 'input' | 'qr' | 'otp' | 'scanning';

export default function LoginScreen({ navigation }: LoginScreenProps) {
  // Step in login process
  const [step, setStep] = useState<LoginStep>('input');
  
  // Form inputs
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [method, setMethod] = useState<'phone' | 'email'>('phone');
  const [otp, setOtp] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRegistered, setIsRegistered] = useState<boolean | null>(null);
  
  // QR Code state
  const [qrToken, setQrToken] = useState<string | null>(null);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrStatus, setQrStatus] = useState<'pending' | 'scanned' | 'verified' | 'expired'>('pending');
  
  // OTP state
  const [otpSent, setOtpSent] = useState(false);
  const [otpExpiresIn, setOtpExpiresIn] = useState(0);

  // Timer for OTP expiry
  useEffect(() => {
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

  // Poll QR status
  useEffect(() => {
    if (step === 'qr' && qrToken && qrStatus === 'pending') {
      const interval = setInterval(async () => {
        try {
          const status = await checkQRStatus(qrToken);
          setQrStatus(status.status as any);
          
          if (status.status === 'verified' && status.token) {
            // Login successful
            navigation.replace('MainTabs');
          } else if (status.status === 'expired') {
            setError('QR code expired. Please generate a new one.');
            setStep('input');
          }
        } catch (err: any) {
          console.error('QR status check error:', err);
        }
      }, 2000); // Poll every 2 seconds

      return () => clearInterval(interval);
    }
  }, [step, qrToken, qrStatus]);

  // Format phone number
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

  // Check if user is registered in database
  const handleCheckUser = async () => {
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
    setIsRegistered(null);

    try {
      // Step 1: Check if user exists in database and is registered
      console.log('Checking if user is registered:', identifier);
      
      const availability = await checkAvailability(
        method === 'phone' ? phoneNumber : undefined,
        method === 'email' ? email : undefined
      );

      console.log('Availability check result:', availability);

      // available: false means user IS registered (exists in database)
      // available: true means user is NOT registered (doesn't exist)
      if (availability.available === false) {
        // User IS registered - proceed with login
        console.log('User is registered, proceeding with login');
        setIsRegistered(true);
        
        // Step 2: Generate QR code for desktop or OTP for mobile
        if (Platform.OS === 'web') {
          console.log('Platform is web, generating QR code');
          await handleGenerateQRCode();
        } else {
          console.log('Platform is mobile, generating OTP');
          await handleGenerateOTP();
        }
      } else {
        // User is NOT registered - show error and redirect
        console.log('User is not registered');
        setIsRegistered(false);
        const errorMsg = 'This email/phone is not registered. Please sign up first.';
        setError(errorMsg);
        showErrorToast(
          `This ${method === 'phone' ? 'phone number' : 'email'} is not registered in our database. Please sign up first.`,
          'Not Registered'
        );
        
        // Auto-navigate to registration after showing toast
        setTimeout(() => {
          navigation.navigate('Registration', {
            prefillEmail: method === 'email' ? email : undefined,
            prefillPhone: method === 'phone' ? phoneNumber : undefined,
          });
        }, 2000);
      }
    } catch (err: any) {
      console.error('Error checking user:', err);
      const errorMessage = err.message || 'Failed to check if user is registered';
      setError(errorMessage);
      setIsRegistered(null);
      
      // If it's a network error or server error, show helpful message
      if (err.response?.status === 500 || !err.response) {
        showErrorToast(
          'Unable to connect to server. Please check your internet connection and try again.',
          'Connection Error'
        );
      }
    } finally {
      setLoading(false);
    }
  };

  // Generate QR code for desktop login
  const handleGenerateQRCode = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await generateQRCode();
      setQrToken(response.qrToken);
      setQrCode(response.qrToken); // Use token as QR code data
      setStep('qr');
    } catch (err: any) {
      setError(err.message || 'Failed to generate QR code');
    } finally {
      setLoading(false);
    }
  };

  // Generate OTP for mobile login
  const handleGenerateOTP = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await generateOTPForLogin({
        phoneNumber: method === 'phone' ? phoneNumber : undefined,
        email: method === 'email' ? email : undefined,
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
            method === 'phone'
              ? `OTP has been sent to ${phoneNumber}`
              : `OTP has been sent to ${email}`,
            'OTP Sent'
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

  // Verify OTP and login
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
      const response = await verifyOTPForLogin({
        phoneNumber: method === 'phone' ? phoneNumber : undefined,
        email: method === 'email' ? email : undefined,
        otp: otp.trim(),
      });

      if (response.success && response.token) {
        // Login successful
        showSuccessToast('Login successful!', 'Welcome');
        navigation.replace('MainTabs');
      } else {
        const errorMsg = response.message || 'Failed to verify OTP';
        setError(errorMsg);
        showErrorToast(errorMsg, 'Login Failed');
      }
    } catch (err: any) {
      const errorMsg = err.message || 'Failed to verify OTP';
      setError(errorMsg);
      showErrorToast(errorMsg, 'Login Failed');
    } finally {
      setLoading(false);
    }
  };

  // Render input step
  const renderInputStep = () => (
    <View style={styles.stepContainer}>
      <Text style={styles.stepTitle}>Login</Text>
      <Text style={styles.stepSubtitle}>
        Enter your phone number or email to continue
      </Text>

      {/* Method Selection */}
      <View style={styles.methodContainer}>
        <TouchableOpacity
          style={[styles.methodButton, method === 'phone' && styles.methodButtonActive]}
          onPress={() => {
            setMethod('phone');
            setError(null);
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
          }}
          keyboardType={method === 'phone' ? 'phone-pad' : 'email-address'}
          autoCapitalize="none"
          autoCorrect={false}
          editable={!loading}
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
        onPress={handleCheckUser}
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
        onPress={() => navigation.navigate('Registration')}
      >
        <Text style={styles.linkText}>
          Don't have an account? <Text style={styles.linkTextBold}>Sign Up</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render QR code step (Desktop/Web)
  const renderQRStep = () => (
    <View style={styles.stepContainer}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => {
          setStep('input');
          setQrToken(null);
          setQrCode(null);
          setError(null);
        }}
      >
        <Ionicons name="arrow-back" size={24} color={COLORS.PRIMARY} />
      </TouchableOpacity>

      <Text style={styles.stepTitle}>Scan QR Code</Text>
      <Text style={styles.stepSubtitle}>
        Scan this QR code with your mobile app to login
      </Text>

      {qrCode && (
        <View style={styles.qrContainer}>
          {QRCodeComponent ? (
            <View style={styles.qrCodeWrapper}>
              <QRCodeComponent
                value={qrCode}
                size={250}
                fgColor="#000000"
                bgColor="#FFFFFF"
                level="H"
                includeMargin={true}
              />
            </View>
          ) : (
            <View style={styles.qrFallback}>
              <Text style={styles.qrFallbackText}>QR Code:</Text>
              <Text style={styles.qrFallbackToken} selectable>
                {qrCode}
              </Text>
              <Text style={styles.qrFallbackHint}>
                Copy this token and use it in the mobile app
              </Text>
            </View>
          )}
        </View>
      )}

      {qrStatus === 'pending' && (
        <Text style={styles.qrStatusText}>Waiting for scan...</Text>
      )}

      {qrStatus === 'scanned' && (
        <Text style={styles.qrStatusText}>QR code scanned. Waiting for verification...</Text>
      )}

      {error && (
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle-outline" size={20} color={COLORS.ERROR} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      <TouchableOpacity
        style={styles.linkButton}
        onPress={handleGenerateQRCode}
        disabled={loading}
      >
        <Text style={styles.linkText}>
          <Text style={styles.linkTextBold}>Generate New QR Code</Text>
        </Text>
      </TouchableOpacity>
    </View>
  );

  // Render OTP step (Mobile)
  const renderOTPStep = () => (
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
          onChangeText={(text) => {
            setOtp(text);
            setError(null);
          }}
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
        onPress={handleVerifyOTP}
        disabled={loading || otp.length < 4}
      >
        {loading ? (
          <ActivityIndicator size="small" color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Login</Text>
        )}
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
          <Ionicons name="log-in-outline" size={64} color={COLORS.PRIMARY} />
          <Text style={styles.headerTitle}>Login</Text>
        </View>

        {step === 'input' && renderInputStep()}
        {step === 'qr' && renderQRStep()}
        {step === 'otp' && renderOTPStep()}
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
  qrContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 24,
    minHeight: 300,
  },
  qrCodeWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    backgroundColor: '#fff',
    borderRadius: 8,
  },
  qrFallback: {
    alignItems: 'center',
    padding: 20,
  },
  qrFallbackText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
    marginBottom: 12,
  },
  qrFallbackToken: {
    fontSize: 14,
    color: '#333',
    fontFamily: 'monospace',
    textAlign: 'center',
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
    maxWidth: '100%',
  },
  qrFallbackHint: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  qrStatusText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  otpTimer: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
    marginBottom: 16,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    marginBottom: 16,
    gap: 8,
  },
  loadingText: {
    fontSize: 14,
    color: '#999',
  },
  notRegisteredContainer: {
    alignItems: 'center',
    backgroundColor: '#1a0a2e',
    padding: 20,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.PRIMARY,
  },
  notRegisteredText: {
    fontSize: 14,
    color: '#fff',
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 16,
  },
  signUpButton: {
    backgroundColor: COLORS.PRIMARY,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  signUpButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
});
