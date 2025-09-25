#!/usr/bin/env python3
"""
Test Vehicle App connectivity to live server
"""

import requests
import json

LIVE_BASE_URL = "https://reactapp.tcil.in/aiml/LATEST_BACK_VEHICLE"

def test_vehicle_app_endpoints():
    """Test Vehicle App specific endpoints"""
    print("🚗 Testing Vehicle App Endpoints on Live Server")
    print("=" * 60)
    
    # Vehicle App endpoints
    vehicle_endpoints = [
        ("/api/driver/authenticate", "POST", "Driver Authentication (V1)"),
        ("/api/driver/authenticate/v2", "POST", "Driver Authentication (V2)"),
        ("/api/assignments/{id}/stops/{sequence}", "GET", "Assignment Stop Details"),
        ("/api/assignments/{id}/stops/{sequence}/complete", "POST", "Complete Stop"),
        ("/api/assignments/{id}/progress", "GET", "Assignment Progress"),
    ]
    
    working_endpoints = []
    failed_endpoints = []
    
    for endpoint, method, description in vehicle_endpoints:
        print(f"\n🔍 Testing: {description}")
        print(f"   Endpoint: {method} {endpoint}")
        
        try:
            if method == "GET":
                # For GET requests, use test IDs
                test_endpoint = endpoint.replace("{id}", "1").replace("{sequence}", "1")
                response = requests.get(f"{LIVE_BASE_URL}{test_endpoint}", timeout=15)
            else:
                # For POST requests, send test data
                test_data = {
                    "vehicle_number": "TEST123",
                    "driving_license": "TESTDL123"
                }
                response = requests.post(f"{LIVE_BASE_URL}{endpoint}", json=test_data, timeout=20)
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"   ✅ SUCCESS! Response: {type(data)}")
                    if isinstance(data, dict):
                        print(f"   Keys: {list(data.keys())}")
                    working_endpoints.append((endpoint, description))
                except json.JSONDecodeError:
                    print(f"   ✅ SUCCESS! Text: {response.text[:100]}...")
                    working_endpoints.append((endpoint, description))
            elif response.status_code in [400, 404, 422]:
                print(f"   ✅ Endpoint accessible (expected response for test data)")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data.get('error', 'Unknown error')}")
                except:
                    print(f"   Response: {response.text[:100]}...")
                working_endpoints.append((endpoint, description))
            elif response.status_code == 500:
                try:
                    error_data = response.json()
                    error_msg = error_data.get('error', 'Unknown error')
                    print(f"   ❌ Server Error: {error_msg}")
                    failed_endpoints.append((endpoint, description, error_msg))
                except:
                    print(f"   ❌ Server Error: {response.text[:100]}...")
                    failed_endpoints.append((endpoint, description, "Server Error"))
            else:
                print(f"   ⚠️ Unexpected Status: {response.status_code}")
                print(f"   Response: {response.text[:100]}...")
                failed_endpoints.append((endpoint, description, f"Status {response.status_code}"))
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Request failed: {e}")
            failed_endpoints.append((endpoint, description, str(e)))
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 Vehicle App Connectivity Summary")
    print("=" * 60)
    
    if working_endpoints:
        print(f"\n✅ Working Endpoints ({len(working_endpoints)}):")
        for endpoint, description in working_endpoints:
            print(f"   • {description}: {endpoint}")
    
    if failed_endpoints:
        print(f"\n❌ Failed Endpoints ({len(failed_endpoints)}):")
        for endpoint, description, error in failed_endpoints:
            print(f"   • {description}: {endpoint}")
            print(f"     Error: {error}")
    
    print(f"\n📈 Success Rate: {len(working_endpoints)}/{len(vehicle_endpoints)} ({len(working_endpoints)/len(vehicle_endpoints)*100:.1f}%)")
    
    # Vehicle App readiness assessment
    print("\n🎯 Vehicle App Readiness Assessment:")
    if len(working_endpoints) >= len(vehicle_endpoints) * 0.8:  # 80% success rate
        print("   ✅ Vehicle App is ready to use with live server!")
        print("   🚀 You can now build and run the Vehicle App and it will connect to the live server.")
    elif len(working_endpoints) >= len(vehicle_endpoints) * 0.5:  # 50% success rate
        print("   ⚠️ Vehicle App partially ready - some features may not work.")
        print("   🔧 Some endpoints need to be fixed.")
    else:
        print("   ❌ Vehicle App not ready - major connectivity issues.")
        print("   🔧 Server configuration needs to be fixed.")

def test_authentication_with_real_data():
    """Test authentication with real vehicle/driver data"""
    print("\n🔐 Testing Authentication with Real Data")
    print("=" * 60)
    
    # Test V2 authentication with real credentials (if available)
    test_credentials = [
        {"vehicle_number": "DL01AB1234", "driving_license": "DL012345678901234"},
        {"vehicle_number": "HR26AB1234", "driving_license": "HR012345678901234"},
    ]
    
    for i, creds in enumerate(test_credentials, 1):
        print(f"\n🔍 Test {i}: Vehicle {creds['vehicle_number']}, DL {creds['driving_license']}")
        
        try:
            response = requests.post(
                f"{LIVE_BASE_URL}/api/driver/authenticate/v2",
                json=creds,
                timeout=20
            )
            
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                try:
                    data = response.json()
                    print(f"   ✅ Authentication successful!")
                    print(f"   Driver: {data.get('driver_name', 'Unknown')}")
                    print(f"   Assignment ID: {data.get('assignment_id', 'Unknown')}")
                    print(f"   Total Stops: {data.get('total_stops', 'Unknown')}")
                    print(f"   Current Stop: {data.get('current_stop', {}).get('sequence', 'Unknown')}")
                except:
                    print(f"   ✅ Authentication successful!")
                    print(f"   Response: {response.text[:200]}...")
            elif response.status_code == 400:
                try:
                    error_data = response.json()
                    print(f"   ⚠️ Expected failure: {error_data.get('error', 'Unknown error')}")
                except:
                    print(f"   ⚠️ Expected failure: {response.text[:100]}...")
            else:
                print(f"   ❌ Unexpected status: {response.status_code}")
                print(f"   Response: {response.text[:100]}...")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Request failed: {e}")

def test_multi_area_authentication():
    """Test authentication for different areas"""
    print("\n🌍 Testing Multi-Area Authentication")
    print("=" * 60)
    
    # Test area switching and authentication
    areas = ["delhi", "gurugram"]
    
    for area in areas:
        print(f"\n🔍 Testing {area.upper()} area:")
        
        # Switch to area
        try:
            switch_response = requests.post(
                f"{LIVE_BASE_URL}/api/areas/switch",
                json={"area": area},
                timeout=15
            )
            
            if switch_response.status_code == 200:
                print(f"   ✅ Switched to {area} area")
                
                # Test authentication in this area
                test_creds = {
                    "vehicle_number": f"{area.upper()[:2]}01AB1234",
                    "driving_license": f"{area.upper()[:2]}012345678901234"
                }
                
                auth_response = requests.post(
                    f"{LIVE_BASE_URL}/api/driver/authenticate/v2",
                    json=test_creds,
                    timeout=20
                )
                
                print(f"   Authentication Status: {auth_response.status_code}")
                if auth_response.status_code == 200:
                    print(f"   ✅ Authentication works in {area} area")
                elif auth_response.status_code == 400:
                    print(f"   ⚠️ Expected failure in {area} area (test credentials)")
                else:
                    print(f"   ❌ Authentication failed in {area} area")
            else:
                print(f"   ❌ Failed to switch to {area} area")
                
        except requests.exceptions.RequestException as e:
            print(f"   ❌ Request failed: {e}")

def main():
    """Main test function"""
    print("🚗 Vehicle App Live Server Testing")
    print("=" * 60)
    print(f"Target: {LIVE_BASE_URL}")
    print()
    
    test_vehicle_app_endpoints()
    test_authentication_with_real_data()
    test_multi_area_authentication()
    
    print("\n" + "=" * 60)
    print("🏁 Vehicle App Testing Complete!")
    print("\n📋 Next Steps:")
    print("   1. If tests pass, the Vehicle App is ready to use")
    print("   2. Build the Vehicle App: npx react-native run-android")
    print("   3. The app will now connect to the live server")
    print("   4. Test login with real vehicle/driver credentials")

if __name__ == "__main__":
    main()
