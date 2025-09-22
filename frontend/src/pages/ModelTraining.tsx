import React, { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  PlayIcon,
  PauseIcon,
  StopIcon,
  BeakerIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  SparklesIcon,
  CpuChipIcon
} from '@heroicons/react/24/outline'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'
import toast from 'react-hot-toast'
import { automlService, RealTimeService } from '../services/api'
import { projectService } from '../services/api'

interface Model {
  id: string
  name: string
  algorithm: string
  status: 'queued' | 'training' | 'completed' | 'failed'
  accuracy?: number
  precision?: number
  recall?: number
  f1Score?: number
  trainingTime?: number
  progress: number
  best_estimator?: string
  metrics?: any
}

const ModelTraining: React.FC = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [isTraining, setIsTraining] = useState(false)
  const [selectedAlgorithms, setSelectedAlgorithms] = useState<string[]>(['lightgbm', 'randomforest', 'xgboost'])
  const [timeBudget, setTimeBudget] = useState(60) 
  const [models, setModels] = useState<Model[]>([])
  const [trainingProgress, setTrainingProgress] = useState(0)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)
  const realtimeServiceRef = useRef<RealTimeService | null>(null)
  const [targetColumn, setTargetColumn] = useState('')
  const [problemType, setProblemType] = useState('classification')
  const [metric, setMetric] = useState('accuracy')

  const algorithms = [
    { id: 'lightgbm', name: 'LightGBM', description: 'Fast gradient boosting', recommended: true },
    { id: 'xgboost', name: 'XGBoost', description: 'Extreme gradient boosting', recommended: true },
    { id: 'randomforest', name: 'Random Forest', description: 'Ensemble of decision trees', recommended: true },
    { id: 'logistic', name: 'Logistic Regression', description: 'Linear classification model', recommended: false },
    { id: 'svm', name: 'Support Vector Machine', description: 'Margin-based classifier', recommended: false },
    { id: 'neural', name: 'Neural Network', description: 'Deep learning model', recommended: false }
  ]

  const trainingData = [
    { time: 0, accuracy: 0.5, loss: 0.8 },
    { time: 30, accuracy: 0.72, loss: 0.65 },
    { time: 60, accuracy: 0.81, loss: 0.52 },
    { time: 90, accuracy: 0.87, loss: 0.43 },
    { time: 120, accuracy: 0.91, loss: 0.38 },
    { time: 150, accuracy: 0.93, loss: 0.35 },
    { time: 180, accuracy: 0.94, loss: 0.33 }
  ]

  useEffect(() => {
    const loadProjectData = async () => {
      if (!projectId) return

      try {
        const project = await projectService.get(projectId)
        // Assume we have a dataset available for this project
        // In a real app, you'd get this from the project data
        setTargetColumn(project.data.target_column || '')
      } catch (error) {
        console.error('Failed to load project data:', error)
        toast.error('Failed to load project data')
      }
    }

    loadProjectData()
  }, [projectId])

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (realtimeServiceRef.current) {
        realtimeServiceRef.current.disconnect()
      }
    }
  }, [])

  const startTraining = async () => {
    if (!projectId || !targetColumn) {
      toast.error('Please configure target column and dataset first')
      return
    }

    setIsTraining(true)
    setTrainingProgress(0)

    try {
      // Start AutoML training via API
      const response = await automlService.train({
        project_id: projectId,
        dataset_id: 'sample_dataset', // In real app, get from project data
        target_column: targetColumn,
        problem_type: problemType,
        time_budget: timeBudget,
        metric: metric
      })

      const jobId = response.data.job_id
      setCurrentJobId(jobId)

      toast.success('AutoML training started! Connecting to real-time updates...')

      // Connect to WebSocket for real-time updates
      const realtimeService = new RealTimeService(jobId)
      realtimeServiceRef.current = realtimeService

      await realtimeService.connect(
        (data) => {
          console.log('Real-time update:', data)

          // Update training progress
          setTrainingProgress(data.progress || 0)

          // Update models based on status
          if (data.status === 'completed') {
            // Load leaderboard to get trained models
            loadLeaderboard()
          } else if (data.status === 'failed') {
            toast.error(`Training failed: ${data.message || 'Unknown error'}`)
            setIsTraining(false)
          }
        },
        (error) => {
          console.error('WebSocket error:', error)
          toast.error('Lost connection to training updates')
          setIsTraining(false)
        }
      )

    } catch (error: any) {
      console.error('Failed to start training:', error)
      toast.error(error.response?.data?.detail || 'Failed to start training')
      setIsTraining(false)
    }
  }

  const loadLeaderboard = async () => {
    if (!projectId) return

    try {
      const response = await automlService.getLeaderboard(projectId)
      const leaderboard = response.data

      // Convert leaderboard to component format
      const trainedModels: Model[] = leaderboard.map((item: any) => ({
        id: item.model_id,
        name: item.best_estimator || 'Unknown Model',
        algorithm: item.best_estimator || 'Unknown',
        status: 'completed',
        progress: 100,
        accuracy: item.metrics?.accuracy || item.metrics?.r2_score || 0,
        precision: item.metrics?.precision || 0,
        recall: item.metrics?.recall || 0,
        f1Score: item.metrics?.f1_score || 0,
        trainingTime: item.training_time || 0,
        best_estimator: item.best_estimator,
        metrics: item.metrics
      }))

      setModels(trainedModels)
      setIsTraining(false)
      toast.success('AutoML training completed successfully!')

    } catch (error) {
      console.error('Failed to load leaderboard:', error)
      toast.error('Failed to load training results')
      setIsTraining(false)
    }
  }

  const generateRandomMetrics = () => ({
    accuracy: Math.random() * 0.15 + 0.85, // 85-100%
    precision: Math.random() * 0.15 + 0.80,
    recall: Math.random() * 0.15 + 0.75,
    f1Score: Math.random() * 0.15 + 0.80
  })

  const stopTraining = () => {
    setIsTraining(false)
    setModels(prev => prev.map(m => 
      m.status === 'training' || m.status === 'queued' 
        ? { ...m, status: 'failed' } 
        : m
    ))
    toast.error('Training stopped')
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'training':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      case 'queued':
        return <ClockIcon className="h-5 w-5 text-yellow-500" />
      default:
        return null
    }
  }

  const getBestModel = () => {
    return models
      .filter(m => m.status === 'completed' && m.accuracy)
      .sort((a, b) => (b.accuracy || 0) - (a.accuracy || 0))[0]
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <button 
            onClick={() => navigate(`/projects/${projectId}`)}
            className="p-2 hover:bg-neutral-100 rounded-lg transition-colors"
          >
            <ArrowLeftIcon className="h-5 w-5 text-neutral-600" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Model Training</h1>
            <p className="text-neutral-600 mt-1">Train and compare multiple machine learning models</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Training Configuration */}
        <div className="lg:col-span-1 space-y-6">
          <div className="card">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Training Configuration</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-2">
                  Time Budget (seconds)
                </label>
                <input
                  type="number"
                  value={timeBudget}
                  onChange={(e) => setTimeBudget(Number(e.target.value))}
                  className="input-field"
                  min="60"
                  max="3600"
                  disabled={isTraining}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-700 mb-3">
                  Select Algorithms
                </label>
                <div className="space-y-2">
                  {algorithms.map((algorithm) => (
                    <label key={algorithm.id} className="flex items-start space-x-3">
                      <input
                        type="checkbox"
                        checked={selectedAlgorithms.includes(algorithm.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedAlgorithms(prev => [...prev, algorithm.id])
                          } else {
                            setSelectedAlgorithms(prev => prev.filter(id => id !== algorithm.id))
                          }
                        }}
                        disabled={isTraining}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium text-sm">{algorithm.name}</span>
                          {algorithm.recommended && (
                            <span className="badge badge-success text-xs">Recommended</span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-600">{algorithm.description}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-neutral-200">
                {!isTraining ? (
                  <button
                    onClick={startTraining}
                    className="btn-primary w-full flex items-center justify-center space-x-2"
                  >
                    <PlayIcon className="h-4 w-4" />
                    <span>Start Training</span>
                  </button>
                ) : (
                  <button
                    onClick={stopTraining}
                    className="w-full bg-red-600 hover:bg-red-700 text-white font-medium px-4 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                  >
                    <StopIcon className="h-4 w-4" />
                    <span>Stop Training</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Training Progress */}
          {isTraining && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="card"
            >
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Training Progress</h3>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-neutral-600 mb-1">
                    <span>Overall Progress</span>
                    <span>{Math.round(trainingProgress)}%</span>
                  </div>
                  <div className="w-full bg-neutral-200 rounded-full h-2">
                    <div
                      className="bg-primary-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${trainingProgress}%` }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  {models.map((model) => (
                    <div key={model.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(model.status)}
                        <span>{model.name}</span>
                      </div>
                      <span className="text-neutral-500">{model.progress}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          {/* Training Chart */}
          {(isTraining || models.some(m => m.status === 'completed')) && (
            <div className="card">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Training Progress</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trainingData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="time" stroke="#64748b" />
                    <YAxis stroke="#64748b" />
                    <Tooltip />
                    <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} />
                    <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}

          {/* Model Results */}
          {models.length > 0 && (
            <div className="card">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-neutral-900">Model Results</h3>
                {models.some(m => m.status === 'completed') && (
                  <button 
                    onClick={() => navigate(`/projects/${projectId}/explain`)}
                    className="btn-secondary flex items-center space-x-2"
                  >
                    <SparklesIcon className="h-4 w-4" />
                    <span>Explain Best Model</span>
                  </button>
                )}
              </div>

              <div className="overflow-hidden">
                <table className="min-w-full divide-y divide-neutral-200">
                  <thead className="bg-neutral-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Model</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Accuracy</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Precision</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Recall</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">F1 Score</th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-neutral-200">
                    {models.map((model) => (
                      <tr key={model.id} className="hover:bg-neutral-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <CpuChipIcon className="h-4 w-4 text-neutral-400" />
                            <span className="font-medium text-neutral-900">{model.name}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            {getStatusIcon(model.status)}
                            <span className={`badge ${
                              model.status === 'completed' ? 'badge-success' :
                              model.status === 'training' ? 'badge-info' :
                              model.status === 'failed' ? 'badge-warning' : 'badge'
                            }`}>
                              {model.status}
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {model.accuracy ? `${(model.accuracy * 100).toFixed(1)}%` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {model.precision ? `${(model.precision * 100).toFixed(1)}%` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {model.recall ? `${(model.recall * 100).toFixed(1)}%` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-900">
                          {model.f1Score ? `${(model.f1Score * 100).toFixed(1)}%` : '-'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-neutral-500">
                          {model.trainingTime ? `${model.trainingTime}s` : '-'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Best Model Summary */}
          {(() => {
            const bestModel = getBestModel()
            return bestModel && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-green-50 border-green-200"
              >
                <div className="flex items-center space-x-3 mb-4">
                  <CheckCircleIcon className="h-6 w-6 text-green-600" />
                  <h3 className="text-lg font-semibold text-green-900">Best Performing Model</h3>
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <div className="text-sm text-green-700">Model</div>
                    <div className="font-semibold text-green-900">{bestModel.name}</div>
                  </div>
                  <div>
                    <div className="text-sm text-green-700">Accuracy</div>
                    <div className="font-semibold text-green-900">{(bestModel.accuracy! * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-green-700">F1 Score</div>
                    <div className="font-semibold text-green-900">{(bestModel.f1Score! * 100).toFixed(1)}%</div>
                  </div>
                  <div>
                    <div className="text-sm text-green-700">Training Time</div>
                    <div className="font-semibold text-green-900">{bestModel.trainingTime}s</div>
                  </div>
                </div>

                <div className="mt-4 flex space-x-3">
                  <button 
                    onClick={() => navigate(`/projects/${projectId}/explain`)}
                    className="btn-primary"
                  >
                    Explain Model
                  </button>
                  <button className="btn-secondary">
                    Deploy Model
                  </button>
                </div>
              </motion.div>
            )
          })()}
        </div>
      </div>
    </div>
  )
}

export default ModelTraining
