// Test network connectivity from mobile device perspective
const BASE_URL = 'http://192.168.4.243:5000/api';

async function testMobileNetwork() {
  console.log('🔍 Testing network connectivity for mobile app...');
  console.log('📡 Target URL:', BASE_URL);
  
  try {
    // Test 1: Basic connectivity with mobile-like headers
    console.log('\n1. Testing basic connectivity...');
    const testResponse = await fetch(`${BASE_URL}/driver/authenticate`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ReactNative/0.72.0',
        'Accept': 'application/json',
      },
    });
    
    console.log('✅ GET Response status:', testResponse.status);
    console.log('✅ Response time: ~', Date.now());
    
  } catch (error) {
    console.error('❌ Basic connectivity failed:', error.message);
    return false;
  }
  
  try {
    // Test 2: Authentication with actual credentials
    console.log('\n2. Testing authentication with mobile-like request...');
    const startTime = Date.now();
    
    const response = await fetch(`${BASE_URL}/driver/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'ReactNative/0.72.0',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        vehicle_number: 'DL51GD2763',
        dl_number: 'DL112012194967'
      }),
    });
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    console.log('📥 Response status:', response.status);
    console.log('⏱️ Response time:', responseTime + 'ms');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ Authentication successful!');
      console.log('📊 Assignment ID:', data.assignment_id);
      console.log('📊 Driver Name:', data.driver_name);
      console.log('📊 Total Pickups:', data.total_pickups);
      
      if (responseTime > 15000) {
        console.log('⚠️ WARNING: Response took longer than 15 seconds!');
        console.log('⚠️ This might cause timeout issues in the mobile app.');
      } else {
        console.log('✅ Response time is acceptable for mobile app.');
      }
      
      return true;
    } else {
      const errorData = await response.json();
      console.error('❌ Authentication failed:', errorData);
      return false;
    }
    
  } catch (error) {
    console.error('❌ Authentication test failed:', error.message);
    return false;
  }
}

async function runNetworkTest() {
  console.log('🚀 ===== MOBILE NETWORK TEST =====');
  console.log('🕐 Started at:', new Date().toISOString());
  
  const success = await testMobileNetwork();
  
  console.log('\n📊 Test Result:', success ? '✅ SUCCESS' : '❌ FAILED');
  console.log('🕐 Finished at:', new Date().toISOString());
  console.log('🏁 ===== TEST COMPLETE =====');
  
  if (!success) {
    console.log('\n💡 Troubleshooting suggestions:');
    console.log('1. Check if the server is running on 192.168.4.243:5000');
    console.log('2. Ensure mobile device and server are on the same network');
    console.log('3. Check firewall settings on the server');
    console.log('4. Try accessing the URL in mobile browser first');
  }
}

runNetworkTest();
