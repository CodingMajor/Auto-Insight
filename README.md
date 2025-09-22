# Auto-Insights Platform 🚀

A cutting-edge **real-time** AI-powered data analysis and machine learning platform that delivers **instant insights** through live progress updates, background processing, and intelligent automation. Built with modern web technologies and enterprise-grade infrastructure.

![Auto-Insights](https://img.shields.io/badge/status-production--ready-brightgreen)
![Python](https://img.shields.io/badge/python-3.11-blue)
![React](https://img.shields.io/badge/react-18.2.0-61DAFB)
![FastAPI](https://img.shields.io/badge/fastapi-0.104.1-009688)
![Docker](https://img.shields.io/badge/docker-ready-2496ED)

<img width="1909" height="892" alt="image" src="https://github.com/user-attachments/assets/61e4c80c-0ceb-4ca6-8d98-87cc63cc10da" />
<img width="1897" height="894" alt="image" src="https://github.com/user-attachments/assets/e355c8c9-7266-42ee-ac3b-8b4808f36b7c" />
<img width="1905" height="901" alt="image" src="https://github.com/user-attachments/assets/be9ec279-7f1c-47d8-a9f0-1b40bb66112d" />
<img width="1892" height="895" alt="image" src="https://github.com/user-attachments/assets/a520d094-5795-4019-b858-ed0dc5013231" />
<img width="1877" height="895" alt="image" src="https://github.com/user-attachments/assets/aeb81c87-d347-477d-b465-2210a9d61771" />
<img width="1873" height="888" alt="image" src="https://github.com/user-attachments/assets/c4f669d4-a3ec-438b-8d68-00db94688e6b" />
<img width="1874" height="889" alt="image" src="https://github.com/user-attachments/assets/d31fb247-105b-4755-8902-105bfdbd49ab" />
<img width="1879" height="888" alt="image" src="https://github.com/user-attachments/assets/51ffa7e2-b0de-4b7e-9e75-8e2a46c6c753" />
<img width="1886" height="879" alt="image" src="https://github.com/user-attachments/assets/60b2b62e-7bbc-479a-a143-d7efd5cb3fb5" />
<img width="1878" height="885" alt="image" src="https://github.com/user-attachments/assets/132ee674-5d19-484c-9c9f-bd58957e52be" />
<img width="1862" height="872" alt="image" src="https://github.com/user-attachments/assets/2f43b5d4-397e-4cdc-8860-50d86eb6cde7" />
<img width="1878" height="886" alt="image" src="https://github.com/user-attachments/assets/e361a93b-dea7-48f0-9ccb-669b0a58fc7b" />
<img width="1889" height="882" alt="image" src="https://github.com/user-attachments/assets/9ee8ee9b-a856-4b0e-98df-cc7ddedd6a97" />

---

## 🌟 Key Features

### 🔴 **Real-Time Processing**
- **Live EDA Analysis**: 11-step comprehensive data analysis with step-by-step progress updates
- **Real-Time AutoML**: Automated machine learning with live training progress and model performance tracking
- **WebSocket Connections**: Instant progress updates and real-time notifications
- **Background Job Processing**: Asynchronous task execution with Celery and Redis
- **Live Progress Tracking**: Detailed progress bars and status updates for all operations

### 🤖 **AI-Powered Intelligence**
- **Automated EDA**: Comprehensive exploratory data analysis with statistical insights
- **Smart AutoML**: Automated model selection and hyperparameter tuning using FLAML
- **Model Explainability**: SHAP, LIME, and permutation importance for model interpretability
- **Gemini AI Integration**: Natural language explanations and business insights
- **Multi-Modal Support**: Tabular, Computer Vision, NLP, and Time Series data

### 🎨 **Modern User Experience**
- **Responsive Web UI**: React + TypeScript + Tailwind CSS with dark/light themes
- **Real-Time Dashboards**: Live metrics, activity monitoring, and interactive visualizations
- **Drag & Drop Interface**: Intuitive file upload and data management
- **Interactive Visualizations**: Plotly.js and Recharts for data exploration
- **Mobile Optimized**: Fully responsive design for all devices

---

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Frontend      │    │    Backend      │    │   Infrastructure│
│   (React + TS)  │◄──►│   (FastAPI)     │◄──►│   (Docker)      │
│                 │    │                 │    │                 │
│ • Real-time UI  │    │ • REST APIs     │    │ • PostgreSQL    │
│ • WebSocket     │    │ • Background     │    │ • Redis         │
│ • Visualizations│    │   Jobs          │    │ • MinIO         │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                              │
                              ▼
                       ┌─────────────────┐
                       │   AI/ML Stack   │
                       │                 │
                       │ • FLAML AutoML  │
                       │ • SHAP/LIME     │
                       │ • Gemini AI     │
                       └─────────────────┘
```

---

## 🛠️ Technology Stack

### **Frontend**
- **Framework**: React 18.2.0 with TypeScript
- **Build Tool**: Vite 4.5.0
- **Styling**: Tailwind CSS 3.3.5
- **Charts**: Plotly.js 2.27.0, Recharts 2.8.0
- **Routing**: React Router DOM 6.20.1
- **State Management**: Zustand 4.4.7
- **UI Components**: Headless UI, Heroicons

### **Backend**
- **Framework**: FastAPI 0.104.1 with async support
- **Server**: Uvicorn with WebSocket support
- **Data Processing**: Pandas 2.1.4, NumPy 1.24.3
- **Machine Learning**: Scikit-learn 1.3.2, FLAML 2.1.1
- **Model Explainability**: SHAP 0.43.0, LIME 0.2.0.1
- **AI Integration**: Google Generative AI 0.3.2
- **Task Queue**: Celery 5.3.4 with Redis 5.0.1
- **WebSockets**: WebSockets 12.0 for real-time updates

### **Infrastructure & DevOps**
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL with SQLAlchemy 2.0.23
- **Object Storage**: MinIO 7.2.0
- **Message Broker**: Redis 7.0 (Alpine)
- **Monitoring**: Prometheus + Grafana
- **Task Monitoring**: Flower (Celery dashboard)
- **Load Balancing**: Nginx (production ready)

---

## 🚀 Quick Start Guide

### **Prerequisites**
- **Docker & Docker Compose** (v20.10+)
- **Git** for version control
- **Google Gemini API Key** for AI explanations

### **Installation & Setup**

1. **Clone the Repository**
   ```bash
   git clone <repository-url>
   cd auto-insights
   ```

2. **Environment Configuration**
   ```bash
   # Copy environment template
   cp .env.example .env

   # Edit .env file with your configuration
   nano .env  # or use your preferred editor
   ```

   **Required Environment Variables:**
   ```env
   # AI Integration
   GEMINI_API_KEY=your_google_gemini_api_key_here

   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/auto_insights

   # Object Storage
   MINIO_ENDPOINT=localhost:9000
   MINIO_ACCESS_KEY=minioadmin
   MINIO_SECRET_KEY=minioadmin

   # Redis
   REDIS_URL=redis://localhost:6379/0
   ```

3. **Launch the Platform**
   ```bash
   # Start all services (recommended)
   ./start.sh

   # Or use Docker Compose directly
   docker-compose up -d
   ```

4. **Verify Installation**
   ```bash
   # Check service status
   docker-compose ps

   # Validate platform functionality
   python validate_platform.py
   ```

5. **Access Applications**
   - **Main Application**: http://localhost:3000
   - **API Documentation**: http://localhost:8000/docs
   - **Interactive API Docs**: http://localhost:8000/redoc
   - **Task Monitoring**: http://localhost:5555
   - **MinIO Console**: http://localhost:9001
   - **Grafana Dashboard**: http://localhost:3001
   - **Prometheus Metrics**: http://localhost:9090

---

## 📊 Real-Time Features Deep Dive

### **Live EDA Analysis**
The platform performs comprehensive exploratory data analysis with real-time progress updates:

1. **Data Loading & Validation** (5%)
2. **Basic Statistics** (15%)
3. **Missing Values Analysis** (25%)
4. **Distribution Analysis** (35%)
5. **Correlation Analysis** (45%)
6. **Feature Importance** (55%)
7. **Outlier Detection** (65%)
8. **Data Quality Report** (75%)
9. **Visualization Generation** (85%)
10. **Summary & Recommendations** (95%)
11. **Complete** (100%)

### **Real-Time AutoML Training**
Automated machine learning with live progress tracking:

- **Algorithm Selection**: Automatic model selection from 20+ algorithms
- **Hyperparameter Tuning**: Intelligent parameter optimization
- **Cross-Validation**: Real-time CV score updates
- **Model Comparison**: Live leaderboard updates
- **Performance Metrics**: Instant accuracy, precision, recall tracking

### **WebSocket Communication**
Real-time updates via WebSocket connections:

```typescript
// Frontend WebSocket integration
const ws = new WebSocket(`ws://localhost:8000/ws/job/${jobId}`);

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  console.log('Progress:', data.progress, '%');
  console.log('Status:', data.status);
  console.log('Message:', data.message);
};
```

---

## 🔧 Development Workflow

### **Frontend Development**
```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linting
npm run lint

# Type checking
npm run type-check
```

### **Backend Development**
```bash
cd backend

# Install Python dependencies
pip install -r requirements.txt

# Start development server
uvicorn main:app --reload --host 0.0.0.0 --port 8000

# Run with background task support
celery -A celery_app.celery_app worker --loglevel=info

# Run Redis for local development
redis-server
```

### **Full Development Stack**
```bash
# Terminal 1: Frontend
cd frontend && npm run dev

# Terminal 2: Backend
cd backend && uvicorn main:app --reload

# Terminal 3: Redis
redis-server

# Terminal 4: Celery Worker
cd backend && celery -A celery_app.celery_app worker --loglevel=info
```

---

## 🧪 Testing & Validation

### **Platform Validation**
```bash
# Comprehensive platform validation
python validate_platform.py
```

### **Real-Time Feature Testing**
```bash
# Install test dependencies
pip install websockets requests pandas

# Run comprehensive real-time test
python test_realtime.py
```

### **Load Testing**
```bash
# API load testing
python load_test.py

# WebSocket stress testing
python websocket_test.py
```

---

## 📈 Monitoring & Observability

### **Application Monitoring**
- **Prometheus**: System metrics collection
- **Grafana**: Real-time dashboards and alerting
- **Custom Metrics**: Business KPIs and ML model performance

### **Log Management**
- **Structured Logging**: JSON formatted logs with correlation IDs
- **Log Aggregation**: Centralized logging with ELK stack ready
- **Error Tracking**: Comprehensive error handling and reporting

### **Performance Monitoring**
- **Real-time Metrics**: CPU, memory, disk usage
- **Application Metrics**: Response times, throughput, error rates
- **ML Metrics**: Model accuracy, training time, prediction latency

---

## 🔒 Security & Best Practices

### **Security Features**
- **CORS Protection**: Configured for production domains
- **Input Validation**: Pydantic models for all API inputs
- **SQL Injection Protection**: Parameterized queries
- **XSS Protection**: Input sanitization and validation
- **CSRF Protection**: Token-based authentication ready

### **Data Protection**
- **Encrypted Storage**: Database and object storage encryption
- **Secure APIs**: HTTPS enforcement in production
- **Access Control**: Role-based permissions ready
- **Audit Logging**: Complete activity tracking

---

## 🚀 Deployment Options

### **Production Deployment**
```bash
# Build production images
docker-compose -f docker-compose.prod.yml up -d

# Or use the production startup script
./deploy.sh
```

### **Cloud Deployment**
- **AWS**: ECS Fargate with RDS and ElastiCache
- **Google Cloud**: Cloud Run with Cloud SQL and Memorystore
- **Azure**: Container Instances with Azure Database and Redis Cache

### **Scaling Considerations**
- **Horizontal Scaling**: Multiple backend instances behind load balancer
- **Database Scaling**: Read replicas and connection pooling
- **Celery Scaling**: Multiple worker nodes
- **Caching**: Redis clustering for high availability

---

## 📚 API Documentation

### **Core Endpoints**

#### **Project Management**
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create new project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

#### **Data Management**
- `POST /api/projects/{id}/upload` - Upload dataset
- `GET /api/projects/{id}/datasets` - List datasets
- `GET /api/projects/{id}/datasets/{dataset_id}` - Get dataset info
- `DELETE /api/projects/{id}/datasets/{dataset_id}` - Delete dataset

#### **Real-Time Analysis**
- `POST /api/eda/analyze` - Start EDA analysis with WebSocket
- `GET /api/eda/{project_id}/{dataset_id}/report` - Get EDA results
- `POST /api/automl/train` - Start AutoML training with WebSocket
- `GET /api/automl/{project_id}/leaderboard` - Get model leaderboard
- `GET /api/automl/{project_id}/models/{model_id}` - Get specific model

#### **WebSocket Endpoints**
- `ws://localhost:8000/ws/job/{job_id}` - Real-time job progress

### **Response Format**
```json
{
  "job_id": "uuid-string",
  "status": "running|completed|failed",
  "progress": 75.5,
  "message": "Processing step 8/11: Feature importance analysis",
  "data": {
    "results": "...",
    "metrics": {...}
  },
  "websocket_url": "ws://localhost:8000/ws/job/uuid-string"
}
```

---

## 🤝 Contributing

### **Development Setup**
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

### **Code Style**
- **Python**: PEP 8 with Black formatting
- **TypeScript**: ESLint + Prettier
- **Git Hooks**: Pre-commit hooks for code quality

### **Testing Standards**
- Unit tests for all new features
- Integration tests for API endpoints
- End-to-end tests for critical workflows
- Performance benchmarks for ML components

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🆘 Support & Troubleshooting

### **Common Issues**

**Problem**: WebSocket connections failing
```bash
# Solution: Check Redis and Celery services
docker-compose logs redis
docker-compose logs celery_worker
```

**Problem**: ML models not training
```bash
# Solution: Verify Python dependencies
docker-compose exec backend pip list | grep -E "(pandas|scikit-learn|flaml)"
```

**Problem**: File uploads failing
```bash
# Solution: Check MinIO service and permissions
docker-compose logs minio

---

## 🙏 Acknowledgments

- **Google Gemini AI** for natural language explanations
- **FLAML** for automated machine learning
- **FastAPI** for the robust backend framework
- **React** ecosystem for the modern frontend
- **Open Source Community** for all the amazing tools and libraries

---

**Built with ❤️ for data scientists, ML engineers, and business analysts who need instant insights from their data.**

---

**⭐ Star this repository if you find it useful!**
