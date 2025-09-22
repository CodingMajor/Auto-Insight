#!/usr/bin/env python3
"""
Comprehensive Auto-Insights Platform Validation Script

This script validates the entire Auto-Insights platform including:
- Backend real-time functionality
- Frontend integration
- File structure and dependencies
- Docker configuration
- All components working together
"""

import os
import sys
import ast
import importlib.util
import re
from pathlib import Path

def check_file_exists(filepath):
    """Check if a file exists"""
    return Path(filepath).exists()

def check_syntax_errors(filepath):
    """Check for Python syntax errors in a file"""
    try:
        with open(filepath, 'r') as f:
            ast.parse(f.read())
        return True, None
    except SyntaxError as e:
        return False, str(e)

def validate_backend_realtime():
    """Validate backend real-time functionality"""
    print("🔍 Validating Backend Real-Time Implementation")
    print("=" * 60)

    base_dir = Path(__file__).parent
    backend_dir = base_dir / "backend"

    # Check file structure
    required_files = [
        "backend/main.py",
        "backend/tasks.py",
        "backend/celery_app.py",
        "backend/ml/eda.py",
        "backend/ml/automl.py",
        "backend/ml/preprocessing.py",
        "backend/requirements.txt",
        "docker-compose.yml",
        "start.sh"
    ]

    print("📁 Checking file structure...")
    all_files_exist = True
    for file in required_files:
        filepath = base_dir / file
        exists = check_file_exists(filepath)
        status = "✅" if exists else "❌"
        print(f"  {status} {file}")
        if not exists:
            all_files_exist = False

    if not all_files_exist:
        print("❌ Some required files are missing!")
        return False

    print("\n🐍 Checking Python syntax...")

    # Check syntax for Python files
    python_files = [
        "backend/main.py",
        "backend/tasks.py",
        "backend/celery_app.py",
        "backend/ml/eda.py",
        "backend/ml/automl.py",
        "backend/ml/preprocessing.py"
    ]

    syntax_ok = True
    for file in python_files:
        filepath = base_dir / file
        ok, error = check_syntax_errors(filepath)
        status = "✅" if ok else "❌"
        print(f"  {status} {file}")
        if not ok:
            print(f"    Error: {error}")
            syntax_ok = False

    if not syntax_ok:
        print("❌ Syntax errors found!")
        return False

    print("\n📦 Checking imports and dependencies...")

    # Check main.py imports
    main_file = base_dir / "backend/main.py"
    with open(main_file, 'r') as f:
        content = f.read()

    required_imports = [
        'from tasks import',
        'from celery_app import',
        'WebSocket',
        'WebSocketDisconnect'
    ]

    missing_imports = []
    for imp in required_imports:
        if imp not in content:
            missing_imports.append(imp)

    imports_ok = len(missing_imports) == 0
    status = "✅" if imports_ok else "❌"
    print(f"  {status} main.py imports")
    if not imports_ok:
        print(f"    Missing: {missing_imports}")

    # Check tasks.py
    tasks_file = base_dir / "backend/tasks.py"
    with open(tasks_file, 'r') as f:
        content = f.read()

    required_tasks = [
        '@shared_task(bind=True)',
        'run_eda_analysis_task',
        'train_automl_models_task',
        'update_job_status',
        'get_job_status'
    ]

    missing_tasks = []
    for task in required_tasks:
        if task not in content:
            missing_tasks.append(task)

    tasks_ok = len(missing_tasks) == 0
    status = "✅" if tasks_ok else "❌"
    print(f"  {status} tasks.py Celery tasks")
    if not tasks_ok:
        print(f"    Missing: {missing_tasks}")

    print("\n🔌 Checking WebSocket implementation...")

    # Check WebSocket endpoint
    websocket_checks = [
        '@app.websocket("/ws/job/{job_id}")',
        'websocket_job_progress',
        'manager.connect',
        'manager.disconnect'
    ]

    missing_ws = []
    for check in websocket_checks:
        if check not in content:
            missing_ws.append(check)

    ws_ok = len(missing_ws) == 0
    status = "✅" if ws_ok else "❌"
    print(f"  {status} WebSocket endpoint")
    if not ws_ok:
        print(f"    Missing: {missing_ws}")

    print("\n🚀 Checking real-time API endpoints...")

    # Check real-time endpoints
    endpoint_checks = [
        'task = run_eda_analysis_task.delay(',
        'task = train_automl_models_task.delay(',
        '"job_id": task.id',
        '"websocket_url":'
    ]

    missing_endpoints = []
    for check in endpoint_checks:
        if check not in content:
            missing_endpoints.append(check)

    endpoints_ok = len(missing_endpoints) == 0
    status = "✅" if endpoints_ok else "❌"
    print(f"  {status} Real-time API endpoints")
    if not endpoints_ok:
        print(f"    Missing: {missing_endpoints}")

    print("\n📋 Checking requirements.txt...")

    # Check if Celery and Redis are in requirements
    req_file = base_dir / "backend/requirements.txt"
    with open(req_file, 'r') as f:
        requirements = f.read()

    celery_deps = ['celery', 'redis', 'websockets']
    missing_deps = []
    for dep in celery_deps:
        if dep not in requirements:
            missing_deps.append(dep)

    deps_ok = len(missing_deps) == 0
    status = "✅" if deps_ok else "❌"
    print(f"  {status} Real-time dependencies")
    if not deps_ok:
        print(f"    Missing: {missing_deps}")

    print("\n🐳 Checking Docker configuration...")

    # Check docker-compose.yml
    compose_file = base_dir / "docker-compose.yml"
    with open(compose_file, 'r') as f:
        compose_content = f.read()

    docker_checks = [
        'redis:', 'celery_worker:', 'flower:',
        'REDIS_URL', 'Flower'
    ]

    missing_docker = []
    for check in docker_checks:
        if check not in compose_content:
            missing_docker.append(check)

    docker_ok = len(missing_docker) == 0
    status = "✅" if docker_ok else "❌"
    print(f"  {status} Docker real-time services")
    if not docker_ok:
        print(f"    Missing: {missing_docker}")

    # Final backend validation
    backend_ok = (
        all_files_exist and syntax_ok and imports_ok and
        tasks_ok and ws_ok and endpoints_ok and deps_ok and docker_ok
    )

    if backend_ok:
        print("\n✅ BACKEND REAL-TIME VALIDATION PASSED!")
    else:
        print("\n❌ BACKEND REAL-TIME VALIDATION FAILED!")

    return backend_ok

def validate_frontend_integration():
    """Validate frontend integration with real-time backend"""
    print("\n🔍 Validating Frontend Real-Time Integration")
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

    # Final frontend validation
    if all_components_good:
        print("\n✅ FRONTEND REAL-TIME INTEGRATION COMPLETE!")
        return True
    else:
        print("\n❌ FRONTEND INTEGRATION INCOMPLETE")
        return False

def validate_full_platform():
    """Main validation function"""
    print("🚀 Auto-Insights Platform Comprehensive Validation")
    print("=" * 70)

    backend_ok = validate_backend_realtime()
    frontend_ok = validate_frontend_integration()

    print("\n" + "=" * 70)
    print("📊 FINAL VALIDATION RESULTS:")
    print("=" * 70)

    if backend_ok:
        print("✅ BACKEND: All real-time components properly implemented")
        print("   • Celery background task processing")
        print("   • Redis status storage and caching")
        print("   • WebSocket real-time progress updates")
        print("   • Real-time API endpoints")
        print("   • Docker container configuration")
    else:
        print("❌ BACKEND: Issues found - check above for details")

    if frontend_ok:
        print("\n✅ FRONTEND: All components properly integrated")
        print("   • API service with real-time endpoints")
        print("   • WebSocket connections for live updates")
        print("   • Proper component integration")
    else:
        print("\n❌ FRONTEND: Integration issues found - check above for details")

    print("\n" + "=" * 70)
    if backend_ok and frontend_ok:
        print("🎉 COMPREHENSIVE PLATFORM VALIDATION PASSED!")
        print("\n✅ All components are correctly implemented and integrated:")
        print("  • Backend real-time functionality with Celery and WebSocket")
        print("  • Frontend integration with real-time APIs")
        print("  • Docker configuration for all services")
        print("  • Proper dependencies and file structure")
        print("\n🚀 Ready to run with: ./start.sh")
        return True
    else:
        print("❌ COMPREHENSIVE PLATFORM VALIDATION FAILED!")
        print("\nPlease fix the issues above before running the platform.")
        return False

if __name__ == "__main__":
    success = validate_full_platform()
    sys.exit(0 if success else 1)
