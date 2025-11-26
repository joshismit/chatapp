/**
 * Helper function to seed dummy data after login
 * Call this after successful login to populate the database with sample conversations
 */

import { seedDummyData } from '../services/api/seedService';

export async function seedDataAfterLogin(): Promise<void> {
  try {
    console.log('Seeding dummy data...');
    const result = await seedDummyData();
    console.log('✅ Dummy data seeded:', result.message);
    if (result.conversationsCreated) {
      console.log(`   Created ${result.conversationsCreated} conversations`);
    }
  } catch (error) {
    console.error('❌ Failed to seed dummy data:', error);
    // Don't throw - allow app to continue even if seeding fails
  }
}

