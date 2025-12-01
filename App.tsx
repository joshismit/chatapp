import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Platform, View } from 'react-native';
import Toast from 'react-native-toast-message';
import AppNavigator from './src/navigation';
import { ErrorBoundary } from './src/components/common';

export default function App() {
  // For web, wrap in a simple View instead of GestureHandlerRootView
  const Container = Platform.OS === 'web' ? View : GestureHandlerRootView;

  // Add error logging
  React.useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.log('App component mounted');
    }
  }, []);

  return (
    <ErrorBoundary>
      <Container style={styles.container}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <AppNavigator />
        </NavigationContainer>
        <Toast />
      </Container>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

