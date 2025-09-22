from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from fastapi import FastAPI, Response
import time

# Prometheus metrics
REQUEST_COUNT = Counter('http_requests_total', 'Total HTTP requests', ['method', 'endpoint'])
REQUEST_DURATION = Histogram('http_request_duration_seconds', 'HTTP request duration')
ACTIVE_MODELS = Gauge('active_models_total', 'Number of active models')
TRAINING_JOBS = Gauge('training_jobs_active', 'Number of active training jobs')

def setup_prometheus_metrics(app: FastAPI):
    """Setup Prometheus metrics for FastAPI app"""
    
    @app.middleware("http")
    async def add_prometheus_middleware(request, call_next):
        start_time = time.time()
        
        response = await call_next(request)
        
        # Record metrics
        REQUEST_COUNT.labels(
            method=request.method, 
            endpoint=request.url.path
        ).inc()
        
        REQUEST_DURATION.observe(time.time() - start_time)
        
        return response
    
    return app
