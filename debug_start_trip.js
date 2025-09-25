// Debug script to test the start trip functionality
// For Node.js 18+, fetch is available globally
// For older versions, uncomment the line below:
// const fetch = require('node-fetch');

const BASE_URL = 'http://192.168.4.243:5000/api';

async function testConnectivity() {
  console.log('🔍 Testing server connectivity...');
  console.log('📡 BASE_URL:', BASE_URL);
  
  try {
    // Test basic GET request
    console.log('\n1. Testing basic connectivity (GET request)...');
    const testResponse = await fetch(`${BASE_URL}/driver/authenticate`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    
    console.log('✅ GET Response status:', testResponse.status);
    console.log('✅ GET Response headers:', Object.fromEntries(testResponse.headers.entries()));
    
    const testText = await testResponse.text();
    console.log('✅ GET Response text:', testText);
    
  } catch (error) {
    console.error('❌ GET Test failed:', error.message);
    return false;
  }
  
  return true;
}

async function testAuthentication() {
  console.log('\n2. Testing authentication endpoint...');
  
  // Test with actual credentials
  const testData = {
    vehicle_number: 'DL51GD2763',
    dl_number: 'DL112012194967'
  };
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    console.log('📤 Sending POST request with data:', testData);
    
    const response = await fetch(`${BASE_URL}/driver/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData),
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    console.log('📥 Response status:', response.status);
    console.log('📥 Response headers:', Object.fromEntries(response.headers.entries()));
    
    const rawText = await response.text();
    console.log('📥 Raw response text:', rawText);
    
    let data;
    try {
      data = rawText ? JSON.parse(rawText) : {};
      console.log('📥 Parsed JSON:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.warn('⚠️ JSON parse error:', e.message);
      data = { error: rawText };
    }
    
    return {
      success: response.ok,
      status: response.status,
      data: data
    };
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Request timed out after 15 seconds');
      return { success: false, error: 'Request timed out' };
    }
    console.error('❌ Authentication test failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function testStartTrip(assignmentId = 76) {
  console.log('\n3. Testing start trip endpoint...');
  
  // Use the actual assignment_id from authentication
  console.log('📋 Using assignment ID:', assignmentId);
  
  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000);
    
    console.log('📤 Sending POST request to start trip for assignment:', assignmentId);
    
    const response = await fetch(`${BASE_URL}/assignments/${assignmentId}/start-trip`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      signal: controller.signal,
    });
    
    clearTimeout(timeoutId);
    
    console.log('📥 Start trip response status:', response.status);
    console.log('📥 Start trip response headers:', Object.fromEntries(response.headers.entries()));
    
    const rawText = await response.text();
    console.log('📥 Start trip raw response:', rawText);
    
    let data;
    try {
      data = rawText ? JSON.parse(rawText) : {};
      console.log('📥 Start trip parsed JSON:', JSON.stringify(data, null, 2));
    } catch (e) {
      console.warn('⚠️ Start trip JSON parse error:', e.message);
      data = { error: rawText };
    }
    
    return {
      success: response.ok,
      status: response.status,
      data: data
    };
    
  } catch (error) {
    if (error.name === 'AbortError') {
      console.error('❌ Start trip request timed out after 15 seconds');
      return { success: false, error: 'Request timed out' };
    }
    console.error('❌ Start trip test failed:', error.message);
    return { success: false, error: error.message };
  }
}

async function runDebug() {
  console.log('🚀 ===== START TRIP DEBUG SCRIPT =====');
  console.log('🕐 Started at:', new Date().toISOString());
  
  // Test 1: Basic connectivity
  const connectivityOk = await testConnectivity();
  if (!connectivityOk) {
    console.log('\n❌ Basic connectivity failed. Server might be down or unreachable.');
    return;
  }
  
  // Test 2: Authentication endpoint
  const authResult = await testAuthentication();
  console.log('\n📊 Authentication test result:', authResult);
  
  // Test 3: Start trip endpoint (use assignment_id from auth result)
  const assignmentId = authResult.success ? authResult.data.assignment_id : 76;
  const startTripResult = await testStartTrip(assignmentId);
  console.log('\n📊 Start trip test result:', startTripResult);
  
  console.log('\n🏁 ===== DEBUG COMPLETE =====');
  console.log('🕐 Finished at:', new Date().toISOString());
}

// Run the debug script
runDebug().catch(console.error);
