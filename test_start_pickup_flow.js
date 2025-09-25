// Test script to verify the start pickup flow with V1 system
const BASE_URL = 'http://192.168.4.243:5000/api';

async function testStartPickupFlow() {
  console.log('🚀 ===== TESTING START PICKUP FLOW (V1) =====');
  
  try {
    // Step 1: Authenticate (like the Start Trip button in DriverLoginScreen)
    console.log('\n1. 🔐 Testing authentication...');
    const authResponse = await fetch(`${BASE_URL}/driver/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vehicle_number: 'DL51GD2763',
        dl_number: 'DL112012194967'
      }),
    });
    
    const authData = await authResponse.json();
    console.log('✅ Authentication result:', {
      success: authResponse.ok,
      status: authResponse.status,
      assignment_id: authData.assignment_id,
      driver_name: authData.driver_name,
      total_pickups: authData.total_pickups
    });
    
    if (!authResponse.ok) {
      throw new Error('Authentication failed');
    }
    
    // Step 2: Start trip (like the Start Pickup button in PickupStartScreen)
    console.log('\n2. 🚀 Testing start trip...');
    const startTripResponse = await fetch(`${BASE_URL}/assignments/${authData.assignment_id}/start-trip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    const startTripData = await startTripResponse.json();
    console.log('✅ Start trip result:', {
      success: startTripResponse.ok,
      status: startTripResponse.status,
      message: startTripData.message,
      trip_started_at: startTripData.trip_started_at
    });
    
    if (!startTripResponse.ok) {
      throw new Error('Start trip failed');
    }
    
    console.log('\n🎉 SUCCESS: Both authentication and start trip are working!');
    console.log('📋 Flow summary:');
    console.log('   - Authentication: ✅ Working');
    console.log('   - Start Trip: ✅ Working');
    console.log('   - Assignment ID:', authData.assignment_id);
    console.log('   - Trip Started At:', startTripData.trip_started_at);
    
  } catch (error) {
    console.error('\n❌ ERROR:', error.message);
    console.log('\n🔍 This means the issue is likely in the mobile app code, not the backend.');
  }
}

// Run the test
testStartPickupFlow().catch(console.error);
