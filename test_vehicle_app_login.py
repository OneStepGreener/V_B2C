#!/usr/bin/env python3
"""
Test script to verify Vehicle App login functionality
"""

import requests
import json

BASE_URL = "http://localhost:5000/api"

def test_vehicle_app_login():
    print("🚛 Testing Vehicle App Login Functionality")
    print("=" * 60)
    
    # Test 1: Check if V2 authentication endpoint exists
    print("\n1️⃣ Testing V2 Authentication Endpoint...")
    
    # Test with sample credentials (you'll need to replace with actual data)
    test_credentials = {
        "vehicle_number": "DL1LAN3660",  # Replace with actual vehicle number from your database
        "driving_license": "BR5020230001371"  # Replace with actual DL number from your database
    }
    
    print(f"   Testing with vehicle: {test_credentials['vehicle_number']}")
    print(f"   Testing with DL: {test_credentials['driving_license']}")
    
    try:
        response = requests.post(f"{BASE_URL}/driver/authenticate/v2", 
                               json=test_credentials,
                               timeout=10)
        
        print(f"   Response status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ V2 Authentication successful!")
            print(f"   Assignment ID: {data.get('assignment_id', 'N/A')}")
            print(f"   Driver Name: {data.get('driver_name', 'N/A')}")
            print(f"   Vehicle: {data.get('vehicle_no', 'N/A')}")
            print(f"   Total Stops: {data.get('total_stops', 'N/A')}")
            print(f"   Route Date: {data.get('route_date', 'N/A')}")
            print(f"   Current Stop: {data.get('current_stop', 'N/A')}")
            
            # Test if current stop has required fields
            if data.get('current_stop'):
                stop = data['current_stop']
                print(f"   Current Stop Details:")
                print(f"     Customer: {stop.get('customer_name', 'N/A')}")
                print(f"     Address: {stop.get('address', 'N/A')}")
                print(f"     Contact: {stop.get('contact_no', 'N/A')}")
                print(f"     Coordinates: {stop.get('latitude', 'N/A')}, {stop.get('longitude', 'N/A')}")
            
        else:
            print(f"   ❌ V2 Authentication failed")
            try:
                error_data = response.json()
                print(f"   Error: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"   Error: {response.text}")
                
    except requests.exceptions.Timeout:
        print("   ❌ Request timed out")
    except requests.exceptions.ConnectionError:
        print("   ❌ Connection error - server might not be running")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
    
    # Test 2: Check current area configuration
    print("\n2️⃣ Checking Current Area Configuration...")
    try:
        response = requests.get(f"{BASE_URL}/areas/current")
        data = response.json()
        
        if data['success']:
            print(f"   ✅ Current area: {data['current_area']}")
            print(f"   Table: {data['config']['table_name']}")
            print(f"   City: {data['config']['city']}")
        else:
            print(f"   ❌ Failed to get area config: {data.get('error', 'Unknown error')}")
    except Exception as e:
        print(f"   ❌ Error: {str(e)}")
    
    # Test 3: Test with invalid credentials
    print("\n3️⃣ Testing with Invalid Credentials...")
    invalid_credentials = {
        "vehicle_number": "INVALID123",
        "driving_license": "INVALID456"
    }
    
    try:
        response = requests.post(f"{BASE_URL}/driver/authenticate/v2", 
                               json=invalid_credentials,
                               timeout=10)
        
        if response.status_code == 404 or response.status_code == 400:
            print("   ✅ Correctly rejected invalid credentials")
            try:
                error_data = response.json()
                print(f"   Error message: {error_data.get('error', 'Unknown error')}")
            except:
                print(f"   Error: {response.text}")
        else:
            print(f"   ⚠️ Unexpected response for invalid credentials: {response.status_code}")
            
    except Exception as e:
        print(f"   ❌ Error testing invalid credentials: {str(e)}")
    
    print("\n" + "=" * 60)
    print("✅ Vehicle App login test completed!")
    print("\n📝 Notes:")
    print("- Replace test credentials with actual vehicle/DL numbers from your database")
    print("- Make sure the backend server is running")
    print("- Check that the vehicle_driver_master table has the correct city column")

if __name__ == "__main__":
    test_vehicle_app_login()
