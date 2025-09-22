from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Depends, BackgroundTasks, Response, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import pandas as pd
import numpy as np
import io
import json
from datetime import datetime, timedelta
import os
from typing import Optional, Dict, Any, List
import random
import os
import pandas as pd
import numpy as np
from datetime import datetime
import json
from pydantic import BaseModel
import uuid
from pathlib import Path
import asyncio
from concurrent.futures import ThreadPoolExecutor
import redis

from .ml.eda import EDAAnalyzer
from .ml.preprocessing import PreprocessingPipeline
from .ml.automl import AutoMLPipeline
from .ml.explainability import ExplainabilityEngine
from .ml.gemini_integration import GeminiExplainer
from .utils.file_handler import FileHandler
from .utils.database import get_db, Project, Dataset
from .utils.monitoring import setup_prometheus_metrics
from .tasks import run_eda_analysis_task, train_automl_models_task, preprocess_data_task, update_job_status, get_job_status
from .celery_app import celery_app

# Initialize FastAPI app
app = FastAPI(
    title="Auto-Insights Platform",
    description="AI-powered data analysis and machine learning platform",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize components
file_handler = FileHandler()
eda_analyzer = EDAAnalyzer()
preprocessing_pipeline = PreprocessingPipeline()
automl_pipeline = AutoMLPipeline()
explainability_engine = ExplainabilityEngine()
gemini_explainer = GeminiExplainer()

# Redis client for WebSocket updates
redis_client = redis.Redis(host='localhost', port=6379, db=0, decode_responses=True)

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, job_id: str):
        await websocket.accept()
        if job_id not in self.active_connections:
            self.active_connections[job_id] = []
        self.active_connections[job_id].append(websocket)

    def disconnect(self, websocket: WebSocket, job_id: str):
        if job_id in self.active_connections:
            self.active_connections[job_id].remove(websocket)
            if not self.active_connections[job_id]:
                del self.active_connections[job_id]

    async def broadcast_to_job(self, job_id: str, message: dict):
        if job_id in self.active_connections:
            for connection in self.active_connections[job_id]:
                try:
                    await connection.send_json(message)
                except:
                    self.disconnect(connection, job_id)

manager = ConnectionManager()

# Setup monitoring
setup_prometheus_metrics(app)

# WebSocket endpoint for real-time job progress
@app.websocket("/ws/job/{job_id}")
async def websocket_job_progress(websocket: WebSocket, job_id: str):
    """WebSocket endpoint for real-time job progress updates"""
    await manager.connect(websocket, job_id)
    try:
        while True:
            # Check for updates in Redis
            status_data = get_job_status(job_id)

            if status_data and status_data.get("status") != "not_found":
                await websocket.send_json(status_data)

                # If job is completed or failed, we can close the connection
                if status_data.get("status") in ["completed", "failed"]:
                    break

            # Wait before checking again
            await asyncio.sleep(1)

    except WebSocketDisconnect:
        manager.disconnect(websocket, job_id)
    except Exception as e:
        manager.disconnect(websocket, job_id)

# Pydantic models
class ProjectCreate(BaseModel):
    name: str
    description: Optional[str] = None
    problem_type: str  # classification, regression, forecasting, cv, nlp
    target_column: Optional[str] = None
    success_criteria: Optional[str] = None

class ProjectResponse(BaseModel):
    id: str
    name: str
    description: Optional[str]
    problem_type: str
    target_column: Optional[str]
    created_at: datetime
    status: str

class EDARequest(BaseModel):
    project_id: str
    dataset_id: str
    target_column: Optional[str] = None

class PreprocessingRequest(BaseModel):
    project_id: str
    dataset_id: str
    config: Dict[str, Any]

class AutoMLRequest(BaseModel):
    project_id: str
    dataset_id: str
    target_column: str
    problem_type: str
    time_budget: Optional[int] = 300
    metric: Optional[str] = None

class ExplainRequest(BaseModel):
    project_id: str
    model_id: str
    sample_data: Optional[Dict[str, Any]] = None

# Health check endpoint
@app.get("/health")
async def health_check():
    return {"status": "healthy", "timestamp": datetime.now()}

# Metrics endpoint for Prometheus
@app.get("/metrics")
async def metrics():
    from prometheus_client import generate_latest, CONTENT_TYPE_LATEST
    return Response(generate_latest(), media_type=CONTENT_TYPE_LATEST)

# Project management endpoints
@app.post("/api/projects", response_model=ProjectResponse)
async def create_project(project: ProjectCreate, db=Depends(get_db)):
    """Create a new project"""
    try:
        project_id = str(uuid.uuid4())
        db_project = Project(
            id=project_id,
            name=project.name,
            description=project.description,
            problem_type=project.problem_type,
            target_column=project.target_column,
            success_criteria=project.success_criteria,
            status="created"
        )
        db.add(db_project)
        db.commit()
        
        return ProjectResponse(
            id=project_id,
            name=project.name,
            description=project.description,
            problem_type=project.problem_type,
            target_column=project.target_column,
            created_at=datetime.now(),
            status="created"
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/projects")
async def list_projects(db=Depends(get_db)):
    """List all projects"""
    projects = db.query(Project).all()
    return [
        ProjectResponse(
            id=p.id,
            name=p.name,
            description=p.description,
            problem_type=p.problem_type,
            target_column=p.target_column,
            created_at=p.created_at,
            status=p.status
        ) for p in projects
    ]

@app.get("/api/projects/{project_id}")
async def get_project(project_id: str, db=Depends(get_db)):
    """Get project details"""
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    return ProjectResponse(
        id=project.id,
        name=project.name,
        description=project.description,
        problem_type=project.problem_type,
        target_column=project.target_column,
        created_at=project.created_at,
        status=project.status
    )

# Data upload and management
@app.post("/api/projects/{project_id}/upload")
async def upload_dataset(
    project_id: str,
    file: UploadFile = File(...),
    db=Depends(get_db)
):
    """Upload dataset to project"""
    try:
        # Validate project exists
        project = db.query(Project).filter(Project.id == project_id).first()
        if not project:
            raise HTTPException(status_code=404, detail="Project not found")
        
        # Save file and process
        dataset_id = str(uuid.uuid4())
        file_path = await file_handler.save_uploaded_file(file, project_id, dataset_id)
        
        # Load and validate data
        df = pd.read_csv(file_path)
        
        # Store dataset metadata
        dataset = Dataset(
            id=dataset_id,
            project_id=project_id,
            filename=file.filename,
            file_path=file_path,
            rows=len(df),
            columns=len(df.columns),
            size_bytes=file.size,
            upload_date=datetime.now()
        )
        db.add(dataset)
        db.commit()
        
        return {
            "dataset_id": dataset_id,
            "filename": file.filename,
            "rows": len(df),
            "columns": len(df.columns),
            "column_names": df.columns.tolist(),
            "data_types": df.dtypes.astype(str).to_dict(),
            "sample_data": df.head().to_dict('records')
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# EDA endpoints
@app.post("/api/eda/analyze")
async def run_eda_analysis(request: EDARequest):
    """Start real-time EDA analysis"""
    try:
        # Submit task to Celery
        task = run_eda_analysis_task.delay(
            request.project_id,
            request.dataset_id,
            request.target_column
        )

        return {
            "job_id": task.id,
            "message": "EDA analysis started with real-time progress tracking",
            "project_id": request.project_id,
            "dataset_id": request.dataset_id,
            "status": "running",
            "websocket_url": f"ws://localhost:8000/ws/job/{task.id}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/eda/{project_id}/{dataset_id}/status")
async def get_eda_status(project_id: str, dataset_id: str):
    """Get EDA analysis status"""
    try:
        status = eda_analyzer.get_analysis_status(project_id, dataset_id)
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/eda/{project_id}/{dataset_id}/report")
async def get_eda_report(project_id: str, dataset_id: str):
    """Get EDA analysis report"""
    try:
        report = eda_analyzer.get_analysis_report(project_id, dataset_id)
        if not report:
            raise HTTPException(status_code=404, detail="EDA report not found")
        return report
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Preprocessing endpoints
@app.post("/api/preprocessing/configure")
async def configure_preprocessing(request: PreprocessingRequest):
    """Configure preprocessing pipeline"""
    try:
        pipeline_config = preprocessing_pipeline.create_pipeline(
            request.project_id,
            request.dataset_id,
            request.config
        )
        return pipeline_config
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/preprocessing/preview")
async def preview_preprocessing(request: PreprocessingRequest):
    """Preview preprocessing transformations"""
    try:
        preview = preprocessing_pipeline.preview_transformations(
            request.project_id,
            request.dataset_id,
            request.config
        )
        return preview
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# AutoML endpoints
@app.post("/api/automl/train")
async def train_automl_models(request: AutoMLRequest):
    """Start real-time AutoML training"""
    try:
        # Submit task to Celery
        task = train_automl_models_task.delay(
            request.project_id,
            request.dataset_id,
            request.target_column,
            request.problem_type,
            request.time_budget,
            request.metric
        )

        return {
            "job_id": task.id,
            "message": "AutoML training started with real-time progress tracking",
            "project_id": request.project_id,
            "dataset_id": request.dataset_id,
            "status": "training",
            "estimated_time": f"{request.time_budget}s",
            "websocket_url": f"ws://localhost:8000/ws/job/{task.id}"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/automl/{project_id}/status")
async def get_automl_status(project_id: str):
    """Get AutoML training status"""
    try:
        status = automl_pipeline.get_training_status(project_id)
        return status
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/automl/{project_id}/leaderboard")
async def get_model_leaderboard(project_id: str):
    """Get model leaderboard"""
    try:
        leaderboard = automl_pipeline.get_leaderboard(project_id)
        return leaderboard
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Explainability endpoints
@app.post("/api/explain/generate")
async def generate_explanations(request: ExplainRequest):
    """Generate model explanations"""
    try:
        explanations = explainability_engine.generate_explanations(
            request.project_id,
            request.model_id,
            request.sample_data
        )
        
        # Generate natural language explanations using Gemini
        nl_explanations = await gemini_explainer.generate_explanations(
            explanations,
            request.sample_data
        )
        
        return {
            "technical_explanations": explanations,
            "natural_language": nl_explanations
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Export endpoints
@app.get("/api/export/{project_id}/model/{model_id}")
async def export_model(project_id: str, model_id: str, format: str = "pickle"):
    """Export trained model"""
    try:
        export_path = automl_pipeline.export_model(project_id, model_id, format)
        return {"export_path": export_path, "format": format}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/export/{project_id}/pipeline")
async def export_pipeline(project_id: str):
    """Export preprocessing pipeline"""
    try:
        pipeline_config = preprocessing_pipeline.export_pipeline(project_id)
        return pipeline_config
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Dashboard API endpoints
@app.get("/api/dashboard/stats")
async def get_dashboard_stats():
    """Get real-time dashboard statistics"""
    try:
        # Generate dynamic stats with some randomness for demo
        base_projects = 6
        base_analyses = 3
        base_insights = 24
        base_data = 2.4
        
        # Add some variation to simulate real-time changes
        variation = random.uniform(0.9, 1.1)
        
        return {
            "totalProjects": int(base_projects * variation),
            "activeAnalyses": int(base_analyses * variation),
            "completedInsights": int(base_insights * variation),
            "dataProcessed": f"{base_data * variation:.1f} GB"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/dashboard/activity")
async def get_recent_activity():
    """Get recent activity feed"""
    try:
        # Generate dynamic activity data
        activities = [
            {
                "id": "1",
                "title": "Customer Churn Analysis Complete",
                "description": f"Identified key factors contributing to customer churn with {random.randint(85, 95)}% accuracy",
                "type": "analysis",
                "timestamp": (datetime.now() - timedelta(hours=random.randint(1, 3))).isoformat(),
                "status": "completed",
                "impact": "high"
            },
            {
                "id": "2", 
                "title": "Sales Forecast Updated",
                "description": f"Q4 sales projection shows {random.randint(10, 20)}% increase based on current trends",
                "type": "prediction",
                "timestamp": (datetime.now() - timedelta(hours=random.randint(3, 6))).isoformat(),
                "status": "completed",
                "impact": "medium"
            },
            {
                "id": "3",
                "title": "New Dataset Processing",
                "description": f"Processing customer_data_2024.csv - {random.randint(40, 80)}% complete",
                "type": "upload",
                "timestamp": (datetime.now() - timedelta(minutes=random.randint(15, 45))).isoformat(),
                "status": "processing",
                "impact": "low"
            },
            {
                "id": "4",
                "title": "Anomaly Detection Alert",
                "description": f"Unusual pattern detected in user engagement metrics - {random.randint(15, 25)}% deviation",
                "type": "alert",
                "timestamp": (datetime.now() - timedelta(minutes=random.randint(5, 30))).isoformat(),
                "status": "completed",
                "impact": "high"
            }
        ]
        
        # Return random subset of activities
        return random.sample(activities, random.randint(3, 4))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
