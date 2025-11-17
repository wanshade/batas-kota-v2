import { config } from 'dotenv';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Load environment variables from .env file
config({ path: '.env' });

async function testDatabaseConnection() {
  console.log('Testing database connection...');

  const connectionString = process.env.DATABASE_URL;

  if (!connectionString) {
    console.error('❌ DATABASE_URL is not defined in environment variables');
    return;
  }

  console.log('📡 Connection string found');

  try {
    // Test basic postgres connection
    const client = postgres(connectionString, {
      max: 1,
      idle_timeout: 20,
      connect_timeout: 10,
      ssl: 'require',
    });

    console.log('🔌 Testing raw connection...');

    // Test simple query
    const result = await client`SELECT 1 as test, version() as version, now() as current_time`;

    console.log('✅ Raw connection successful!');
    console.log('Database version:', result[0]?.version);
    console.log('Current time:', result[0]?.current_time);

    // Test drizzle connection
    console.log('🔧 Testing Drizzle ORM connection...');
    const db = drizzle(client);

    const dbResult = await client`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' LIMIT 10`;

    console.log('✅ Drizzle connection successful!');
    console.log('Tables in database:', dbResult.map(row => row.table_name));

    await client.end();
    console.log('🔌 Connection closed successfully');

  } catch (error) {
    console.error('❌ Database connection failed:');
    console.error('Error:', error);

    if (error instanceof Error) {
      console.error('Error message:', error.message);

      // Check for common connection issues
      if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
        console.error('💡 Possible causes:');
        console.error('   - Hostname not found');
        console.error('   - Network connectivity issues');
        console.error('   - Database server not running');
      } else if (error.message.includes('password') || error.message.includes('authentication')) {
        console.error('💡 Possible causes:');
        console.error('   - Incorrect password');
        console.error('   - User does not have access');
      } else if (error.message.includes('timeout')) {
        console.error('💡 Possible causes:');
        console.error('   - Network timeout');
        console.error('   - Database server overloaded');
        console.error('   - Firewall blocking connection');
      }
    }
  }
}

// Load environment variables
if (typeof process === 'undefined') {
  // We're in a browser environment, cannot test DB connection
  console.log('❌ Database connection test can only run in Node.js environment');
} else {
  testDatabaseConnection();
}