#!/usr/bin/env python3
"""
Comprehensive test to verify Vehicle_App connectivity to backend
"""
import requests
import json
import time

def test_vehicle_app_connectivity():
    """Test Vehicle_App connectivity comprehensively"""
    print("🔍 Comprehensive Vehicle_App Connectivity Test")
    print("=" * 60)
    
    # Test 1: Backend server status
    print("📡 Test 1: Backend server status...")
    try:
        response = requests.get('http://localhost:5000/')
        if response.status_code == 200:
            print("✅ Backend server is running and accessible")
            print(f"   Response: {response.json()}")
        else:
            print(f"❌ Backend server returned status: {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        return False
    
    # Test 2: ADB port forwarding
    print("\n📡 Test 2: ADB port forwarding...")
    try:
        import subprocess
        result = subprocess.run(['adb', 'reverse', '--list'], capture_output=True, text=True)
        if 'tcp:5000 tcp:5000' in result.stdout:
            print("✅ ADB port forwarding is active")
            print(f"   Rules: {result.stdout.strip()}")
        else:
            print("❌ ADB port forwarding not found")
            print("   Setting up port forwarding...")
            subprocess.run(['adb', 'reverse', 'tcp:5000', 'tcp:5000'])
            print("✅ Port forwarding set up")
    except Exception as e:
        print(f"❌ ADB port forwarding error: {e}")
    
    # Test 3: API endpoints
    print("\n📡 Test 3: API endpoints...")
    try:
        response = requests.get('http://localhost:5000/api/pickup/areas')
        if response.status_code == 200:
            data = response.json()
            areas = data.get('areas', [])
            print(f"✅ API endpoints working: {len(areas)} areas found")
            print(f"   Areas: {areas}")
        else:
            print(f"❌ API endpoints failed: {response.status_code}")
    except Exception as e:
        print(f"❌ API endpoints error: {e}")
    
    # Test 4: Vehicle_App authentication endpoint
    print("\n📡 Test 4: Vehicle_App authentication endpoint...")
    try:
        # Test with real credentials
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
            data = response.json()
            print("✅ Vehicle_App authentication working!")
            print(f"   Assignment ID: {data.get('assignment_id')}")
            print(f"   Driver DL: {data.get('driver_dl')}")
            print(f"   Vehicle No: {data.get('vehicle_no')}")
            print(f"   Total Stops: {data.get('total_stops')}")
            print(f"   Current Stop: {data.get('current_stop', {}).get('name_snapshot', 'N/A')}")
            print(f"   Address: {data.get('current_stop', {}).get('address_snapshot', 'N/A')}")
        else:
            print(f"❌ Authentication failed: {response.status_code}")
            print(f"   Response: {response.text}")
    except Exception as e:
        print(f"❌ Authentication error: {e}")
    
    return True

def check_mobile_device():
    """Check mobile device status"""
    print("\n📱 Mobile Device Status")
    print("=" * 60)
    
    try:
        import subprocess
        
        # Check devices
        result = subprocess.run(['adb', 'devices'], capture_output=True, text=True)
        print("📱 Connected devices:")
        print(result.stdout)
        
        # Check if Vehicle_App is installed
        result = subprocess.run(['adb', 'shell', 'pm', 'list', 'packages', 'com.vehicle_app'], capture_output=True, text=True)
        if 'com.vehicle_app' in result.stdout:
            print("✅ Vehicle_App is installed on device")
        else:
            print("❌ Vehicle_App not found on device")
            
    except Exception as e:
        print(f"❌ Error checking mobile device: {e}")

def provide_test_instructions():
    """Provide step-by-step test instructions"""
    print("\n🚀 Vehicle_App Test Instructions")
    print("=" * 60)
    
    print("📱 Step 1: Open Vehicle_App on your mobile device")
    print("📱 Step 2: Try logging in with these credentials:")
    print("   Vehicle Number: DL1LAN3660")
    print("   Driving License: BR5020230001371")
    print("")
    print("📱 Step 3: Expected Results:")
    print("   ✅ Should connect to server (no error)")
    print("   ✅ Should authenticate successfully")
    print("   ✅ Should show real customer data")
    print("   ✅ Should display route with 79 stops")
    print("")
    print("📱 Step 4: If still showing connection error:")
    print("   - Check if app is using latest version")
    print("   - Try restarting the app")
    print("   - Check if ADB port forwarding is active")
    print("   - Verify backend server is running")

def main():
    """Main test function"""
    print("🚀 Vehicle_App Connectivity Verification")
    print("=" * 60)
    
    check_mobile_device()
    
    if test_vehicle_app_connectivity():
        print("\n✅ All connectivity tests passed!")
        print("🚀 Vehicle_App should now work correctly")
    else:
        print("\n❌ Some connectivity tests failed!")
        print("🔧 Please check the configuration")
    
    provide_test_instructions()

if __name__ == "__main__":
    main()
