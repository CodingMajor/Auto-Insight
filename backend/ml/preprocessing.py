import pandas as pd
import numpy as np
from typing import Dict, Any, List, Optional
from sklearn.preprocessing import StandardScaler, MinMaxScaler, LabelEncoder, OneHotEncoder
from sklearn.impute import SimpleImputer, KNNImputer
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
import json

class PreprocessingPipeline:
    """Preprocessing pipeline for data preparation"""
    
    def __init__(self):
        self.pipelines = {}
    
    def create_pipeline(self, project_id: str, dataset_id: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Create preprocessing pipeline based on configuration"""
        
        # Load dataset
        df = self._load_dataset(project_id, dataset_id)
        
        # Identify column types
        numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
        categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
        
        # Create transformers based on config
        numeric_transformer = self._create_numeric_transformer(config.get('numeric', {}))
        categorical_transformer = self._create_categorical_transformer(config.get('categorical', {}))
        
        # Create column transformer
        preprocessor = ColumnTransformer(
            transformers=[
                ('num', numeric_transformer, numeric_cols),
                ('cat', categorical_transformer, categorical_cols)
            ]
        )
        
        # Store pipeline
        pipeline_id = f"{project_id}_{dataset_id}"
        self.pipelines[pipeline_id] = {
            "preprocessor": preprocessor,
            "config": config,
            "numeric_cols": numeric_cols,
            "categorical_cols": categorical_cols
        }
        
        return {
            "pipeline_id": pipeline_id,
            "numeric_columns": numeric_cols,
            "categorical_columns": categorical_cols,
            "config": config
        }
    
    def _create_numeric_transformer(self, config: Dict[str, Any]) -> Pipeline:
        """Create numeric preprocessing pipeline"""
        steps = []
        
        # Imputation
        imputation_strategy = config.get('imputation', 'mean')
        if imputation_strategy == 'knn':
            steps.append(('imputer', KNNImputer(n_neighbors=5)))
        else:
            steps.append(('imputer', SimpleImputer(strategy=imputation_strategy)))
        
        # Scaling
        scaling_method = config.get('scaling', 'standard')
        if scaling_method == 'standard':
            steps.append(('scaler', StandardScaler()))
        elif scaling_method == 'minmax':
            steps.append(('scaler', MinMaxScaler()))
        
        return Pipeline(steps)
    
    def _create_categorical_transformer(self, config: Dict[str, Any]) -> Pipeline:
        """Create categorical preprocessing pipeline"""
        steps = []
        
        # Imputation
        imputation_strategy = config.get('imputation', 'most_frequent')
        steps.append(('imputer', SimpleImputer(strategy=imputation_strategy)))
        
        # Encoding
        encoding_method = config.get('encoding', 'onehot')
        if encoding_method == 'onehot':
            steps.append(('encoder', OneHotEncoder(drop='first', sparse=False)))
        elif encoding_method == 'label':
            steps.append(('encoder', LabelEncoder()))
        
        return Pipeline(steps)
    
    def preview_transformations(self, project_id: str, dataset_id: str, config: Dict[str, Any]) -> Dict[str, Any]:
        """Preview preprocessing transformations"""
        
        df = self._load_dataset(project_id, dataset_id)
        sample_df = df.head(100)  # Use sample for preview
        
        # Create temporary pipeline
        pipeline_config = self.create_pipeline(project_id, dataset_id, config)
        pipeline_id = pipeline_config["pipeline_id"]
        
        # Apply transformations
        preprocessor = self.pipelines[pipeline_id]["preprocessor"]
        transformed_sample = preprocessor.fit_transform(sample_df)
        
        return {
            "original_shape": sample_df.shape,
            "transformed_shape": transformed_sample.shape,
            "original_sample": sample_df.head(5).to_dict('records'),
            "transformation_summary": {
                "numeric_transformations": config.get('numeric', {}),
                "categorical_transformations": config.get('categorical', {})
            }
        }
    
    def export_pipeline(self, project_id: str) -> Dict[str, Any]:
        """Export preprocessing pipeline configuration"""
        pipeline_id = f"{project_id}_*"  # Simplified for demo
        
        # Return pipeline configuration
        return {
            "pipeline_config": "exported_config",
            "format": "sklearn_pipeline"
        }
    
    def _apply_preprocessing(self, project_id: str, dataset_id: str) -> Dict[str, Any]:
        """Apply preprocessing transformations"""
        df = self._load_dataset(project_id, dataset_id)
        pipeline_id = f"{project_id}_{dataset_id}"
        
        if pipeline_id not in self.pipelines:
            raise ValueError(f"Pipeline not found for {pipeline_id}")
        
        preprocessor = self.pipelines[pipeline_id]["preprocessor"]
        transformed = preprocessor.fit_transform(df)
        
        return {
            "original_shape": df.shape,
            "transformed_shape": transformed.shape,
            "pipeline_id": pipeline_id
        }
    
    def _load_dataset(self, project_id: str, dataset_id: str) -> pd.DataFrame:
        """Load dataset from storage"""
        file_path = f"data/{project_id}/{dataset_id}.csv"
        return pd.read_csv(file_path)
