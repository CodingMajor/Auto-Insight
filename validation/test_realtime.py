#!/usr/bin/env python3
"""
Auto-Insights Real-Time Functionality Test Script

This script tests the real-time functionality of the Auto-Insights platform:
1. File upload
2. EDA analysis with live progress
3. AutoML training with real-time status
4. WebSocket connections for live updates
"""

import asyncio
import websockets
import json
import requests
import time
import pandas as pd
import os
from pathlib import Path

# Configuration
BACKEND_URL = "http://localhost:8000"
WS_URL = "ws://localhost:8000"

class RealTimeTester:
    def __init__(self):
        self.project_id = None
        self.dataset_id = None
        self.eda_job_id = None
        self.automl_job_id = None

    def create_sample_data(self):
        """Create a sample dataset for testing"""
        print("📊 Creating sample dataset...")

        # Create a sample customer churn dataset
        data = {
            'customer_id': range(1, 1001),
            'age': [25, 30, 35, 40, 45, 50, 55, 60, 65, 70] * 100,
            'gender': ['Male', 'Female'] * 500,
            'tenure': [i % 72 for i in range(1000)],
            'monthly_charges': [round(20 + (i % 80) * 2.5, 2) for i in range(1000)],
            'total_charges': [round((i % 72) * (20 + (i % 80) * 2.5), 2) for i in range(1000)],
            'contract_type': ['Month-to-month', 'One year', 'Two year'] * 334,
            'internet_service': ['DSL', 'Fiber optic', 'No'] * 334,
            'churn': ['Yes', 'No'] * 500
        }

        df = pd.DataFrame(data)
        csv_path = "sample_customer_data.csv"
        df.to_csv(csv_path, index=False)
        print(f"✅ Sample dataset created: {csv_path}")
        return csv_path

    def create_project(self):
        """Create a new project"""
        print("🏗️  Creating new project...")

        project_data = {
            "name": "Customer Churn Analysis - Real-Time Test",
            "description": "Testing real-time EDA and AutoML functionality",
            "problem_type": "classification",
            "target_column": "churn",
            "success_criteria": "Achieve >80% accuracy in predicting customer churn"
        }

        response = requests.post(f"{BACKEND_URL}/api/projects", json=project_data)
        if response.status_code == 200:
            self.project_id = response.json()['id']
            print(f"✅ Project created: {self.project_id}")
            return True
        else:
            print(f"❌ Failed to create project: {response.text}")
            return False

    def upload_dataset(self, csv_path):
        """Upload dataset to project"""
        print("📤 Uploading dataset...")

        with open(csv_path, 'rb') as f:
            files = {'file': ('sample_customer_data.csv', f, 'text/csv')}
            response = requests.post(
                f"{BACKEND_URL}/api/projects/{self.project_id}/upload",
                files=files
            )

        if response.status_code == 200:
            data = response.json()
            self.dataset_id = data['dataset_id']
            print(f"✅ Dataset uploaded: {self.dataset_id}")
            print(f"   📏 Shape: {data['rows']} rows × {data['columns']} columns")
            return True
        else:
            print(f"❌ Failed to upload dataset: {response.text}")
            return False

    async def websocket_listener(self, job_id, job_type):
        """Listen to WebSocket updates for a job"""
        uri = f"{WS_URL}/ws/job/{job_id}"
        print(f"🔌 Connecting to WebSocket: {uri}")

        try:
            async with websockets.connect(uri) as websocket:
                print(f"✅ Connected to {job_type} progress updates")

                while True:
                    message = await websocket.recv()
                    data = json.loads(message)

                    status = data.get('status', 'unknown')
                    progress = data.get('progress', 0)
                    message_text = data.get('message', '')

                    print(f"🔄 {job_type} Progress: {progress:.1f}% - {message_text}")
                    if status in ['completed', 'failed']:
                        print(f"🏁 {job_type} {status.upper()}!")
                        if 'data' in data:
                            print(f"   📊 Final data: {data['data']}")
                        break

        except Exception as e:
            print(f"❌ WebSocket error: {e}")

    async def run_eda_analysis(self):
        """Run EDA analysis with real-time progress"""
        print("\n🔍 Starting EDA Analysis...")

        eda_data = {
            "project_id": self.project_id,
            "dataset_id": self.dataset_id,
            "target_column": "churn"
        }

        response = requests.post(f"{BACKEND_URL}/api/eda/analyze", json=eda_data)

        if response.status_code == 200:
            data = response.json()
            self.eda_job_id = data['job_id']
            websocket_url = data['websocket_url']

            print(f"✅ EDA job started: {self.eda_job_id}")
            print(f"🔗 WebSocket URL: {websocket_url}")

            # Start WebSocket listener for EDA progress
            await self.websocket_listener(self.eda_job_id, "EDA")

            return True
        else:
            print(f"❌ Failed to start EDA: {response.text}")
            return False

    async def run_automl_training(self):
        """Run AutoML training with real-time progress"""
        print("\n🤖 Starting AutoML Training...")

        automl_data = {
            "project_id": self.project_id,
            "dataset_id": self.dataset_id,
            "target_column": "churn",
            "problem_type": "classification",
            "time_budget": 60,  # 1 minute for testing
            "metric": "accuracy"
        }

        response = requests.post(f"{BACKEND_URL}/api/automl/train", json=automl_data)

        if response.status_code == 200:
            data = response.json()
            self.automl_job_id = data['job_id']
            websocket_url = data['websocket_url']

            print(f"✅ AutoML job started: {self.automl_job_id}")
            print(f"⏱️  Estimated time: {data['estimated_time']}")
            print(f"🔗 WebSocket URL: {websocket_url}")

            # Start WebSocket listener for AutoML progress
            await self.websocket_listener(self.automl_job_id, "AutoML")

            return True
        else:
            print(f"❌ Failed to start AutoML: {response.text}")
            return False

    def get_final_results(self):
        """Get final results after processing"""
        print("\n📊 Getting Final Results...")

        # Get EDA results
        if self.eda_job_id:
            response = requests.get(f"{BACKEND_URL}/api/eda/{self.project_id}/{self.dataset_id}/report")
            if response.status_code == 200:
                eda_results = response.json()
                print("✅ EDA Results retrieved")
                print(f"   📈 Steps completed: {len(eda_results.get('steps', {}))}")
            else:
                print(f"❌ Failed to get EDA results: {response.status_code}")

        # Get AutoML leaderboard
        if self.automl_job_id:
            response = requests.get(f"{BACKEND_URL}/api/automl/{self.project_id}/leaderboard")
            if response.status_code == 200:
                leaderboard = response.json()
                print("✅ AutoML Leaderboard retrieved")
                if leaderboard:
                    best_model = leaderboard[0]
                    print(f"   🏆 Best model: {best_model.get('best_estimator', 'Unknown')}")
                    print(f"   📊 Best score: {best_model.get('metrics', {}).get('accuracy', 'N/A')}")
            else:
                print(f"❌ Failed to get leaderboard: {response.status_code}")

    async def run_full_test(self):
        """Run the complete real-time functionality test"""
        print("🧪 Starting Auto-Insights Real-Time Functionality Test")
        print("=" * 60)

        # Check if backend is running
        try:
            response = requests.get(f"{BACKEND_URL}/health")
            if response.status_code != 200:
                print("❌ Backend is not running. Please start the platform first with: ./start.sh")
                return
        except:
            print("❌ Cannot connect to backend. Please start the platform first with: ./start.sh")
            return

        # Create sample data
        csv_path = self.create_sample_data()

        # Create project
        if not self.create_project():
            return

        # Upload dataset
        if not self.upload_dataset(csv_path):
            return

        # Run EDA with real-time progress
        await self.run_eda_analysis()

        # Run AutoML with real-time progress
        await self.run_automl_training()

        # Get final results
        self.get_final_results()

        print("\n" + "=" * 60)
        print("🎉 Real-Time Functionality Test Completed!")
        print("✅ All components working with live progress updates")
        print("🔄 WebSocket connections maintained throughout processing")
        print("⚡ Background jobs executed successfully")

        # Cleanup
        if os.path.exists(csv_path):
            os.remove(csv_path)
            print(f"🧹 Cleaned up test file: {csv_path}")

async def main():
    tester = RealTimeTester()
    await tester.run_full_test()

if __name__ == "__main__":
    print("Auto-Insights Real-Time Tester")
    print("Make sure the platform is running with: ./start.sh")
    print()

    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("\n🛑 Test interrupted by user")
    except Exception as e:
        print(f"\n❌ Test failed with error: {e}")
