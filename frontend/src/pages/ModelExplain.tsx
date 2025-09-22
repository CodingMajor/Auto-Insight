import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  LightBulbIcon,
  SparklesIcon,
  DocumentArrowDownIcon,
  InformationCircleIcon,
  ChartBarIcon,
  EyeIcon,
  UserGroupIcon,
  ScaleIcon
} from '@heroicons/react/24/outline'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts'

const ModelExplain: React.FC = () => {
  const { projectId } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('global')
  const [isGeneratingExplanation, setIsGeneratingExplanation] = useState(false)
  const [aiExplanation, setAiExplanation] = useState<any>(null)

  // Mock explanation data
  const explanationData = {
    global: {
      featureImportance: [
        { feature: 'tenure', importance: 0.25, direction: 'negative' },
        { feature: 'monthly_charges', importance: 0.18, direction: 'positive' },
        { feature: 'total_charges', importance: 0.15, direction: 'positive' },
        { feature: 'contract_type', importance: 0.12, direction: 'mixed' },
        { feature: 'payment_method', importance: 0.10, direction: 'mixed' },
        { feature: 'internet_service', importance: 0.08, direction: 'positive' },
        { feature: 'tech_support', importance: 0.07, direction: 'negative' },
        { feature: 'online_security', importance: 0.05, direction: 'negative' }
      ],
      shapSummary: {
        baseValue: 0.266,
        explanation: "The model's baseline prediction is 26.6% churn probability. Features push this up or down based on their values."
      }
    },
    local: {
      samplePrediction: {
        prediction: 0.85,
        confidence: 0.92,
        actualClass: 'Churn'
      },
      contributions: [
        { feature: 'tenure', value: '2 months', contribution: 0.35, explanation: 'Very short tenure increases churn risk' },
        { feature: 'monthly_charges', value: '$89.50', contribution: 0.22, explanation: 'High monthly charges increase churn probability' },
        { feature: 'contract_type', value: 'Month-to-month', contribution: 0.18, explanation: 'Month-to-month contracts have higher churn' },
        { feature: 'tech_support', value: 'No', contribution: 0.12, explanation: 'Lack of tech support increases churn risk' },
        { feature: 'total_charges', value: '$179.00', contribution: -0.02, explanation: 'Low total charges slightly reduce churn risk' }
      ]
    },
    fairness: {
      demographicParity: {
        score: 0.85,
        groups: [
          { name: 'Male', churnRate: 0.24, prediction: 0.26 },
          { name: 'Female', churnRate: 0.28, prediction: 0.27 }
        ]
      },
      equalOpportunity: {
        score: 0.78,
        explanation: 'Model shows some disparity in true positive rates across groups'
      },
      calibration: {
        score: 0.91,
        explanation: 'Model predictions are well-calibrated across different groups'
      }
    }
  }

  const tabs = [
    { id: 'global', name: 'Global Explanations', icon: ChartBarIcon },
    { id: 'local', name: 'Local Explanations', icon: EyeIcon },
    { id: 'fairness', name: 'Fairness Analysis', icon: ScaleIcon },
    { id: 'ai-insights', name: 'AI Insights', icon: SparklesIcon }
  ]

  const generateAIInsights = async () => {
    setIsGeneratingExplanation(true)
    
    // Simulate AI explanation generation
    setTimeout(() => {
      setAiExplanation({
        elevatorPitch: "Our AI model predicts customer churn with 94% accuracy by analyzing customer tenure, charges, and service usage patterns, helping businesses proactively retain at-risk customers.",
        detailedExplanation: "The model has learned that customers with short tenure (less than 6 months) and high monthly charges are most likely to churn. Contract type plays a crucial role - month-to-month customers churn at 3x the rate of long-term contract holders. The model also identifies that customers without tech support or online security services are significantly more likely to leave. These insights enable targeted retention strategies focused on early customer engagement and value-added services.",
        keyFindings: [
          "Tenure is the strongest predictor - 68% of churners have less than 12 months tenure",
          "High monthly charges ($70+) combined with short tenure creates highest churn risk",
          "Month-to-month contracts account for 89% of all churns",
          "Customers without tech support are 2.4x more likely to churn",
          "Senior citizens show 15% higher churn rates across all segments"
        ],
        recommendations: [
          "Implement early engagement programs for customers in first 6 months",
          "Offer contract incentives to reduce month-to-month subscribers",
          "Proactively offer tech support to high-risk customer segments",
          "Create senior citizen retention programs with specialized support",
          "Monitor customers with charges above $70 for early warning signs"
        ]
      })
      setIsGeneratingExplanation(false)
    }, 3000)
  }

  const radarData = [
    { metric: 'Accuracy', value: 94, fullMark: 100 },
    { metric: 'Precision', value: 91, fullMark: 100 },
    { metric: 'Recall', value: 88, fullMark: 100 },
    { metric: 'F1-Score', value: 89, fullMark: 100 },
    { metric: 'Fairness', value: 85, fullMark: 100 },
    { metric: 'Calibration', value: 91, fullMark: 100 }
  ]

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
            <h1 className="text-3xl font-bold text-neutral-900">Model Explanations</h1>
            <p className="text-neutral-600 mt-1">Understand how your model makes predictions</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <span className="badge badge-success">LightGBM Classifier</span>
            <span className="text-sm text-neutral-600">94.2% Accuracy</span>
          </div>
          
          <div className="flex space-x-3">
            <button
              onClick={generateAIInsights}
              disabled={isGeneratingExplanation}
              className="btn-secondary flex items-center space-x-2"
            >
              <SparklesIcon className="h-4 w-4" />
              <span>{isGeneratingExplanation ? 'Generating...' : 'Generate AI Insights'}</span>
            </button>
            <button className="btn-secondary">
              <DocumentArrowDownIcon className="h-4 w-4 mr-2" />
              Export Report
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-neutral-200 mb-8">
        <nav className="-mb-px flex space-x-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                activeTab === tab.id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-neutral-500 hover:text-neutral-700 hover:border-neutral-300'
              }`}
            >
              <tab.icon className="h-4 w-4" />
              <span>{tab.name}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'global' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Feature Importance */}
              <div className="card">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Feature Importance</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={explanationData.global.featureImportance} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis type="number" stroke="#64748b" />
                      <YAxis dataKey="feature" type="category" stroke="#64748b" width={100} />
                      <Tooltip />
                      <Bar dataKey="importance" fill="#22c55e" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Model Performance Radar */}
              <div className="card">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Model Performance</h3>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <RadarChart data={radarData}>
                      <PolarGrid />
                      <PolarAngleAxis dataKey="metric" />
                      <PolarRadiusAxis angle={90} domain={[0, 100]} />
                      <Radar name="Performance" dataKey="value" stroke="#22c55e" fill="#22c55e" fillOpacity={0.3} />
                    </RadarChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* SHAP Summary */}
            <div className="card">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">SHAP Summary</h3>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <InformationCircleIcon className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="text-blue-900 font-medium">Base Value: {explanationData.global.shapSummary.baseValue * 100}%</p>
                    <p className="text-blue-800 text-sm mt-1">{explanationData.global.shapSummary.explanation}</p>
                  </div>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <h4 className="font-medium text-neutral-900">Top Contributing Features:</h4>
                {explanationData.global.featureImportance.slice(0, 5).map((feature, index) => (
                  <div key={feature.feature} className="flex items-center justify-between p-3 bg-neutral-50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <span className="w-6 h-6 bg-primary-100 text-primary-700 rounded-full text-xs flex items-center justify-center font-medium">
                        {index + 1}
                      </span>
                      <span className="font-medium">{feature.feature}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="w-24 bg-neutral-200 rounded-full h-2">
                        <div
                          className="bg-primary-600 h-2 rounded-full"
                          style={{ width: `${feature.importance * 100}%` }}
                        />
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {(feature.importance * 100).toFixed(0)}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'local' && (
          <div className="space-y-6">
            {/* Sample Prediction */}
            <div className="card">
              <h3 className="text-lg font-semibold text-neutral-900 mb-4">Sample Prediction Analysis</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="text-center p-4 bg-red-50 rounded-lg">
                  <div className="text-3xl font-bold text-red-600">
                    {(explanationData.local.samplePrediction.prediction * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-red-700">Churn Probability</div>
                </div>
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-3xl font-bold text-blue-600">
                    {(explanationData.local.samplePrediction.confidence * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-blue-700">Confidence</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                  <div className="text-3xl font-bold text-green-600">
                    {explanationData.local.samplePrediction.actualClass}
                  </div>
                  <div className="text-sm text-green-700">Actual Class</div>
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-neutral-900">Feature Contributions:</h4>
                {explanationData.local.contributions.map((contrib, index) => (
                  <div key={contrib.feature} className="border border-neutral-200 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-3">
                        <span className="font-medium">{contrib.feature}</span>
                        <span className="text-sm text-neutral-600 bg-neutral-100 px-2 py-1 rounded">
                          {contrib.value}
                        </span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className={`text-sm font-medium ${
                          contrib.contribution > 0 ? 'text-red-600' : 'text-green-600'
                        }`}>
                          {contrib.contribution > 0 ? '+' : ''}{(contrib.contribution * 100).toFixed(1)}%
                        </div>
                      </div>
                    </div>
                    <p className="text-sm text-neutral-600">{contrib.explanation}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fairness' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Demographic Parity */}
              <div className="card">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Demographic Parity</h3>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-green-600">
                    {(explanationData.fairness.demographicParity.score * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-neutral-600">Fairness Score</div>
                </div>
                <div className="space-y-2">
                  {explanationData.fairness.demographicParity.groups.map((group) => (
                    <div key={group.name} className="flex justify-between text-sm">
                      <span>{group.name}</span>
                      <span>{(group.prediction * 100).toFixed(1)}%</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Equal Opportunity */}
              <div className="card">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Equal Opportunity</h3>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-yellow-600">
                    {(explanationData.fairness.equalOpportunity.score * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-neutral-600">Fairness Score</div>
                </div>
                <p className="text-sm text-neutral-600">{explanationData.fairness.equalOpportunity.explanation}</p>
              </div>

              {/* Calibration */}
              <div className="card">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Calibration</h3>
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold text-green-600">
                    {(explanationData.fairness.calibration.score * 100).toFixed(0)}%
                  </div>
                  <div className="text-sm text-neutral-600">Calibration Score</div>
                </div>
                <p className="text-sm text-neutral-600">{explanationData.fairness.calibration.explanation}</p>
              </div>
            </div>

            <div className="card bg-blue-50 border-blue-200">
              <h3 className="text-lg font-semibold text-blue-900 mb-4">Fairness Summary</h3>
              <div className="space-y-3 text-sm text-blue-800">
                <div className="flex items-start space-x-2">
                  <InformationCircleIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>The model shows good demographic parity with minimal bias across gender groups</span>
                </div>
                <div className="flex items-start space-x-2">
                  <InformationCircleIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Some disparity detected in equal opportunity - consider rebalancing training data</span>
                </div>
                <div className="flex items-start space-x-2">
                  <InformationCircleIcon className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                  <span>Model predictions are well-calibrated across different demographic groups</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'ai-insights' && (
          <div className="space-y-6">
            {!aiExplanation && !isGeneratingExplanation && (
              <div className="card text-center py-12">
                <SparklesIcon className="mx-auto h-12 w-12 text-neutral-400 mb-4" />
                <h3 className="text-lg font-medium text-neutral-900 mb-2">Generate AI-Powered Insights</h3>
                <p className="text-neutral-600 mb-6">
                  Get natural language explanations of your model's behavior and recommendations
                </p>
                <button
                  onClick={generateAIInsights}
                  className="btn-primary"
                >
                  Generate Insights
                </button>
              </div>
            )}

            {isGeneratingExplanation && (
              <div className="card text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
                <h3 className="text-lg font-medium text-neutral-900 mb-2">Generating AI Insights...</h3>
                <p className="text-neutral-600">
                  Our AI is analyzing your model and generating human-readable explanations
                </p>
              </div>
            )}

            {aiExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-6"
              >
                {/* Elevator Pitch */}
                <div className="card bg-primary-50 border-primary-200">
                  <h3 className="text-lg font-semibold text-primary-900 mb-3">Elevator Pitch</h3>
                  <p className="text-primary-800 text-lg leading-relaxed">{aiExplanation.elevatorPitch}</p>
                </div>

                {/* Detailed Explanation */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-3">Detailed Explanation</h3>
                  <p className="text-neutral-700 leading-relaxed">{aiExplanation.detailedExplanation}</p>
                </div>

                {/* Key Findings */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Key Findings</h3>
                  <div className="space-y-3">
                    {aiExplanation.keyFindings.map((finding: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3">
                        <div className="w-6 h-6 bg-green-100 text-green-700 rounded-full text-xs flex items-center justify-center font-medium mt-0.5">
                          {index + 1}
                        </div>
                        <p className="text-neutral-700">{finding}</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Recommendations */}
                <div className="card">
                  <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recommendations</h3>
                  <div className="space-y-3">
                    {aiExplanation.recommendations.map((rec: string, index: number) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <LightBulbIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <p className="text-blue-900">{rec}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </motion.div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default ModelExplain
