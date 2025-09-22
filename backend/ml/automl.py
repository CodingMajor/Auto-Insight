import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional, Tuple
import json
from pathlib import Path
import pickle
from datetime import datetime
import uuid

from flaml import AutoML
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, roc_auc_score
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import lightgbm as lgb
import xgboost as xgb
from sklearn.ensemble import RandomForestClassifier, RandomForestRegressor
from sklearn.linear_model import LogisticRegression, LinearRegression

class AutoMLPipeline:
    """AutoML pipeline using FLAML for automated machine learning"""
    
    def __init__(self):
        self.models = {}
        self.training_status = {}
        self.leaderboards = {}
    
    def train_models(
        self,
        project_id: str,
        dataset_id: str,
        target_column: str,
        problem_type: str,
        time_budget: int = 300,
        metric: Optional[str] = None
    ) -> Dict[str, Any]:
        """Train AutoML models"""
        
        try:
            # Update status
            self.training_status[project_id] = {
                "status": "training",
                "start_time": datetime.now().isoformat(),
                "progress": 0
            }
            
            # Load and prepare data
            df = self._load_dataset(project_id, dataset_id)
            X, y = self._prepare_data(df, target_column)
            
            # Split data
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42, stratify=y if problem_type == 'classification' else None
            )
            
            # Configure AutoML
            automl = AutoML()
            
            # Set default metrics
            if not metric:
                metric = 'accuracy' if problem_type == 'classification' else 'r2'
            
            # Train models
            automl.fit(
                X_train, y_train,
                task=problem_type,
                metric=metric,
                time_budget=time_budget,
                verbose=0
            )
            
            # Evaluate on test set
            y_pred = automl.predict(X_test)
            
            # Calculate metrics
            if problem_type == 'classification':
                metrics = self._calculate_classification_metrics(y_test, y_pred, automl.predict_proba(X_test))
            else:
                metrics = self._calculate_regression_metrics(y_test, y_pred)
            
            # Save model and results
            model_id = self._save_model_and_results(
                project_id, dataset_id, target_column, problem_type,
                automl, metrics, time_budget, X.columns
            )
            
            # Update status
            self.training_status[project_id] = {
                "status": "completed",
                "end_time": datetime.now().isoformat(),
                "model_id": model_id,
                "progress": 100
            }
        except Exception as e:
            self.training_status[project_id] = {
                "status": "failed",
                "error": str(e),
                "end_time": datetime.now().isoformat()
            }
            raise e
    
        return {
            "model_id": model_id,
            "metrics": metrics,
            "project_id": project_id
        }
    
    def _save_model_and_results(self, project_id: str, dataset_id: str, target_column: str, 
                              problem_type: str, automl, metrics: dict, time_budget: int, 
                              feature_names) -> str:
        """Save model and results - called from background task"""
        model_id = str(uuid.uuid4())
        model_info = {
            "model_id": model_id,
            "project_id": project_id,
            "dataset_id": dataset_id,
            "target_column": target_column,
            "problem_type": problem_type,
            "best_estimator": str(automl.best_estimator),
            "best_config": automl.best_config,
            "metrics": metrics,
            "feature_importance": self._get_feature_importance(automl, feature_names),
            "training_time": time_budget,
            "created_at": datetime.now().isoformat()
        }
        
        # Save model
        self.models[model_id] = {
            "automl": automl,
            "info": model_info
        }
        
        # Update leaderboard
        if project_id not in self.leaderboards:
            self.leaderboards[project_id] = []
        self.leaderboards[project_id].append(model_info)
        
        return model_id
    
    def _load_dataset(self, project_id: str, dataset_id: str) -> pd.DataFrame:
        """Load dataset from storage"""
        file_path = f"data/{project_id}/{dataset_id}.csv"
        return pd.read_csv(file_path)
    
    def _prepare_data(self, df: pd.DataFrame, target_column: str) -> Tuple[pd.DataFrame, pd.Series]:
        """Prepare data for training"""
        # Basic preprocessing
        df_clean = df.dropna(subset=[target_column])
        
        X = df_clean.drop(columns=[target_column])
        y = df_clean[target_column]
        
        # Handle categorical variables (simple label encoding)
        for col in X.select_dtypes(include=['object']).columns:
            X[col] = pd.Categorical(X[col]).codes
        
        return X, y
    
    def _calculate_classification_metrics(self, y_true, y_pred, y_proba=None) -> Dict[str, float]:
        """Calculate classification metrics"""
        metrics = {
            "accuracy": accuracy_score(y_true, y_pred),
            "precision": precision_score(y_true, y_pred, average='weighted'),
            "recall": recall_score(y_true, y_pred, average='weighted'),
            "f1_score": f1_score(y_true, y_pred, average='weighted')
        }
        
        if y_proba is not None and len(np.unique(y_true)) == 2:
            metrics["roc_auc"] = roc_auc_score(y_true, y_proba[:, 1])
        
        return metrics
    
    def _calculate_regression_metrics(self, y_true, y_pred) -> Dict[str, float]:
        """Calculate regression metrics"""
        return {
            "r2_score": r2_score(y_true, y_pred),
            "mean_squared_error": mean_squared_error(y_true, y_pred),
            "mean_absolute_error": mean_absolute_error(y_true, y_pred),
            "root_mean_squared_error": np.sqrt(mean_squared_error(y_true, y_pred))
        }
    
    def _get_feature_importance(self, automl, feature_names) -> Dict[str, float]:
        """Get feature importance from trained model"""
        try:
            if hasattr(automl.best_estimator, 'feature_importances_'):
                importance = automl.best_estimator.feature_importances_
                return dict(zip(feature_names, importance))
            else:
                return {}
        except:
            return {}
    
    def get_training_status(self, project_id: str) -> Dict[str, Any]:
        """Get training status"""
        return self.training_status.get(project_id, {"status": "not_found"})
    
    def get_leaderboard(self, project_id: str) -> List[Dict[str, Any]]:
        """Get model leaderboard"""
        return self.leaderboards.get(project_id, [])
    
    def export_model(self, project_id: str, model_id: str, format: str = "pickle") -> str:
        """Export trained model"""
        if model_id not in self.models:
            raise ValueError(f"Model {model_id} not found")
        
        model_data = self.models[model_id]
        export_path = f"exports/{project_id}/{model_id}.{format}"
        
        Path(export_path).parent.mkdir(parents=True, exist_ok=True)
        
        if format == "pickle":
            with open(export_path, 'wb') as f:
                pickle.dump(model_data["automl"], f)
        
        return export_path
