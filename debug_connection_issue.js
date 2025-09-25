/**
 * Debug script to test Vehicle_App connection issues
 */

const BASE_URL = 'http://192.168.4.145:5000';

// Test 1: Basic connectivity
async function testBasicConnectivity() {
    console.log('🔍 Testing basic connectivity...');
    try {
        const response = await fetch(`${BASE_URL}/`);
        const data = await response.json();
        console.log('✅ Basic connectivity OK:', data);
        return true;
    } catch (error) {
        console.log('❌ Basic connectivity failed:', error.message);
        return false;
    }
}

// Test 2: API endpoint
async function testApiEndpoint() {
    console.log('🔍 Testing API endpoint...');
    try {
        const response = await fetch(`${BASE_URL}/api/pickup/areas`);
        const data = await response.json();
        console.log('✅ API endpoint OK:', data);
        return true;
    } catch (error) {
        console.log('❌ API endpoint failed:', error.message);
        return false;
    }
}

// Test 3: Authentication endpoint
async function testAuthEndpoint() {
    console.log('🔍 Testing authentication endpoint...');
    try {
        const response = await fetch(`${BASE_URL}/api/driver/authenticate/v2`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                vehicle_number: 'DL1LAN3660',
                driving_license: 'BR5020230001371'
            })
        });
        const data = await response.json();
        console.log('✅ Authentication endpoint OK:', data);
        return true;
    } catch (error) {
        console.log('❌ Authentication endpoint failed:', error.message);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Starting connection tests...');
    console.log('📡 Target URL:', BASE_URL);
    
    const test1 = await testBasicConnectivity();
    const test2 = await testApiEndpoint();
    const test3 = await testAuthEndpoint();
    
    console.log('\n📊 Test Results:');
    console.log('Basic connectivity:', test1 ? '✅' : '❌');
    console.log('API endpoint:', test2 ? '✅' : '❌');
    console.log('Authentication:', test3 ? '✅' : '❌');
    
    if (test1 && test2 && test3) {
        console.log('\n🎉 All tests passed! Backend is working correctly.');
        console.log('🔧 The issue might be in the Vehicle_App configuration.');
    } else {
        console.log('\n❌ Some tests failed. Check network configuration.');
    }
}

// Export for use in React Native
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runAllTests, testBasicConnectivity, testApiEndpoint, testAuthEndpoint };
} else {
    // Run in browser
    runAllTests();
}
