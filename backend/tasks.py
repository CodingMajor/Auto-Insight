from celery import shared_task
from celery.utils.log import get_task_logger
from .celery_app import celery_app
from .ml.eda import EDAAnalyzer
from .ml.automl import AutoMLPipeline
from .ml.preprocessing import PreprocessingPipeline
from .ml.explainability import ExplainabilityEngine
from .ml.gemini_integration import GeminiExplainer
from .utils.file_handler import FileHandler
import redis
import json
from datetime import datetime
import traceback

logger = get_task_logger(__name__)

# Redis client for status updates
redis_client = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    decode_responses=True
)

def update_job_status(job_id: str, status: str, progress: float = 0, message: str = "", data: dict = None):
    """Update job status in Redis"""
    status_data = {
        "job_id": job_id,
        "status": status,
        "progress": progress,
        "message": message,
        "timestamp": datetime.now().isoformat(),
        "data": data or {}
    }
    redis_client.setex(f"job:{job_id}", 3600, json.dumps(status_data))  # 1 hour expiry
    logger.info(f"Job {job_id} status updated: {status} ({progress}%)")

def get_job_status(job_id: str) -> dict:
    """Get job status from Redis"""
    status_data = redis_client.get(f"job:{job_id}")
    if status_data:
        return json.loads(status_data)
    return {"status": "not_found"}

@shared_task(bind=True)
def run_eda_analysis_task(self, project_id: str, dataset_id: str, target_column: str = None):
    """Background task for EDA analysis with real-time progress"""
    job_id = self.request.id

    try:
        update_job_status(job_id, "started", 0, "Initializing EDA analysis...")

        # Initialize EDA analyzer
        eda_analyzer = EDAAnalyzer()

        update_job_status(job_id, "running", 5, "Loading dataset...")

        # Load dataset
        df = eda_analyzer._load_dataset(project_id, dataset_id)

        update_job_status(job_id, "running", 10, "Starting comprehensive EDA analysis...")

        # Initialize results structure
        analysis_results = {
            "project_id": project_id,
            "dataset_id": dataset_id,
            "target_column": target_column,
            "timestamp": datetime.now().isoformat(),
            "steps": {},
            "job_id": job_id
        }

        # Step 1: Global Dataset Summary
        update_job_status(job_id, "running", 15, "Step 1/11: Analyzing global dataset summary...")
        analysis_results["steps"]["1_global_summary"] = eda_analyzer._step_1_global_summary(df)

        # Step 2: Target Analysis
        if target_column and target_column in df.columns:
            update_job_status(job_id, "running", 20, "Step 2/11: Analyzing target variable...")
            analysis_results["steps"]["2_target_analysis"] = eda_analyzer._step_2_target_analysis(df, target_column)

        # Step 3: Univariate Analysis - Numeric
        update_job_status(job_id, "running", 30, "Step 3/11: Analyzing numeric variables...")
        analysis_results["steps"]["3_univariate_numeric"] = eda_analyzer._step_3_univariate_numeric(df)

        # Step 4: Univariate Analysis - Categorical
        update_job_status(job_id, "running", 40, "Step 4/11: Analyzing categorical variables...")
        analysis_results["steps"]["4_univariate_categorical"] = eda_analyzer._step_4_univariate_categorical(df)

        # Step 5: Missing Data Analysis
        update_job_status(job_id, "running", 50, "Step 5/11: Analyzing missing data patterns...")
        analysis_results["steps"]["5_missing_data"] = eda_analyzer._step_5_missing_data_analysis(df)

        # Step 6: Outlier Detection
        update_job_status(job_id, "running", 60, "Step 6/11: Detecting outliers...")
        analysis_results["steps"]["6_outlier_detection"] = eda_analyzer._step_6_outlier_detection(df)

        # Step 7: Bivariate Analysis
        update_job_status(job_id, "running", 70, "Step 7/11: Performing bivariate analysis...")
        analysis_results["steps"]["7_bivariate_analysis"] = eda_analyzer._step_7_bivariate_analysis(df, target_column)

        # Step 8: Correlation Analysis & VIF
        update_job_status(job_id, "running", 80, "Step 8/11: Analyzing correlations and multicollinearity...")
        analysis_results["steps"]["8_correlation_vif"] = eda_analyzer._step_8_correlation_vif(df)

        # Step 9: Temporal Analysis
        update_job_status(job_id, "running", 85, "Step 9/11: Analyzing temporal patterns...")
        analysis_results["steps"]["9_temporal_analysis"] = eda_analyzer._step_9_temporal_analysis(df)

        # Step 10: Text/Image Preview
        update_job_status(job_id, "running", 90, "Step 10/11: Previewing text and image data...")
        analysis_results["steps"]["10_text_image_preview"] = eda_analyzer._step_10_text_image_preview(df)

        # Step 11: Bias and PII Detection
        update_job_status(job_id, "running", 95, "Step 11/11: Detecting bias and PII...")
        analysis_results["steps"]["11_bias_pii_detection"] = eda_analyzer._step_11_bias_pii_detection(df)

        # Generate summary and recommendations
        update_job_status(job_id, "running", 98, "Generating analysis summary and recommendations...")
        analysis_results["summary"] = eda_analyzer._generate_summary(analysis_results["steps"])
        analysis_results["recommendations"] = eda_analyzer._generate_recommendations(analysis_results["steps"])

        # Save results
        eda_analyzer._save_analysis_results(project_id, dataset_id, analysis_results)

        update_job_status(job_id, "completed", 100, "EDA analysis completed successfully!", {
            "project_id": project_id,
            "dataset_id": dataset_id,
            "total_steps": 11
        })

        return analysis_results

    except Exception as e:
        error_msg = f"EDA analysis failed: {str(e)}"
        logger.error(f"Job {job_id} failed: {error_msg}")
        logger.error(traceback.format_exc())
        update_job_status(job_id, "failed", 0, error_msg)
        raise self.retry(countdown=60, exc=e)

@shared_task(bind=True)
def train_automl_models_task(self, project_id: str, dataset_id: str, target_column: str,
                           problem_type: str, time_budget: int = 300, metric: str = None):
    """Background task for AutoML training with real-time progress"""
    job_id = self.request.id

    try:
        update_job_status(job_id, "started", 0, "Initializing AutoML training...")

        # Initialize AutoML pipeline
        automl_pipeline = AutoMLPipeline()

        update_job_status(job_id, "running", 5, "Loading and preparing dataset...")

        # Load and prepare data
        df = automl_pipeline._load_dataset(project_id, dataset_id)
        X, y = automl_pipeline._prepare_data(df, target_column)

        update_job_status(job_id, "running", 15, "Splitting data into train/test sets...")

        # Split data
        X_train, X_test, y_train, y_test = automl_pipeline._prepare_data(df, target_column)

        update_job_status(job_id, "running", 20, f"Starting AutoML training for {time_budget} seconds...")

        # Configure AutoML
        automl = AutoML()

        if not metric:
            metric = 'accuracy' if problem_type == 'classification' else 'r2'

        update_job_status(job_id, "running", 25, f"Training models with {metric} metric...")

        # Train models (this will take most of the time)
        automl.fit(
            X_train, y_train,
            task=problem_type,
            metric=metric,
            time_budget=time_budget,
            verbose=0
        )

        update_job_status(job_id, "running", 80, "Evaluating models on test set...")

        # Evaluate on test set
        y_pred = automl.predict(X_test)

        if problem_type == 'classification':
            metrics = automl_pipeline._calculate_classification_metrics(y_test, y_pred, automl.predict_proba(X_test))
        else:
            metrics = automl_pipeline._calculate_regression_metrics(y_test, y_pred)

        update_job_status(job_id, "running", 90, "Saving trained model and results...")

        # Save model and results
        model_id = automl_pipeline._save_model_and_results(
            project_id, dataset_id, target_column, problem_type,
            automl, metrics, time_budget, X.columns
        )

        update_job_status(job_id, "completed", 100, "AutoML training completed successfully!", {
            "project_id": project_id,
            "model_id": model_id,
            "best_score": metrics.get('accuracy', metrics.get('r2_score', 0)),
            "training_time": time_budget
        })

        return {
            "model_id": model_id,
            "metrics": metrics,
            "project_id": project_id
        }

    except Exception as e:
        error_msg = f"AutoML training failed: {str(e)}"
        logger.error(f"Job {job_id} failed: {error_msg}")
        logger.error(traceback.format_exc())
        update_job_status(job_id, "failed", 0, error_msg)
        raise self.retry(countdown=60, exc=e)

@shared_task(bind=True)
def preprocess_data_task(self, project_id: str, dataset_id: str, config: dict):
    """Background task for data preprocessing with real-time progress"""
    job_id = self.request.id

    try:
        update_job_status(job_id, "started", 0, "Initializing data preprocessing...")

        preprocessing_pipeline = PreprocessingPipeline()

        update_job_status(job_id, "running", 20, "Loading dataset...")

        df = preprocessing_pipeline._load_dataset(project_id, dataset_id)

        update_job_status(job_id, "running", 40, "Creating preprocessing pipeline...")

        pipeline_config = preprocessing_pipeline.create_pipeline(project_id, dataset_id, config)

        update_job_status(job_id, "running", 80, "Applying preprocessing transformations...")

        # Apply preprocessing
        transformed_data = preprocessing_pipeline._apply_preprocessing(project_id, dataset_id)

        update_job_status(job_id, "completed", 100, "Data preprocessing completed successfully!", {
            "project_id": project_id,
            "dataset_id": dataset_id,
            "transformations_applied": len(config)
        })

        return pipeline_config

    except Exception as e:
        error_msg = f"Data preprocessing failed: {str(e)}"
        logger.error(f"Job {job_id} failed: {error_msg}")
        update_job_status(job_id, "failed", 0, error_msg)
        raise self.retry(countdown=60, exc=e)
