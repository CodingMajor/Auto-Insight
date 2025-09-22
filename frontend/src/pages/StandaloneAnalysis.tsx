import React, { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  LightBulbIcon,
  ArrowPathIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon,
  CloudArrowUpIcon,
  CpuChipIcon,
  ClockIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { useLocation, useNavigate, useParams } from 'react-router-dom'
import toast from 'react-hot-toast'
import { edaService, RealTimeService } from '../services/api'

interface AnalysisStats {
  totalColumns: number
  totalRows: number
  numericColumns: number
  categoricalColumns: number
  missingValues: number
  dataQuality: number
  targetColumn?: string
  problemType?: string
}

interface EDAMetrics {
  statistics: {
    mean: number
    median: number
    std: number
    min: number
    max: number
  }
  correlations: Array<{
    column1: string
    column2: string
    correlation: number
  }>
  outliers: Array<{
    column: string
    count: number
    percentage: number
  }>
  missing_patterns: {
    total_missing: number
    columns_with_missing: number
    missing_percentage: number
  }
}

interface FeatureImportance {
  feature: string
  importance: number
  data_type: string
}

const StandaloneAnalysis: React.FC = () => {
  const location = useLocation()
  const { projectId: projectIdFromPath } = useParams<{ projectId: string }>()
  const navigate = useNavigate()
  const realtimeServiceRef = useRef<RealTimeService | null>(null)

  const [stats, setStats] = useState<AnalysisStats>({
    totalColumns: 0,
    totalRows: 0,
    numericColumns: 0,
    categoricalColumns: 0,
    missingValues: 0,
    dataQuality: 0
  })

  const [edaMetrics, setEdaMetrics] = useState<EDAMetrics | null>(null)
  const [featureImportance, setFeatureImportance] = useState<FeatureImportance[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [analysisStatus, setAnalysisStatus] = useState<'idle' | 'running' | 'completed' | 'error'>('idle')
  const [analysisProgress, setAnalysisProgress] = useState(0)
  const [currentJobId, setCurrentJobId] = useState<string | null>(null)

  // Get identifiers: project comes from route params, dataset comes from query string
  const searchParams = new URLSearchParams(location.search)
  const projectId = projectIdFromPath || ''
  const datasetId = searchParams.get('dataset') || ''

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (realtimeServiceRef.current) {
        realtimeServiceRef.current.disconnect()
      }
    }
  }, [])

  useEffect(() => {
    if (!projectId) {
      setIsLoading(false)
      setAnalysisStatus('error')
      toast.error('Missing project id in URL')
      return
    }

    if (!datasetId) {
      setIsLoading(false)
      setAnalysisStatus('error')
      toast.error('Missing dataset id in URL')
      return
    }

    startAnalysis()
  }, [projectId, datasetId])

  const startAnalysis = async () => {
    try {
      setIsLoading(true)
      setAnalysisStatus('running')
      setAnalysisProgress(0)

      // Start EDA analysis via API
      const response = await edaService.analyze({
        project_id: projectId,
        dataset_id: datasetId,
        target_column: null
      })

      const jobId = response.data.job_id
      setCurrentJobId(jobId)

      toast.success('EDA analysis started! Connecting to real-time progress...')

      // Connect to WebSocket for real-time updates
      const realtimeService = new RealTimeService(jobId)
      realtimeServiceRef.current = realtimeService

      await realtimeService.connect(
        (data) => {
          console.log('EDA progress update:', data)

          // Update analysis progress
          setAnalysisProgress(data.progress || 0)

          // Handle different statuses
          if (data.status === 'completed') {
            fetchAnalysisResults()
          } else if (data.status === 'failed') {
            toast.error(`Analysis failed: ${data.message || 'Unknown error'}`)
            setAnalysisStatus('error')
            setIsLoading(false)
          }
        },
        (error) => {
          console.error('WebSocket error:', error)
          toast.error('Lost connection to analysis updates')
          setAnalysisStatus('error')
          setIsLoading(false)
        }
      )

    } catch (error: any) {
      console.error('Failed to start analysis:', error)
      toast.error(error.response?.data?.detail || 'Failed to start analysis')
      setAnalysisStatus('error')
      setIsLoading(false)
    }
  }

  const fetchAnalysisResults = async () => {
    if (!projectId || !datasetId) return

    try {
      const response = await edaService.getReport(projectId, datasetId)
      const report = response.data

      // Transform backend data to frontend format
      setStats({
        totalColumns: report.dataset_info?.columns || 0,
        totalRows: report.dataset_info?.rows || 0,
        numericColumns: report.dataset_info?.numeric_columns || 0,
        categoricalColumns: report.dataset_info?.categorical_columns || 0,
        missingValues: report.missing_patterns?.total_missing || 0,
        dataQuality: Math.max(0, 100 - (report.missing_patterns?.missing_percentage || 0)),
        targetColumn: report.target_column,
        problemType: report.problem_type
      })

      setEdaMetrics({
        statistics: report.statistics || { mean: 0, median: 0, std: 0, min: 0, max: 0 },
        correlations: report.correlations || [],
        outliers: report.outliers || [],
        missing_patterns: report.missing_patterns || {
          total_missing: 0,
          columns_with_missing: 0,
          missing_percentage: 0
        }
      })

      setFeatureImportance(report.feature_importance || [])
      setAnalysisStatus('completed')
      setIsLoading(false)
      toast.success('EDA analysis completed successfully!')

    } catch (error) {
      console.error('Error fetching results:', error)
      setAnalysisStatus('error')
      toast.error('Failed to fetch analysis results')
      setIsLoading(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-6 w-6 text-green-500" />
      case 'error':
        return <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
      default:
        return <ArrowPathIcon className="h-6 w-6 text-blue-500 animate-spin" />
    }
  }

  const getStatusText = () => {
    switch (analysisStatus) {
      case 'running':
        return `Analyzing dataset... ${analysisProgress}%`
      case 'completed':
        return 'Analysis completed successfully'
      case 'error':
        return 'Analysis failed'
      default:
        return 'Ready to analyze'
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowPathIcon className="h-8 w-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Analyzing Your Data</h2>
          <p className="text-gray-600 mb-4">{getStatusText()}</p>
          <div className="w-64 h-2 bg-gray-200 rounded-full mx-auto">
            <div
              className="h-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-300"
              style={{ width: `${analysisProgress}%` }}
            />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-blue-50 to-purple-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
              <ChartBarIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Data Analysis</h1>
              <p className="text-gray-600 mt-1">Explore your data with automated analysis and insights</p>
            </div>
          </div>
        </div>

        {/* Analysis Status */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {getStatusIcon(analysisStatus)}
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Analysis Status</h3>
                <p className="text-gray-600">{getStatusText()}</p>
              </div>
            </div>
            {analysisStatus === 'completed' && (
              <button
                onClick={() => navigate('/insights')}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
              >
                View Insights
              </button>
            )}
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Columns</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalColumns}</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-xl">
                <DocumentTextIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Rows</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalRows.toLocaleString()}</p>
              </div>
              <div className="p-3 bg-green-100 rounded-xl">
                <ChartBarIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Missing Values</p>
                <p className="text-3xl font-bold text-gray-900">{stats.missingValues}</p>
              </div>
              <div className="p-3 bg-red-100 rounded-xl">
                <ExclamationTriangleIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Quality</p>
                <p className="text-3xl font-bold text-gray-900">{stats.dataQuality.toFixed(1)}%</p>
              </div>
              <div className="p-3 bg-yellow-100 rounded-xl">
                <LightBulbIcon className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Analysis Results */}
        {analysisStatus === 'completed' && (
          <>
            {/* Feature Importance */}
            {featureImportance.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                  <ArrowTrendingUpIcon className="h-6 w-6 mr-3 text-blue-500" />
                  Feature Importance
                </h2>
                <div className="space-y-4">
                  {featureImportance.slice(0, 10).map((feature, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <span className="w-8 h-8 bg-blue-100 text-blue-700 rounded-full flex items-center justify-center text-sm font-semibold">
                          {index + 1}
                        </span>
                        <div>
                          <p className="font-semibold text-gray-900">{feature.feature}</p>
                          <p className="text-sm text-gray-500">{feature.data_type}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-gray-900">{feature.importance.toFixed(3)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}

            {/* Data Summary */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
            >
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Data Summary</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Dataset Overview</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total Records:</span>
                      <span className="font-semibold text-gray-900">{stats.totalRows.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Features:</span>
                      <span className="font-semibold text-gray-900">{stats.totalColumns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Numeric Features:</span>
                      <span className="font-semibold text-gray-900">{stats.numericColumns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Categorical Features:</span>
                      <span className="font-semibold text-gray-900">{stats.categoricalColumns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Missing Values:</span>
                      <span className="font-semibold text-red-600">{stats.missingValues}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
                  <div className="space-y-3">
                    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-sm text-blue-800">
                        ✓ Dataset is suitable for machine learning with good data quality
                      </p>
                    </div>
                    <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                      <p className="text-sm text-yellow-800">
                        ⚠ Consider handling missing values before training models
                      </p>
                    </div>
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm text-green-800">
                        ✓ Feature distribution looks balanced for analysis
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => navigate('/upload')}
            className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
          >
            Upload More Data
          </button>
          <button
            onClick={() => navigate('/training')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Start Training
          </button>
        </div>
      </div>
    </div>
  )
}

export default StandaloneAnalysis
