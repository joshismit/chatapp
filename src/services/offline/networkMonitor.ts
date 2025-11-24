// For Expo, use: npm install @react-native-community/netinfo
// Or use expo-network: npx expo install expo-network
// This is a compatibility wrapper

let NetInfo: any;
try {
  // Try to import NetInfo (install: npm install @react-native-community/netinfo)
  NetInfo = require('@react-native-community/netinfo');
} catch {
  // Fallback for Expo - use expo-network if available
  try {
    NetInfo = require('expo-network');
  } catch {
    console.warn('Network monitoring not available. Install @react-native-community/netinfo');
  }
}

export interface NetworkState {
  isConnected: boolean;
  type: string;
}

/**
 * Check current network connectivity
 */
export async function isOnline(): Promise<boolean> {
  try {
    if (!NetInfo) {
      // Fallback: assume online if NetInfo not available
      return true;
    }
    
    if (NetInfo.fetch) {
      const state = await NetInfo.fetch();
      return state.isConnected ?? false;
    } else if (NetInfo.getNetworkStateAsync) {
      // Expo Network API
      const state = await NetInfo.getNetworkStateAsync();
      return state.isConnected ?? false;
    }
    
    return true; // Default to online
  } catch (error) {
    console.error('Error checking network:', error);
    return true; // Default to online to allow retries
  }
}

/**
 * Subscribe to network state changes
 */
export function subscribeToNetwork(
  callback: (isConnected: boolean) => void
): () => void {
  try {
    if (!NetInfo) {
      return () => {}; // No-op unsubscribe
    }
    
    if (NetInfo.addEventListener) {
      const unsubscribe = NetInfo.addEventListener((state: any) => {
        callback(state.isConnected ?? false);
      });
      return unsubscribe;
    } else if (NetInfo.addNetworkStateListener) {
      // Expo Network API
      const subscription = NetInfo.addNetworkStateListener((state: any) => {
        callback(state.isConnected ?? false);
      });
      return () => subscription.remove();
    }
  } catch (error) {
    console.error('Error subscribing to network:', error);
  }
  
  return () => {}; // No-op unsubscribe
}

/**
 * Get current network state
 */
export async function getNetworkState(): Promise<NetworkState> {
  try {
    if (!NetInfo) {
      return { isConnected: true, type: 'unknown' };
    }
    
    if (NetInfo.fetch) {
      const state = await NetInfo.fetch();
      return {
        isConnected: state.isConnected ?? false,
        type: state.type || 'unknown',
      };
    } else if (NetInfo.getNetworkStateAsync) {
      // Expo Network API
      const state = await NetInfo.getNetworkStateAsync();
      return {
        isConnected: state.isConnected ?? false,
        type: state.type || 'unknown',
      };
    }
  } catch (error) {
    console.error('Error getting network state:', error);
  }
  
  return { isConnected: true, type: 'unknown' };
}

