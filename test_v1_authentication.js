// Test V1 authentication with start trip
const BASE_URL = 'http://192.168.4.243:5000/api';

async function testV1Authentication() {
  console.log('🚀 Testing V1 Authentication with Start Trip...');
  
  const testData = {
    vehicle_number: 'DL51GD2763',
    dl_number: 'DL112012194967'
  };
  
  try {
    // Step 1: V1 Authentication
    console.log('\n1. Testing V1 authentication...');
    const authResponse = await fetch(`${BASE_URL}/driver/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
    });
    
    console.log('📥 Auth response status:', authResponse.status);
    const authData = await authResponse.json();
    console.log('📥 Auth data:', JSON.stringify(authData, null, 2));
    
    if (!authResponse.ok) {
      throw new Error(`Authentication failed: ${authData.error}`);
    }
    
    // Step 2: Start Trip (if assignment_id exists)
    if (authData.assignment_id) {
      console.log('\n2. Testing start trip...');
      const startTripResponse = await fetch(`${BASE_URL}/assignments/${authData.assignment_id}/start-trip`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('📥 Start trip response status:', startTripResponse.status);
      const startTripData = await startTripResponse.json();
      console.log('📥 Start trip data:', JSON.stringify(startTripData, null, 2));
      
      if (!startTripResponse.ok) {
        throw new Error(`Start trip failed: ${startTripData.error}`);
      }
      
      console.log('\n✅ SUCCESS: V1 authentication + start trip completed successfully!');
      console.log('📊 Summary:');
      console.log('  - Assignment ID:', authData.assignment_id);
      console.log('  - Driver Name:', authData.driver_name);
      console.log('  - Vehicle Number:', authData.vehicle_number);
      console.log('  - Total Pickups:', authData.total_pickups);
      console.log('  - Trip Started At:', startTripData.trip_started_at);
      
    } else {
      console.log('⚠️ No assignment_id found in authentication response');
    }
    
  } catch (error) {
    console.error('❌ Test failed:', error.message);
  }
}

testV1Authentication();
