import os
import shutil
from pathlib import Path
from typing import Optional
from fastapi import UploadFile
import hashlib
import uuid

class FileHandler:
    """Handle file operations for the platform"""
    
    def __init__(self, base_path: str = "data"):
        self.base_path = Path(base_path)
        self.base_path.mkdir(exist_ok=True)
    
    async def save_uploaded_file(
        self, 
        file: UploadFile, 
        project_id: str, 
        dataset_id: str
    ) -> str:
        """Save uploaded file to storage"""
        
        # Create project directory
        project_dir = self.base_path / project_id
        project_dir.mkdir(exist_ok=True)
        
        # Generate file path
        file_extension = Path(file.filename).suffix
        file_path = project_dir / f"{dataset_id}{file_extension}"
        
        # Save file
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        return str(file_path)
    
    def get_file_hash(self, file_path: str) -> str:
        """Calculate SHA256 hash of file"""
        hash_sha256 = hashlib.sha256()
        with open(file_path, "rb") as f:
            for chunk in iter(lambda: f.read(4096), b""):
                hash_sha256.update(chunk)
        return hash_sha256.hexdigest()
    
    def delete_file(self, file_path: str) -> bool:
        """Delete file from storage"""
        try:
            os.remove(file_path)
            return True
        except:
            return False
