import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StackScreenProps } from '@react-navigation/stack';
import { RootStackParamList } from '../navigation/navigationTypes';
import { loginWithToken } from '../services/api/loginService';

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

export default function LoginScreen({ navigation }: LoginScreenProps) {
  const [permission, requestPermission] = useCameraPermissions?.() || [null, () => {}];
  const [scanned, setScanned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (permission && !permission.granted && !permission.canAskAgain) {
      Alert.alert(
        'Camera Permission Required',
        'Please enable camera permissions in your device settings to scan QR codes.',
        [{ text: 'OK' }]
      );
    }
  }, [permission]);

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned || loading) return;

    setScanned(true);
    setLoading(true);
    setError(null);

    try {
      // Extract token from QR code data
      // Assuming the QR code contains the token directly or in a format like "token:xxxxx"
      const token = data.includes('token:') ? data.split('token:')[1] : data;

      if (!token || token.trim() === '') {
        throw new Error('Invalid QR code. No token found.');
      }

      // Call login API
      const response = await loginWithToken(token);

      if (response.success) {
        // Navigate to success screen
        navigation.replace('Success');
      } else {
        throw new Error(response.message || 'Login failed');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to login. Please try again.');
      setScanned(false);
      Alert.alert('Login Error', err.message || 'Failed to login. Please try again.', [
        {
          text: 'Try Again',
          onPress: () => {
            setScanned(false);
            setLoading(false);
          },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // Web fallback - show manual input
  if (Platform.OS === 'web') {
    return (
      <View style={styles.container}>
        <View style={styles.webContainer}>
          <Ionicons name="qr-code-outline" size={80} color="#6200ee" />
          <Text style={styles.title}>QR Code Login</Text>
          <Text style={styles.text}>
            Camera is not available on web. Please use the mobile app to scan QR codes.
          </Text>
          <Text style={styles.text}>
            For testing, you can manually enter a token:
          </Text>
          <View style={styles.inputContainer}>
            <Text
              style={styles.button}
              onPress={async () => {
                const testToken = prompt('Enter QR token for testing:');
                if (testToken) {
                  setLoading(true);
                  try {
                    const response = await loginWithToken(testToken);
                    if (response.success) {
                      navigation.replace('Success');
                    } else {
                      Alert.alert('Login Error', response.message || 'Login failed');
                    }
                  } catch (err: any) {
                    Alert.alert('Login Error', err.message || 'Failed to login');
                  } finally {
                    setLoading(false);
                  }
                }
              }}
            >
              Enter Token Manually
            </Text>
          </View>
        </View>
      </View>
    );
  }

  if (!permission) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#6200ee" />
        <Text style={styles.text}>Requesting camera permission...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Ionicons name="camera-outline" size={64} color="#6200ee" />
        <Text style={styles.title}>Camera Permission Required</Text>
        <Text style={styles.text}>
          We need access to your camera to scan QR codes for login.
        </Text>
        <View style={styles.buttonContainer}>
          <Text
            style={styles.button}
            onPress={requestPermission}
            accessibilityRole="button"
            accessibilityLabel="Request camera permission"
          >
            Grant Permission
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing={CameraType?.back || 'back'}
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        barcodeScannerSettings={{
          barcodeTypes: ['qr'],
        }}
      >
        <View style={styles.overlay}>
          <View style={styles.scanArea}>
            <View style={[styles.corner, styles.topLeft]} />
            <View style={[styles.corner, styles.topRight]} />
            <View style={[styles.corner, styles.bottomLeft]} />
            <View style={[styles.corner, styles.bottomRight]} />
          </View>
          <Text style={styles.instructionText}>
            Position the QR code within the frame
          </Text>
        </View>
      </CameraView>

      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#fff" />
          <Text style={styles.loadingText}>Logging in...</Text>
        </View>
      )}

      {error && !loading && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  camera: {
    flex: 1,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scanArea: {
    width: 250,
    height: 250,
    position: 'relative',
    marginBottom: 40,
  },
  corner: {
    position: 'absolute',
    width: 30,
    height: 30,
    borderColor: '#6200ee',
    borderWidth: 3,
  },
  topLeft: {
    top: 0,
    left: 0,
    borderRightWidth: 0,
    borderBottomWidth: 0,
  },
  topRight: {
    top: 0,
    right: 0,
    borderLeftWidth: 0,
    borderBottomWidth: 0,
  },
  bottomLeft: {
    bottom: 0,
    left: 0,
    borderRightWidth: 0,
    borderTopWidth: 0,
  },
  bottomRight: {
    bottom: 0,
    right: 0,
    borderLeftWidth: 0,
    borderTopWidth: 0,
  },
  instructionText: {
    color: '#fff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 40,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#fff',
    fontSize: 18,
    marginTop: 16,
  },
  errorContainer: {
    position: 'absolute',
    bottom: 40,
    left: 20,
    right: 20,
    backgroundColor: '#ff4444',
    padding: 16,
    borderRadius: 8,
  },
  errorText: {
    color: '#fff',
    fontSize: 14,
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  text: {
    fontSize: 16,
    color: '#fff',
    textAlign: 'center',
    paddingHorizontal: 40,
    marginBottom: 20,
  },
  buttonContainer: {
    marginTop: 20,
  },
  button: {
    backgroundColor: '#6200ee',
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    paddingVertical: 12,
    paddingHorizontal: 32,
    borderRadius: 8,
    textAlign: 'center',
    overflow: 'hidden',
  },
  webContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  inputContainer: {
    marginTop: 20,
    width: '100%',
    maxWidth: 300,
  },
});

