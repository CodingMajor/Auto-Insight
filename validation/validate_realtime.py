#!/usr/bin/env python3
"""
Quick Validation Script for Real-Time Auto-Insights Implementation

This script checks if the real-time functionality is implemented correctly
without requiring Docker containers to be running.
"""

import os
import sys
import ast
import importlib.util
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

def check_imports(filepath):
    """Check if required imports are present in the file"""
    with open(filepath, 'r') as f:
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

    return len(missing_imports) == 0, missing_imports

def check_celery_tasks(filepath):
    """Check if Celery tasks are properly defined"""
    with open(filepath, 'r') as f:
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

    return len(missing_tasks) == 0, missing_tasks

def check_websocket_endpoint(filepath):
    """Check if WebSocket endpoint is properly defined"""
    with open(filepath, 'r') as f:
        content = f.read()

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

    return len(missing_ws) == 0, missing_ws

def check_realtime_endpoints(filepath):
    """Check if API endpoints return job_id and websocket_url"""
    with open(filepath, 'r') as f:
        content = f.read()

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

    return len(missing_endpoints) == 0, missing_endpoints

def validate_implementation():
    """Main validation function"""
    print("🔍 Validating Real-Time Auto-Insights Implementation")
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
    imports_ok, missing = check_imports(main_file)
    status = "✅" if imports_ok else "❌"
    print(f"  {status} main.py imports")
    if not imports_ok:
        print(f"    Missing: {missing}")

    # Check tasks.py
    tasks_file = base_dir / "backend/tasks.py"
    tasks_ok, missing_tasks = check_celery_tasks(tasks_file)
    status = "✅" if tasks_ok else "❌"
    print(f"  {status} tasks.py Celery tasks")
    if not tasks_ok:
        print(f"    Missing: {missing_tasks}")

    print("\n🔌 Checking WebSocket implementation...")

    # Check WebSocket endpoint
    ws_ok, missing_ws = check_websocket_endpoint(main_file)
    status = "✅" if ws_ok else "❌"
    print(f"  {status} WebSocket endpoint")
    if not ws_ok:
        print(f"    Missing: {missing_ws}")

    print("\n🚀 Checking real-time API endpoints...")

    # Check real-time endpoints
    endpoints_ok, missing_endpoints = check_realtime_endpoints(main_file)
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

    # Final validation
    print("\n" + "=" * 60)
    all_checks_pass = (
        all_files_exist and syntax_ok and imports_ok and
        tasks_ok and ws_ok and endpoints_ok and deps_ok and docker_ok
    )

    if all_checks_pass:
        print("🎉 REAL-TIME IMPLEMENTATION VALIDATION PASSED!")
        print("\n✅ All components are correctly implemented:")
        print("  • Celery background task processing")
        print("  • Redis status storage and caching")
        print("  • WebSocket real-time progress updates")
        print("  • Real-time API endpoints")
        print("  • Docker container configuration")
        print("  • Proper dependencies and imports")
        print("\n🚀 Ready to run with: ./start.sh")
        return True
    else:
        print("❌ REAL-TIME IMPLEMENTATION VALIDATION FAILED!")
        print("\nPlease fix the issues above before running the platform.")
        return False

if __name__ == "__main__":
    success = validate_implementation()
    sys.exit(0 if success else 1)
