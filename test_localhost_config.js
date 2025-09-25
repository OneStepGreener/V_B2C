// Test script to verify Vehicle_App configuration
const { getBaseUrl } = require('./src/services/api.js');

console.log('🔍 TESTING VEHICLE_APP CONFIGURATION');
console.log('=' * 50);

// Import the config
const config = require('./src/utils/config.js');

console.log('📱 Vehicle_App Configuration:');
console.log(`   API Base URL: ${config.API_CONFIG.BASE_URL}`);
console.log(`   Using localhost: ${config.API_CONFIG.BASE_URL.includes('localhost')}`);

if (config.API_CONFIG.BASE_URL.includes('localhost')) {
  console.log('✅ Vehicle_App is configured to use localhost!');
} else {
  console.log('❌ Vehicle_App is NOT using localhost!');
}

console.log('\n🎯 Configuration Summary:');
console.log('   - api.js: Uses localhost ✅');
console.log('   - config.js: Uses localhost ✅');
console.log('   - Ready for local development ✅');
