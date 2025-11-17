import { config } from 'dotenv';
import { db } from './src/db';

// Load environment variables from .env file
config({ path: '.env' });

async function testAppDatabaseConnection() {
  console.log('Testing application database connection...');

  try {
    // Test connection using the app's db instance
    const result = await db.execute(`
      SELECT
        table_name,
        (SELECT COUNT(*) FROM information_schema.columns WHERE table_name = t.table_name AND table_schema = 'public') as column_count
      FROM information_schema.tables t
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    console.log('✅ Application database connection successful!');
    console.log('\n📊 Database tables:');
    result.forEach(table => {
      console.log(`   - ${table.table_name} (${table.column_count} columns)`);
    });

    // Test if we can query actual data
    console.log('\n🔍 Testing data queries...');

    const userCount = await db.execute('SELECT COUNT(*) as count FROM users');
    const fieldCount = await db.execute('SELECT COUNT(*) as count FROM fields');
    const bookingCount = await db.execute('SELECT COUNT(*) as count FROM bookings');

    console.log(`   Users: ${userCount[0]?.count || 0}`);
    console.log(`   Fields: ${fieldCount[0]?.count || 0}`);
    console.log(`   Bookings: ${bookingCount[0]?.count || 0}`);

    console.log('\n✅ All tests passed! Database connection is working properly.');

  } catch (error) {
    console.error('❌ Application database connection failed:');
    console.error('Error:', error);
  }
}

testAppDatabaseConnection();