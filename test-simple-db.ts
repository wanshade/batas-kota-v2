import { config } from 'dotenv';
import { db } from './src/db';
import { users, fields, bookings } from './src/db/schema';

// Load environment variables from .env file
config({ path: '.env' });

async function testSimpleDatabaseConnection() {
  console.log('Testing simple database connection...');

  try {
    // Test connection by checking if tables exist and are accessible
    console.log('🔍 Testing table access...');

    // Test users table
    const userResult = await db.select().from(users).limit(1);
    console.log('✅ Users table accessible - found', userResult.length, 'records in sample');

    // Test fields table
    const fieldResult = await db.select().from(fields).limit(1);
    console.log('✅ Fields table accessible - found', fieldResult.length, 'records in sample');

    // Test bookings table
    const bookingResult = await db.select().from(bookings).limit(1);
    console.log('✅ Bookings table accessible - found', bookingResult.length, 'records in sample');

    // Count total records
    console.log('\n📊 Counting total records...');

    const userCount = await db.select().from(users);
    const fieldCount = await db.select().from(fields);
    const bookingCount = await db.select().from(bookings);

    console.log(`   Total Users: ${userCount.length}`);
    console.log(`   Total Fields: ${fieldCount.length}`);
    console.log(`   Total Bookings: ${bookingCount.length}`);

    console.log('\n✅ Database connection and schema access working correctly!');

  } catch (error) {
    console.error('❌ Database connection test failed:');
    console.error('Error:', error);

    if (error instanceof Error) {
      console.error('Error details:', error.message);

      // Check for specific drizzle/postgres errors
      if (error.message.includes('ECONNREFUSED')) {
        console.error('\n💡 Connection refused - Possible issues:');
        console.error('   - Database server not accessible');
        console.error('   - Network connectivity problems');
        console.error('   - Firewall blocking connection');
      } else if (error.message.includes('relation') && error.message.includes('does not exist')) {
        console.error('\n💡 Table not found - Possible issues:');
        console.error('   - Database tables not created');
        console.error('   - Migration not run');
      }
    }
  }
}

testSimpleDatabaseConnection();