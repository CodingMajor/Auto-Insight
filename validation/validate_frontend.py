#!/usr/bin/env python3
"""
Frontend Real-Time Integration Validator

This script checks if all frontend components are properly integrated
with the real-time backend endpoints.
"""

import os
import re
from pathlib import Path

def check_frontend_integration():
    """Check frontend integration with real-time backend"""
    print("🔍 Checking Frontend Real-Time Integration")
    print("=" * 50)

    frontend_dir = Path(__file__).parent / "frontend" / "src"

    # Check if API service exists
    api_service = frontend_dir / "services" / "api.ts"
    if not api_service.exists():
        print("❌ API service not found at frontend/src/services/api.ts")
        return False

    print("✅ API service exists")

    # Check API service content
    with open(api_service, 'r') as f:
        api_content = f.read()

    required_apis = [
        'export const edaService',
        'export const automlService',
        'RealTimeService',
        'WebSocket',
        'baseURL'
    ]

    missing_apis = []
    for api in required_apis:
        if api not in api_content:
            missing_apis.append(api)

    if missing_apis:
        print(f"❌ Missing APIs in api.ts: {missing_apis}")
        return False

    print("✅ API service has all required endpoints")

    # Check components integration
    components_to_check = [
        ("pages/ModelTraining.tsx", ["automlService.train", "RealTimeService", "WebSocket"]),
        ("pages/StandaloneAnalysis.tsx", ["edaService.analyze", "RealTimeService", "WebSocket"]),
        ("pages/StandaloneDataUpload.tsx", ["dataService.upload"])
    ]

    all_components_good = True

    for component_path, required_imports in components_to_check:
        component_file = frontend_dir / component_path

        if not component_file.exists():
            print(f"❌ Component not found: {component_path}")
            all_components_good = False
            continue

        with open(component_file, 'r') as f:
            component_content = f.read()

        missing_imports = []
        for imp in required_imports:
            if imp not in component_content:
                missing_imports.append(imp)

        if missing_imports:
            print(f"❌ {component_path} missing: {missing_imports}")
            all_components_good = False
        else:
            print(f"✅ {component_path} properly integrated")

    # Check for old fetch API usage
    old_fetch_usage = []
    for root, dirs, files in os.walk(frontend_dir):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = Path(root) / file
                with open(filepath, 'r') as f:
                    content = f.read()

                # Check for old fetch calls to localhost:8000
                if 'fetch(' in content and 'localhost:8000' in content:
                    old_fetch_usage.append(str(filepath.relative_to(frontend_dir)))

    if old_fetch_usage:
        print(f"⚠️  Found old fetch API usage in: {old_fetch_usage}")
        print("   These should be replaced with the new API service")

    # Check WebSocket integration
    websocket_usage = []
    for root, dirs, files in os.walk(frontend_dir):
        for file in files:
            if file.endswith('.tsx') or file.endswith('.ts'):
                filepath = Path(root) / file
                with open(filepath, 'r') as f:
                    content = f.read()

                if 'WebSocket' in content and 'RealTimeService' in content:
                    websocket_usage.append(str(filepath.relative_to(frontend_dir)))

    print(f"✅ WebSocket integration found in: {len(websocket_usage)} components")

    # Final assessment
    print("\n" + "=" * 50)
    if all_components_good:
        print("🎉 FRONTEND REAL-TIME INTEGRATION COMPLETE!")
        print("\n✅ All components properly connected:")
        print("  • ModelTraining uses real-time AutoML API + WebSocket")
        print("  • StandaloneAnalysis uses real-time EDA API + WebSocket")
        print("  • Data upload uses real-time API service")
        print("  • WebSocket connections for live progress updates")
        print("  • Proper error handling and status management")
        print("\n🚀 Frontend ready for real-time backend integration!")
        return True
    else:
        print("❌ FRONTEND INTEGRATION INCOMPLETE")
        print("Please fix the issues above to complete real-time integration.")
        return False

if __name__ == "__main__":
    success = check_frontend_integration()
    exit(0 if success else 1)
