/**
 * Debug script to test Vehicle_App API calls
 */

const BASE_URL = 'http://localhost:5000/api';

// Test 1: Basic connectivity
async function testBasicConnectivity() {
    console.log('🔍 Testing basic connectivity...');
    try {
        const response = await fetch('http://localhost:5000/');
        const data = await response.json();
        console.log('✅ Basic connectivity OK:', data);
        return true;
    } catch (error) {
        console.log('❌ Basic connectivity failed:', error.message);
        return false;
    }
}

// Test 2: V2 Authentication (exact same as Vehicle_App)
async function testV2Authentication() {
    console.log('🔍 Testing V2 Authentication...');
    try {
        const testData = {
            vehicle_number: 'DL1LAN3660',
            driving_license: 'BR5020230001371'
        };
        
        console.log('📤 Request data:', testData);
        console.log('📡 URL:', `${BASE_URL}/driver/authenticate/v2`);
        
        const response = await fetch(`${BASE_URL}/driver/authenticate/v2`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        console.log('📥 Response status:', response.status);
        
        const data = await response.json();
        console.log('📥 Response data:', data);
        
        if (response.ok) {
            console.log('✅ V2 Authentication successful!');
            console.log('   Assignment ID:', data.assignment_id);
            console.log('   Driver DL:', data.driver_dl);
            console.log('   Vehicle No:', data.vehicle_no);
            console.log('   Total Stops:', data.total_stops);
            console.log('   Current Stop:', data.current_stop?.name_snapshot);
            return true;
        } else {
            console.log('❌ V2 Authentication failed:', data);
            return false;
        }
    } catch (error) {
        console.log('❌ V2 Authentication error:', error.message);
        return false;
    }
}

// Test 3: Old Authentication (for comparison)
async function testOldAuthentication() {
    console.log('🔍 Testing Old Authentication...');
    try {
        const testData = {
            vehicle_number: 'DL1LAN3660',
            dl_number: 'BR5020230001371'
        };
        
        const response = await fetch(`${BASE_URL}/driver/authenticate`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(testData)
        });
        
        console.log('📥 Old auth response status:', response.status);
        
        const data = await response.json();
        console.log('📥 Old auth response data:', data);
        
        return response.ok;
    } catch (error) {
        console.log('❌ Old Authentication error:', error.message);
        return false;
    }
}

// Run all tests
async function runAllTests() {
    console.log('🚀 Vehicle_App Debug Test');
    console.log('=' * 60);
    
    const test1 = await testBasicConnectivity();
    const test2 = await testV2Authentication();
    const test3 = await testOldAuthentication();
    
    console.log('\n📊 Test Results:');
    console.log('Basic connectivity:', test1 ? '✅' : '❌');
    console.log('V2 Authentication:', test2 ? '✅' : '❌');
    console.log('Old Authentication:', test3 ? '✅' : '❌');
    
    if (test1 && test2) {
        console.log('\n🎉 Vehicle_App should work!');
        console.log('🔧 If still showing error, check:');
        console.log('   1. App restart needed');
        console.log('   2. Network permissions');
        console.log('   3. ADB port forwarding');
    } else {
        console.log('\n❌ Some tests failed');
        console.log('🔧 Check backend server and network');
    }
}

// Export for use in React Native
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { runAllTests, testV2Authentication };
} else {
    // Run in browser
    runAllTests();
}
