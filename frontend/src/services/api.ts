import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE_URL || 'http://localhost:8000',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor for auth if needed
api.interceptors.request.use(
  (config) => {
    // Add auth token if available
    const token = localStorage.getItem('auth_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access
      localStorage.removeItem('auth_token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api

// API Endpoints
export const endpoints = {
  // Health check
  health: '/health',

  // Projects
  projects: '/api/projects',

  // Data upload
  upload: (projectId: string) => `/api/projects/${projectId}/upload`,

  // EDA Analysis - Real-time
  eda: {
    analyze: '/api/eda/analyze',
    status: (projectId: string, datasetId: string) => `/api/eda/${projectId}/${datasetId}/status`,
    report: (projectId: string, datasetId: string) => `/api/eda/${projectId}/${datasetId}/report`,
  },

  // Preprocessing
  preprocessing: {
    configure: '/api/preprocessing/configure',
    preview: '/api/preprocessing/preview',
  },

  // AutoML - Real-time
  automl: {
    train: '/api/automl/train',
    status: (projectId: string) => `/api/automl/${projectId}/status`,
    leaderboard: (projectId: string) => `/api/automl/${projectId}/leaderboard`,
  },

  // Explainability
  explain: '/api/explain/generate',

  // Export
  export: {
    model: (projectId: string, modelId: string) => `/api/export/${projectId}/model/${modelId}`,
    pipeline: (projectId: string) => `/api/export/${projectId}/pipeline`,
  },

  // Dashboard
  dashboard: {
    stats: '/api/dashboard/stats',
    activity: '/api/dashboard/activity',
  },
}

// WebSocket utilities for real-time updates
export class RealTimeService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000

  constructor(private jobId: string) {}

  connect(onMessage: (data: any) => void, onError?: (error: Event) => void): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const wsUrl = `ws://localhost:8000/ws/job/${this.jobId}`
        this.ws = new WebSocket(wsUrl)

        this.ws.onopen = () => {
          console.log(`WebSocket connected for job ${this.jobId}`)
          this.reconnectAttempts = 0
          resolve()
        }

        this.ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data)
            onMessage(data)
          } catch (error) {
            console.error('Failed to parse WebSocket message:', error)
          }
        }

        this.ws.onclose = () => {
          console.log(`WebSocket closed for job ${this.jobId}`)
          this.attemptReconnect(onMessage, onError)
        }

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error)
          if (onError) onError(error)
          reject(error)
        }

      } catch (error) {
        reject(error)
      }
    })
  }

  private attemptReconnect(onMessage: (data: any) => void, onError?: (error: Event) => void) {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++
      console.log(`Attempting to reconnect... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`)

      setTimeout(() => {
        this.connect(onMessage, onError).catch(() => {
          // Reconnection failed, will try again
        })
      }, this.reconnectInterval)
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close()
      this.ws = null
    }
  }

  isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN
  }
}

// API service functions
export const projectService = {
  create: (project: any) => api.post(endpoints.projects, project),
  list: () => api.get(endpoints.projects),
  get: (id: string) => api.get(`${endpoints.projects}/${id}`),
}

export const dataService = {
  upload: (projectId: string, file: File, onProgress?: (progress: number) => void) => {
    const formData = new FormData()
    formData.append('file', file)

    return api.post(endpoints.upload(projectId), formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (progressEvent) => {
        if (onProgress && progressEvent.total) {
          const progress = Math.round((progressEvent.loaded * 100) / progressEvent.total)
          onProgress(progress)
        }
      },
    })
  },
}

export const edaService = {
  analyze: (data: { project_id: string; dataset_id: string; target_column?: string }) =>
    api.post(endpoints.eda.analyze, data),

  getStatus: (projectId: string, datasetId: string) =>
    api.get(endpoints.eda.status(projectId, datasetId)),

  getReport: (projectId: string, datasetId: string) =>
    api.get(endpoints.eda.report(projectId, datasetId)),
}

export const automlService = {
  train: (data: {
    project_id: string;
    dataset_id: string;
    target_column: string;
    problem_type: string;
    time_budget?: number;
    metric?: string;
  }) => api.post(endpoints.automl.train, data),

  getStatus: (projectId: string) =>
    api.get(endpoints.automl.status(projectId)),

  getLeaderboard: (projectId: string) =>
    api.get(endpoints.automl.leaderboard(projectId)),
}

export const preprocessingService = {
  configure: (data: any) => api.post(endpoints.preprocessing.configure, data),
  preview: (data: any) => api.post(endpoints.preprocessing.preview, data),
}

export const explainService = {
  generate: (data: any) => api.post(endpoints.explain, data),
}

export const dashboardService = {
  getStats: () => api.get(endpoints.dashboard.stats),
  getActivity: () => api.get(endpoints.dashboard.activity),
}
