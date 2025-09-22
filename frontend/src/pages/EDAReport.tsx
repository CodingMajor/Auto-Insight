import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  ChartBarIcon,
  DocumentArrowDownIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line, ScatterChart, Scatter } from 'recharts'

const EDAReport: React.FC = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [activeStep, setActiveStep] = useState(1)
  const [isGenerating, setIsGenerating] = useState(false)

  // Mock EDA results
  const edaResults = {
    globalSummary: {
      rows: 10000,
      columns: 25,
      missingData: 5.2,
      duplicates: 0.8,
      dataTypes: { numeric: 15, categorical: 8, datetime: 2 }
    },
    targetAnalysis: {
      column: 'churn',
      type: 'binary',
      distribution: [
        { name: 'No Churn', value: 7342, percentage: 73.4 },
        { name: 'Churn', value: 2658, percentage: 26.6 }
      ]
    },
    numericFeatures: [
      { name: 'age', mean: 41.2, std: 12.8, skewness: 0.3, outliers: 2.1 },
      { name: 'income', mean: 65000, std: 25000, skewness: 1.2, outliers: 5.8 },
      { name: 'tenure', mean: 32.4, std: 24.1, skewness: 0.1, outliers: 1.2 }
    ],
    correlations: [
      { feature1: 'income', feature2: 'age', correlation: 0.65 },
      { feature1: 'tenure', feature2: 'satisfaction', correlation: 0.42 },
      { feature1: 'usage', feature2: 'churn', correlation: -0.38 }
    ],
    recommendations: [
      'Handle missing values in income and age columns',
      'Consider log transformation for income due to high skewness',
      'Remove outliers in income column (5.8% of data)',
      'Feature engineering: create age groups for better interpretability',
      'Address class imbalance in target variable (73.4% vs 26.6%)'
    ]
  }

  const edaSteps = [
    { id: 1, name: 'Global Summary', status: 'completed' },
    { id: 2, name: 'Target Analysis', status: 'completed' },
    { id: 3, name: 'Numeric Features', status: 'completed' },
    { id: 4, name: 'Categorical Features', status: 'completed' },
    { id: 5, name: 'Missing Data', status: 'completed' },
    { id: 6, name: 'Outlier Detection', status: 'completed' },
    { id: 7, name: 'Correlations', status: 'completed' },
    { id: 8, name: 'Feature Relationships', status: 'completed' },
    { id: 9, name: 'Data Quality', status: 'completed' },
    { id: 10, name: 'Recommendations', status: 'completed' }
  ]

  const generateAIExplanation = async () => {
    setIsGenerating(true)
    // Simulate AI explanation generation
    setTimeout(() => {
      setIsGenerating(false)
    }, 2000)
  }

  const getStepIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'running':
        return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      default:
        return <div className="h-5 w-5 border-2 border-neutral-300 rounded-full" />
    }
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
            <h1 className="text-3xl font-bold text-neutral-900">EDA Report</h1>
            <p className="text-neutral-600 mt-1">Comprehensive exploratory data analysis results</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="badge badge-success">Analysis Complete</span>
            <span className="text-sm text-neutral-600">Generated 2 hours ago</span>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={generateAIExplanation}
              disabled={isGenerating}
              className="btn-secondary flex items-center space-x-2"
            >
              <SparklesIcon className="h-4 w-4" />
              <span>{isGenerating ? 'Generating...' : 'AI Explanation'}</span>
            </button>
            <button className="btn-secondary">
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export Report
            </button>
            <button 
              onClick={() => navigate(`/projects/${projectId}/training`)}
              className="btn-primary"
            >
              Continue to Training
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* EDA Steps Sidebar */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <h3 className="text-lg font-semibold text-neutral-900 mb-4">Analysis Steps</h3>
            <div className="space-y-2">
              {edaSteps.map((step) => (
                <button
                  key={step.id}
                  onClick={() => setActiveStep(step.id)}
                  className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${
                    activeStep === step.id
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'hover:bg-neutral-50'
                  }`}
                >
                  {getStepIcon(step.status)}
                  <span className="text-sm font-medium">{step.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeStep}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeStep === 1 && (
              <div className="space-y-6">
                <div className="card">
                  <h3 className="text-xl font-semibold text-neutral-900 mb-6">Dataset Overview</h3>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
                    <div className="text-center">
                      <div className="text-3xl font-bold text-blue-600">{edaResults.globalSummary.rows.toLocaleString()}</div>
                      <div className="text-sm text-neutral-600">Rows</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-green-600">{edaResults.globalSummary.columns}</div>
                      <div className="text-sm text-neutral-600">Columns</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-orange-600">{edaResults.globalSummary.missingData}%</div>
                      <div className="text-sm text-neutral-600">Missing Data</div>
                    </div>
                    <div className="text-center">
                      <div className="text-3xl font-bold text-red-600">{edaResults.globalSummary.duplicates}%</div>
                      <div className="text-sm text-neutral-600">Duplicates</div>
                    </div>
                  </div>

                  <div className="bg-neutral-50 rounded-lg p-6">
                    <h4 className="font-semibold text-neutral-900 mb-4">Data Types Distribution</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">{edaResults.globalSummary.dataTypes.numeric}</div>
                        <div className="text-sm text-neutral-600">Numeric</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600">{edaResults.globalSummary.dataTypes.categorical}</div>
                        <div className="text-sm text-neutral-600">Categorical</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">{edaResults.globalSummary.dataTypes.datetime}</div>
                        <div className="text-sm text-neutral-600">DateTime</div>
                      </div>
                    </div>
                  </div>
                </div>

                {isGenerating && (
                  <div className="card bg-blue-50 border-blue-200">
                    <div className="flex items-center space-x-3">
                      <SparklesIcon className="h-6 w-6 text-blue-600 animate-pulse" />
                      <div>
                        <h4 className="font-semibold text-blue-900">Generating AI Explanation...</h4>
                        <p className="text-sm text-blue-700">Our AI is analyzing your data patterns and generating insights.</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeStep === 2 && (
              <div className="card">
                <h3 className="text-xl font-semibold text-neutral-900 mb-6">Target Variable Analysis</h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-4">Class Distribution</h4>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={edaResults.targetAnalysis.distribution}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={80}
                            paddingAngle={5}
                            dataKey="value"
                          >
                            <Cell fill="#22c55e" />
                            <Cell fill="#ef4444" />
                          </Pie>
                          <Tooltip />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-4">Class Statistics</h4>
                    <div className="space-y-4">
                      {edaResults.targetAnalysis.distribution.map((item, index) => (
                        <div key={item.name} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-4 h-4 rounded-full"
                              style={{ backgroundColor: index === 0 ? '#22c55e' : '#ef4444' }}
                            />
                            <span className="font-medium">{item.name}</span>
                          </div>
                          <div className="text-right">
                            <div className="font-semibold">{item.value.toLocaleString()}</div>
                            <div className="text-sm text-neutral-600">{item.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                      <div className="flex items-start space-x-2">
                        <ExclamationTriangleIcon className="h-5 w-5 text-orange-600 mt-0.5" />
                        <div>
                          <h5 className="font-medium text-orange-900">Class Imbalance Detected</h5>
                          <p className="text-sm text-orange-700 mt-1">
                            The target variable shows significant class imbalance (73.4% vs 26.6%). 
                            Consider using techniques like SMOTE, class weights, or stratified sampling.
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 7 && (
              <div className="card">
                <h3 className="text-xl font-semibold text-neutral-900 mb-6">Feature Correlations</h3>
                
                <div className="space-y-6">
                  <div>
                    <h4 className="font-semibold text-neutral-900 mb-4">Strong Correlations</h4>
                    <div className="space-y-3">
                      {edaResults.correlations.map((corr, index) => (
                        <div key={index} className="flex items-center justify-between p-4 bg-neutral-50 rounded-lg">
                          <div>
                            <span className="font-medium">{corr.feature1}</span>
                            <span className="text-neutral-500 mx-2">↔</span>
                            <span className="font-medium">{corr.feature2}</span>
                          </div>
                          <div className="flex items-center space-x-3">
                            <div className="w-24 bg-neutral-200 rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  Math.abs(corr.correlation) > 0.5 ? 'bg-red-500' : 'bg-yellow-500'
                                }`}
                                style={{ width: `${Math.abs(corr.correlation) * 100}%` }}
                              />
                            </div>
                            <span className="font-semibold text-sm w-12 text-right">
                              {corr.correlation.toFixed(2)}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeStep === 10 && (
              <div className="card">
                <h3 className="text-xl font-semibold text-neutral-900 mb-6">Recommendations</h3>
                
                <div className="space-y-4">
                  {edaResults.recommendations.map((recommendation, index) => (
                    <div key={index} className="flex items-start space-x-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                      <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-blue-900">{recommendation}</p>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-8 p-6 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="font-semibold text-green-900 mb-2">Next Steps</h4>
                  <p className="text-green-800 mb-4">
                    Your data analysis is complete! Based on the findings, you're ready to proceed with model training.
                  </p>
                  <button 
                    onClick={() => navigate(`/projects/${projectId}/training`)}
                    className="btn-primary"
                  >
                    Start Model Training
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default EDAReport
