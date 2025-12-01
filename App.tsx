import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { StyleSheet, Platform, View } from 'react-native';
import AppNavigator from './src/navigation';
import { ErrorBoundary } from './src/components/common';

export default function App() {
  // For web, wrap in a simple View instead of GestureHandlerRootView
  const Container = Platform.OS === 'web' ? View : GestureHandlerRootView;

  return (
    <ErrorBoundary>
      <Container style={styles.container}>
        <NavigationContainer>
          <StatusBar style="auto" />
          <AppNavigator />
        </NavigationContainer>
      </Container>
    </ErrorBoundary>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

