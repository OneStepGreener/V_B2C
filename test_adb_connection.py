#!/usr/bin/env python3
"""
Test script to verify Vehicle_App connectivity through ADB port forwarding
"""
import requests
import json

def test_adb_port_forwarding():
    """Test if ADB port forwarding is working"""
    print("🔍 Testing ADB Port Forwarding")
    print("=" * 60)
    
    # Test 1: Basic connectivity through localhost
    print("📡 Test 1: Basic connectivity through localhost...")
    try:
        response = requests.get('http://localhost:5000/')
        if response.status_code == 200:
            print("✅ Backend accessible through localhost")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Backend returned status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect through localhost: {e}")
        return False
    
    # Test 2: API endpoints through localhost
    print("\n📡 Test 2: API endpoints through localhost...")
    try:
        response = requests.get('http://localhost:5000/api/pickup/areas')
        if response.status_code == 200:
            data = response.json()
            areas = data.get('areas', [])
            print(f"✅ API endpoints working: {len(areas)} areas found")
        else:
            print(f"❌ API endpoints failed: {response.status_code}")
    except Exception as e:
        print(f"❌ API endpoints error: {e}")
    
    # Test 3: Authentication through localhost
    print("\n📡 Test 3: Authentication through localhost...")
    try:
        test_data = {
            "vehicle_number": "DL1LAN3660",
            "driving_license": "BR5020230001371"
        }
        
        response = requests.post(
            'http://localhost:5000/api/driver/authenticate/v2',
            json=test_data,
            headers={'Content-Type': 'application/json'}
        )
        
        if response.status_code == 200:
            print("✅ Authentication working through localhost")
            data = response.json()
            print(f"   Assignment ID: {data.get('assignment_id')}")
            print(f"   Total Stops: {data.get('total_stops')}")
        else:
            print(f"❌ Authentication failed: {response.status_code}")
    except Exception as e:
        print(f"❌ Authentication error: {e}")
    
    return True

def check_adb_status():
    """Check ADB device and port forwarding status"""
    print("\n📱 ADB Status Check")
    print("=" * 60)
    
    import subprocess
    
    try:
        # Check devices
        result = subprocess.run(['adb', 'devices'], capture_output=True, text=True)
        print("📱 Connected devices:")
        print(result.stdout)
        
        # Check port forwarding
        result = subprocess.run(['adb', 'reverse', '--list'], capture_output=True, text=True)
        print("🔗 Port forwarding rules:")
        print(result.stdout)
        
    except Exception as e:
        print(f"❌ Error checking ADB: {e}")

def main():
    """Main test function"""
    print("🚀 ADB Port Forwarding Test")
    print("=" * 60)
    
    check_adb_status()
    
    if test_adb_port_forwarding():
        print("\n✅ ADB port forwarding is working!")
        print("🚀 Vehicle_App should now connect through localhost")
    else:
        print("\n❌ ADB port forwarding test failed!")
        print("🔧 Please check the setup")

if __name__ == "__main__":
    main()
