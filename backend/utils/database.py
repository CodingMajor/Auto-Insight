from sqlalchemy import create_engine, Column, String, Integer, DateTime, Text, Float
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from datetime import datetime
import os
from dotenv import load_dotenv

load_dotenv()

# Database configuration
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./auto_insights.db")

engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# Database models
class Project(Base):
    __tablename__ = "projects"
    
    id = Column(String, primary_key=True, index=True)
    name = Column(String, index=True)
    description = Column(Text)
    problem_type = Column(String)
    target_column = Column(String)
    success_criteria = Column(Text)
    status = Column(String, default="created")
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class Dataset(Base):
    __tablename__ = "datasets"
    
    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, index=True)
    filename = Column(String)
    file_path = Column(String)
    rows = Column(Integer)
    columns = Column(Integer)
    size_bytes = Column(Integer)
    upload_date = Column(DateTime, default=datetime.utcnow)

class Model(Base):
    __tablename__ = "models"
    
    id = Column(String, primary_key=True, index=True)
    project_id = Column(String, index=True)
    dataset_id = Column(String)
    name = Column(String)
    algorithm = Column(String)
    metrics = Column(Text)  # JSON string
    status = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
