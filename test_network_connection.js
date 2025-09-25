// Test script to check network connectivity
const BASE_URL = 'http://192.168.4.145:5000/api';

async function testConnection() {
  console.log('🔍 Testing network connection...');
  console.log('📡 URL:', `${BASE_URL}/driver/authenticate`);
  
  const authData = {
    vehicle_number: "DL1LAN3660",
    dl_number: "BR5020230001371"
  };
  
  try {
    console.log('📤 Sending request...');
    const response = await fetch(`${BASE_URL}/driver/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(authData),
    });
    
    console.log('📥 Response status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS!');
      console.log('👤 Driver:', data.driver_name);
      console.log('📍 Pickups:', data.pickups?.length || 0);
    } else {
      const errorData = await response.text();
      console.log('❌ Error:', errorData);
    }
  } catch (error) {
    console.log('❌ Network error:', error.message);
    console.log('❌ Error type:', error.name);
  }
}

// Run the test
testConnection();

