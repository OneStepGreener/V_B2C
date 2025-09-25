#!/usr/bin/env python3
"""
Test mobile app connection with updated configuration
"""
import requests
import json

def test_mobile_connection():
    """Test if mobile app can connect to backend with updated configuration"""
    print("🚀 Testing Mobile App Connection")
    print("=" * 50)
    
    # Test the exact endpoint that the mobile app uses
    BASE_URL = 'http://192.168.4.145:5000/api'
    
    # Test 1: Basic connectivity
    print("📡 Test 1: Basic connectivity...")
    try:
        response = requests.get(f'{BASE_URL.replace("/api", "")}/', timeout=10)
        if response.status_code == 200:
            print("✅ Backend server is accessible")
        else:
            print(f"❌ Backend server error: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        return False
    
    # Test 2: V2 Authentication endpoint (exact mobile app request)
    print("\n📡 Test 2: V2 Authentication endpoint...")
    try:
        auth_data = {
            "vehicle_number": "DL1LAN3660",
            "driving_license": "BR5020230001371"
        }
        
        response = requests.post(
            f'{BASE_URL}/driver/authenticate/v2',
            json=auth_data,
            headers={'Content-Type': 'application/json'},
            timeout=30
        )
        
        print(f"📥 Response status: {response.status_code}")
        print(f"📥 Response headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ V2 Authentication successful!")
            print(f"   Assignment ID: {data.get('assignment_id')}")
            print(f"   Driver Name: {data.get('driver_name')}")
            print(f"   Vehicle: {data.get('vehicle_no')}")
            print(f"   Total Stops: {data.get('total_stops')}")
            print(f"   Current Sequence: {data.get('current_sequence')}")
            
            # Validate required fields that mobile app expects
            required_fields = ['assignment_id', 'driver_dl', 'vehicle_no', 'total_stops', 'driver_name', 'route_date', 'current_stop']
            missing_fields = [field for field in required_fields if not data.get(field)]
            
            if missing_fields:
                print(f"⚠️ Missing required fields: {missing_fields}")
            else:
                print("✅ All required fields present")
                
        else:
            print(f"❌ V2 Authentication failed: {response.status_code}")
            print(f"   Response: {response.text}")
            return False
            
    except requests.exceptions.Timeout:
        print("❌ V2 Authentication timeout (30 seconds)")
        return False
    except Exception as e:
        print(f"❌ V2 Authentication error: {e}")
        return False
    
    # Test 3: Test assignment stop endpoint
    print("\n📡 Test 3: Assignment stop endpoint...")
    try:
        # Use the assignment ID from previous test
        assignment_id = 6  # From previous test
        sequence = 1
        
        response = requests.get(
            f'{BASE_URL}/assignments/{assignment_id}/stops/{sequence}',
            timeout=10
        )
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Assignment stop endpoint working!")
            print(f"   Stop data: {data.get('stop', {}).get('name_snapshot', 'N/A')}")
        else:
            print(f"❌ Assignment stop endpoint failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Assignment stop endpoint error: {e}")
    
    print("\n✅ Mobile app connection tests completed!")
    print("\n📱 Next steps:")
    print("1. Make sure your mobile device is on the same WiFi network")
    print("2. Try logging in with the Vehicle App")
    print("3. Check the console logs for any errors")
    
    return True

if __name__ == "__main__":
    test_mobile_connection()

