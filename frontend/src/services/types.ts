// API Response Types
export interface Project {
  id: string
  name: string
  description?: string
  target_column?: string
  dataset_id?: string
  created_at?: string
  updated_at?: string
}

export interface Dataset {
  id: string
  name: string
  columns: string[]
  target_column?: string
  row_count: number
  file_path?: string
}

export interface ModelResult {
  model_id: string
  best_estimator: string
  metrics: {
    accuracy?: number
    precision?: number
    recall?: number
    f1_score?: number
    r2_score?: number
  }
  training_time: number
}

export interface LeaderboardResponse {
  [key: string]: ModelResult
}

export interface TrainingRequest {
  project_id: string
  dataset_id: string
  target_column: string
  problem_type: string
  time_budget?: number
  metric?: string
}
