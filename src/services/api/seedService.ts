import { apiClient } from './client';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SeedResponse {
  success: boolean;
  message: string;
  conversationsCreated?: number;
  usersCreated?: number;
}

/**
 * Seed dummy data to database
 */
export async function seedDummyData(): Promise<SeedResponse> {
  try {
    const userId = await AsyncStorage.getItem('currentUserId');
    
    if (!userId) {
      throw new Error('User not logged in. Please login first.');
    }

    const response = await apiClient.post<SeedResponse>('/api/seed/dummy-data', {
      userId,
    });
    
    return response.data;
  } catch (error: any) {
    console.error('Error seeding dummy data:', error);
    throw new Error(error.response?.data?.message || 'Failed to seed dummy data');
  }
}

