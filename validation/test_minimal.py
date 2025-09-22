#!/usr/bin/env python3
"""
Minimal Real-Time Test Script

Tests the core real-time functionality without Docker dependencies.
"""

import asyncio
import websockets
import json
import requests
import time
import os

def test_backend_health():
    """Test if backend is responding"""
    try:
        response = requests.get("http://localhost:8000/health", timeout=5)
        if response.status_code == 200:
            print("✅ Backend is healthy")
            return True
        else:
            print(f"❌ Backend returned status {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Cannot connect to backend: {e}")
        return False

async def test_websocket_connection():
    """Test WebSocket connection"""
    try:
        uri = "ws://localhost:8000/ws/job/test-job-123"
        async with websockets.connect(uri) as websocket:
            print("✅ WebSocket connection established")

            # Send a test message
            await websocket.send(json.dumps({"test": "message"}))
            print("✅ WebSocket message sent")

            # Wait a bit for any response
            try:
                response = await asyncio.wait_for(websocket.recv(), timeout=2.0)
                print(f"✅ WebSocket response: {response}")
            except asyncio.TimeoutError:
                print("ℹ️  No WebSocket response (expected for test job)")

            return True
    except Exception as e:
        print(f"❌ WebSocket connection failed: {e}")
        return False

def test_api_endpoints():
    """Test basic API endpoints"""
    endpoints_to_test = [
        ("POST", "/api/projects", {"name": "Test Project", "description": "Real-time test", "problem_type": "classification", "target_column": "target"}),
    ]

    success_count = 0

    for method, endpoint, data in endpoints_to_test:
        try:
            if method == "POST":
                response = requests.post(f"http://localhost:8000{endpoint}", json=data, timeout=10)
            else:
                response = requests.get(f"http://localhost:8000{endpoint}", timeout=10)

            if response.status_code in [200, 201]:
                print(f"✅ {method} {endpoint} - Status {response.status_code}")
                success_count += 1
            else:
                print(f"❌ {method} {endpoint} - Status {response.status_code}: {response.text[:100]}")

        except Exception as e:
            print(f"❌ {method} {endpoint} - Error: {e}")

    return success_count

def main():
    print("🧪 Minimal Real-Time Functionality Test")
    print("=" * 50)

    # Test 1: Backend health
    print("\n1. Testing Backend Health...")
    backend_ok = test_backend_health()

    if not backend_ok:
        print("\n❌ Backend is not running. Please start it first:")
        print("   docker-compose up -d redis backend celery_worker flower")
        return

    # Test 2: WebSocket connection
    print("\n2. Testing WebSocket Connection...")
    try:
        websocket_ok = asyncio.run(test_websocket_connection())
    except Exception as e:
        print(f"❌ WebSocket test failed: {e}")
        websocket_ok = False

    # Test 3: API endpoints
    print("\n3. Testing API Endpoints...")
    api_success_count = test_api_endpoints()

    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST RESULTS:")

    tests_passed = 0
    total_tests = 3

    if backend_ok:
        tests_passed += 1
        print("✅ Backend Health: PASSED")
    else:
        print("❌ Backend Health: FAILED")

    if websocket_ok:
        tests_passed += 1
        print("✅ WebSocket Connection: PASSED")
    else:
        print("❌ WebSocket Connection: FAILED")

    if api_success_count > 0:
        tests_passed += 1
        print(f"✅ API Endpoints: PASSED ({api_success_count} endpoints working)")
    else:
        print("❌ API Endpoints: FAILED")

    print(f"\n🎯 Overall: {tests_passed}/{total_tests} tests passed")

    if tests_passed == total_tests:
        print("\n🎉 REAL-TIME FUNCTIONALITY IS WORKING!")
        print("You can now run: python test_realtime.py")
    else:
        print("\n❌ Some tests failed. Check the output above.")

if __name__ == "__main__":
    main()
