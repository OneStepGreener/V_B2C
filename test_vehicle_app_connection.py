#!/usr/bin/env python3
"""
Test script to verify Vehicle_App connectivity to backend server
"""
import requests
import json

BASE_URL = 'http://192.168.4.145:5000'

def test_backend_connectivity():
    """Test if backend is accessible from mobile device perspective"""
    print("🔍 Testing Backend Connectivity")
    print("=" * 60)
    
    # Test 1: Basic connectivity
    print("📡 Test 1: Basic connectivity...")
    try:
        response = requests.get(f'{BASE_URL}/')
        if response.status_code == 200:
            print("✅ Backend server is accessible")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Backend server returned status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        return False
    
    # Test 2: API endpoints
    print("\n📡 Test 2: API endpoints...")
    try:
        response = requests.get(f'{BASE_URL}/api/pickup/areas')
        if response.status_code == 200:
            data = response.json()
            areas = data.get('areas', [])
            print(f"✅ Areas endpoint working: {len(areas)} areas found")
            print(f"   Areas: {areas}")
        else:
            print(f"❌ Areas endpoint failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Areas endpoint error: {e}")
    
    # Test 3: Driver authentication endpoint
    print("\n📡 Test 3: Driver authentication endpoint...")
    try:
        # Test with sample data
        test_data = {
            "vehicle_number": "DL1LAN3660",
            "driving_license": "BR5020230001371"
        }
        
        response = requests.post(
            f'{BASE_URL}/api/driver/authenticate/v2',
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            print("✅ V2 Authentication endpoint working")
            data = response.json()
            print(f"   Response: {data}")
        elif response.status_code == 404:
            print("⚠️ V2 Authentication endpoint not found (using old endpoint)")
            # Try old endpoint
            response = requests.post(
                f'{BASE_URL}/api/driver/authenticate',
                json=test_data,
                headers={'Content-Type': 'application/json'}
            )
            if response.status_code == 200:
                print("✅ Old authentication endpoint working")
            else:
                print(f"❌ Old authentication endpoint failed: {response.status_code}")
        else:
            print(f"❌ Authentication endpoint failed: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Authentication endpoint error: {e}")
    
    return True

def test_mobile_network():
    """Test network connectivity from mobile perspective"""
    print("\n📱 Testing Mobile Network Connectivity")
    print("=" * 60)
    
    print("📡 Your laptop IP: 192.168.4.145")
    print("📡 Backend server: http://192.168.4.145:5000")
    print("📡 Vehicle_App should connect to: http://192.168.4.145:5000/api")
    
    print("\n🔧 Troubleshooting steps:")
    print("1. Make sure your mobile device is on the same WiFi network as your laptop")
    print("2. Check if Windows Firewall is blocking port 5000")
    print("3. Verify the Vehicle_App is using the correct IP address")
    print("4. Try accessing http://192.168.4.145:5000 from your mobile browser")

if __name__ == "__main__":
    print("🚀 Vehicle_App Connectivity Test")
    print("=" * 60)
    
    if test_backend_connectivity():
        print("\n✅ Backend connectivity tests passed!")
        print("🚀 Vehicle_App should now be able to connect")
    else:
        print("\n❌ Backend connectivity tests failed!")
        print("🔧 Please check the network configuration")
    
    test_mobile_network()
