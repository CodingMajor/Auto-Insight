import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LightBulbIcon,
  SparklesIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  CpuChipIcon,
  ChartBarIcon,
  DocumentTextIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon
} from '@heroicons/react/24/outline'
import { useLocation, useNavigate } from 'react-router-dom'
import toast from 'react-hot-toast'

interface Insight {
  id: string
  title: string
  description: string
  type: 'recommendation' | 'warning' | 'opportunity' | 'pattern'
  confidence: number
  category: 'data_quality' | 'feature_engineering' | 'model_selection' | 'business_impact'
}

interface ModelExplanation {
  feature: string
  importance: number
  effect: 'positive' | 'negative'
  explanation: string
}

interface PredictionSample {
  input: Record<string, any>
  prediction: any
  confidence: number
  explanation: string
}

const StandaloneInsights: React.FC = () => {
  const location = useLocation()
  const navigate = useNavigate()

  const [insights, setInsights] = useState<Insight[]>([])
  const [modelExplanations, setModelExplanations] = useState<ModelExplanation[]>([])
  const [predictionSamples, setPredictionSamples] = useState<PredictionSample[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Get query parameters
  const searchParams = new URLSearchParams(location.search)
  const projectId = searchParams.get('project') || ''
  const modelId = searchParams.get('model') || ''

  useEffect(() => {
    if (projectId && modelId) {
      fetchInsights()
    }
  }, [projectId, modelId])

  const fetchInsights = async () => {
    try {
      setIsLoading(true)

      // Fetch technical explanations from backend
      const response = await fetch('http://localhost:8000/api/explain/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          project_id: projectId,
          model_id: modelId,
          sample_data: null
        })
      })

      if (response.ok) {
        const data = await response.json()
        const technicalExplanations = data.technical_explanations
        const naturalLanguageExplanations = data.natural_language

        // Convert technical explanations to insights
        const insightsList: Insight[] = []

        if (technicalExplanations.feature_importance) {
          technicalExplanations.feature_importance.forEach((feature: any, index: number) => {
            insightsList.push({
              id: `feature-${index}`,
              title: `${feature.feature} Feature Impact`,
              description: naturalLanguageExplanations.detailed_explanation || `${feature.feature} has ${feature.importance > 0 ? 'positive' : 'negative'} impact on predictions`,
              type: feature.importance > 0 ? 'opportunity' : 'warning',
              confidence: Math.abs(feature.importance) * 100,
              category: 'feature_engineering'
            })
          })
        }

        // Add data quality insights
        if (technicalExplanations.fairness_metrics) {
          insightsList.push({
            id: 'fairness',
            title: 'Model Fairness Analysis',
            description: naturalLanguageExplanations.detailed_explanation || 'Model shows balanced performance across different data segments',
            type: 'recommendation',
            confidence: 85,
            category: 'model_selection'
          })
        }

        // Add performance insights
        if (technicalExplanations.model_performance) {
          insightsList.push({
            id: 'performance',
            title: 'Model Performance Insights',
            description: naturalLanguageExplanations.detailed_explanation || 'Model demonstrates good predictive performance with room for optimization',
            type: 'recommendation',
            confidence: 90,
            category: 'model_selection'
          })
        }

        // Add business insights
        insightsList.push({
          id: 'business-impact',
          title: 'Business Value Assessment',
          description: naturalLanguageExplanations.detailed_explanation || 'This model can provide valuable insights for business decision making',
          type: 'opportunity',
          confidence: 88,
          category: 'business_impact'
        })

        setInsights(insightsList)

        // Convert feature importance to model explanations
        const explanations: ModelExplanation[] = technicalExplanations.feature_importance?.map((feature: any) => ({
          feature: feature.feature,
          importance: Math.abs(feature.importance),
          effect: feature.importance > 0 ? 'positive' : 'negative',
          explanation: naturalLanguageExplanations.detailed_explanation || `${feature.feature} ${feature.importance > 0 ? 'positively' : 'negatively'} affects predictions`
        })) || []

        setModelExplanations(explanations)

        // Generate sample predictions with explanations
        const samples: PredictionSample[] = [
          {
            input: { feature1: 'value1', feature2: 'value2' },
            prediction: 'Positive',
            confidence: 0.87,
            explanation: naturalLanguageExplanations.detailed_explanation || 'Based on the input features, the model predicts a positive outcome with high confidence'
          }
        ]

        setPredictionSamples(samples)

      } else {
        throw new Error('Failed to fetch explanations')
      }
    } catch (error) {
      console.error('Error fetching insights:', error)
      toast.error('Failed to load insights')
      // Set fallback mock data
      setInsights([
        {
          id: '1',
          title: 'High Correlation Detected',
          description: 'Strong correlation found between customer_age and purchase_frequency. Consider feature engineering opportunities.',
          type: 'opportunity',
          confidence: 92,
          category: 'feature_engineering'
        },
        {
          id: '2',
          title: 'Data Quality Excellent',
          description: 'Missing values are minimal and data distribution is consistent. Ready for advanced modeling.',
          type: 'recommendation',
          confidence: 95,
          category: 'data_quality'
        },
        {
          id: '3',
          title: 'Model Performance Strong',
          description: 'Model achieves high accuracy with balanced precision and recall across all classes.',
          type: 'recommendation',
          confidence: 88,
          category: 'model_selection'
        }
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'opportunity':
        return ArrowTrendingUpIcon
      case 'warning':
        return ArrowTrendingDownIcon
      case 'recommendation':
        return CheckCircleIcon
      default:
        return LightBulbIcon
    }
  }

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'opportunity':
        return 'text-green-600 bg-green-50 border-green-200'
      case 'warning':
        return 'text-red-600 bg-red-50 border-red-200'
      case 'recommendation':
        return 'text-blue-600 bg-blue-50 border-blue-200'
      default:
        return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'data_quality':
        return DocumentTextIcon
      case 'feature_engineering':
        return CpuChipIcon
      case 'model_selection':
        return ChartBarIcon
      case 'business_impact':
        return SparklesIcon
      default:
        return LightBulbIcon
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-full flex items-center justify-center mx-auto mb-4">
            <ArrowPathIcon className="h-8 w-8 text-white animate-spin" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Generating AI Insights</h2>
          <p className="text-gray-600">Analyzing your model and generating explanations...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-orange-50 to-red-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-4 mb-4">
            <div className="p-3 bg-gradient-to-r from-yellow-500 to-orange-600 rounded-xl">
              <LightBulbIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">AI Model Insights</h1>
              <p className="text-gray-600 mt-1">Understand your model's behavior with AI-powered explanations</p>
            </div>
          </div>
        </div>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {insights.map((insight, index) => {
            const TypeIcon = getTypeIcon(insight.type)
            const CategoryIcon = getCategoryIcon(insight.category)

            return (
              <motion.div
                key={insight.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-6 rounded-xl border-2 ${getTypeColor(insight.type)}`}
              >
                <div className="flex items-start space-x-3">
                  <TypeIcon className="h-6 w-6 flex-shrink-0 mt-1" />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <h3 className="font-semibold text-gray-900">{insight.title}</h3>
                      <CategoryIcon className="h-4 w-4 text-gray-500" />
                    </div>
                    <p className="text-sm text-gray-700 mb-3">{insight.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs bg-white px-2 py-1 rounded-full border">
                        {insight.category.replace('_', ' ')}
                      </span>
                      <span className="text-sm font-semibold">
                        {insight.confidence}% confidence
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>

        {/* Model Explanations */}
        {modelExplanations.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8 mb-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <CpuChipIcon className="h-6 w-6 mr-3 text-blue-500" />
              Feature Impact Analysis
            </h2>
            <div className="space-y-4">
              {modelExplanations.slice(0, 8).map((explanation, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                      explanation.effect === 'positive'
                        ? 'bg-green-100 text-green-700'
                        : 'bg-red-100 text-red-700'
                    }`}>
                      {explanation.effect === 'positive' ? '+' : '-'}
                    </span>
                    <div>
                      <p className="font-semibold text-gray-900">{explanation.feature}</p>
                      <p className="text-sm text-gray-500">{explanation.explanation}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-gray-900">
                      {explanation.importance.toFixed(3)}
                    </p>
                    <p className="text-xs text-gray-500">importance</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Sample Predictions */}
        {predictionSamples.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 p-8"
          >
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
              <ChartBarIcon className="h-6 w-6 mr-3 text-purple-500" />
              Prediction Examples
            </h2>
            <div className="space-y-4">
              {predictionSamples.map((sample, index) => (
                <div key={index} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-semibold text-gray-900">Sample Prediction #{index + 1}</h4>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                      sample.confidence > 0.8
                        ? 'bg-green-100 text-green-800'
                        : sample.confidence > 0.6
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {Math.round(sample.confidence * 100)}% confidence
                    </span>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">Input Features:</h5>
                      <div className="bg-gray-50 p-3 rounded text-sm">
                        {Object.entries(sample.input).map(([key, value]) => (
                          <div key={key} className="flex justify-between">
                            <span className="text-gray-600">{key}:</span>
                            <span className="font-mono">{String(value)}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h5 className="font-medium text-gray-700 mb-2">AI Explanation:</h5>
                      <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                        {sample.explanation}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-gray-900">
                        Predicted: {sample.prediction}
                      </span>
                      <SparklesIcon className="h-5 w-5 text-yellow-500" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => navigate('/analysis')}
            className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
          >
            Back to Analysis
          </button>
          <button
            onClick={() => navigate('/training')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Train New Model
          </button>
        </div>
      </div>
    </div>
  )
}

export default StandaloneInsights
