import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeftIcon,
  DocumentTextIcon,
  ChartBarIcon,
  BeakerIcon,
  LightBulbIcon,
  CloudArrowUpIcon,
  PlayIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  EyeIcon,
  ArrowDownTrayIcon
} from '@heroicons/react/24/outline'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'

const ProjectDetail: React.FC = () => {
  const { projectId } = useParams()
  const [activeTab, setActiveTab] = useState('overview')

  // Mock project data
  const project = {
    id: projectId,
    name: 'Customer Churn Prediction',
    description: 'Predict customer churn using historical transaction data and customer behavior patterns',
    problemType: 'classification',
    status: 'completed',
    accuracy: 94.2,
    createdAt: '2024-01-15',
    lastUpdated: '2 hours ago',
    targetColumn: 'churn',
    datasets: [
      { id: '1', name: 'customer_data.csv', rows: 10000, columns: 25, uploadDate: '2024-01-15' },
      { id: '2', name: 'transaction_history.csv', rows: 50000, columns: 12, uploadDate: '2024-01-16' }
    ],
    models: [
      { id: '1', name: 'LightGBM Classifier', accuracy: 94.2, status: 'completed', trainedAt: '2024-01-20' },
      { id: '2', name: 'Random Forest', accuracy: 91.8, status: 'completed', trainedAt: '2024-01-19' },
      { id: '3', name: 'XGBoost', accuracy: 93.1, status: 'completed', trainedAt: '2024-01-18' }
    ]
  }

  const performanceData = [
    { epoch: 1, accuracy: 0.75, loss: 0.65 },
    { epoch: 2, accuracy: 0.82, loss: 0.48 },
    { epoch: 3, accuracy: 0.87, loss: 0.35 },
    { epoch: 4, accuracy: 0.91, loss: 0.28 },
    { epoch: 5, accuracy: 0.94, loss: 0.22 }
  ]

  const tabs = [
    { id: 'overview', name: 'Overview', icon: DocumentTextIcon },
    { id: 'data', name: 'Data', icon: CloudArrowUpIcon },
    { id: 'eda', name: 'EDA', icon: ChartBarIcon },
    { id: 'models', name: 'Models', icon: BeakerIcon },
    { id: 'explain', name: 'Explain', icon: LightBulbIcon }
  ]

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'training':
        return <ClockIcon className="h-5 w-5 text-blue-500 animate-pulse" />
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      default:
        return <DocumentTextIcon className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center space-x-4 mb-4">
          <Link to="/projects" className="p-2 hover:bg-neutral-100 rounded-lg transition-colors">
            <ArrowLeftIcon className="h-5 w-5 text-neutral-600" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">{project.name}</h1>
            <p className="text-neutral-600 mt-1">{project.description}</p>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              {getStatusIcon(project.status)}
              <span className={`badge ${project.status === 'completed' ? 'badge-success' : 'badge-info'}`}>
                {project.status}
              </span>
            </div>
            <div className="text-sm text-neutral-600">
              <span className="font-medium">Type:</span> {project.problemType}
            </div>
            <div className="text-sm text-neutral-600">
              <span className="font-medium">Target:</span> {project.targetColumn}
            </div>
            {project.accuracy && (
              <div className="text-sm text-green-600 font-medium">
                {project.accuracy}% accuracy
              </div>
            )}
          </div>
          
          <div className="flex space-x-3">
            <button className="btn-secondary">
              <ArrowDownTrayIcon className="h-4 w-4 mr-2" />
              Export
            </button>
            <Link to={`/projects/${projectId}/training`} className="btn-primary">
              <PlayIcon className="h-4 w-4 mr-2" />
              Train Model
            </Link>
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
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Project Stats */}
            <div className="lg:col-span-2 space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Project Statistics</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-primary-600">{project.datasets.length}</div>
                    <div className="text-sm text-neutral-600">Datasets</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{project.models.length}</div>
                    <div className="text-sm text-neutral-600">Models</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{project.accuracy}%</div>
                    <div className="text-sm text-neutral-600">Best Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">15</div>
                    <div className="text-sm text-neutral-600">Features</div>
                  </div>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Training Progress</h3>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                      <XAxis dataKey="epoch" stroke="#64748b" />
                      <YAxis stroke="#64748b" />
                      <Tooltip />
                      <Line type="monotone" dataKey="accuracy" stroke="#22c55e" strokeWidth={2} />
                      <Line type="monotone" dataKey="loss" stroke="#ef4444" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="space-y-6">
              <div className="card">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Quick Actions</h3>
                <div className="space-y-3">
                  <Link to={`/projects/${projectId}/upload`} className="block btn-secondary w-full">
                    <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                    Upload Data
                  </Link>
                  <Link to={`/projects/${projectId}/eda`} className="block btn-secondary w-full">
                    <ChartBarIcon className="h-4 w-4 mr-2" />
                    Run EDA
                  </Link>
                  <Link to={`/projects/${projectId}/training`} className="block btn-primary w-full">
                    <BeakerIcon className="h-4 w-4 mr-2" />
                    Train Models
                  </Link>
                  <Link to={`/projects/${projectId}/explain`} className="block btn-secondary w-full">
                    <LightBulbIcon className="h-4 w-4 mr-2" />
                    Explain Results
                  </Link>
                </div>
              </div>

              <div className="card">
                <h3 className="text-lg font-semibold text-neutral-900 mb-4">Recent Activity</h3>
                <div className="space-y-3 text-sm">
                  <div className="flex items-center space-x-3">
                    <CheckCircleIcon className="h-4 w-4 text-green-500" />
                    <span>Model training completed</span>
                    <span className="text-neutral-500">2h ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <DocumentTextIcon className="h-4 w-4 text-blue-500" />
                    <span>EDA report generated</span>
                    <span className="text-neutral-500">1d ago</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CloudArrowUpIcon className="h-4 w-4 text-purple-500" />
                    <span>Dataset uploaded</span>
                    <span className="text-neutral-500">2d ago</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'data' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">Datasets</h3>
              <Link to={`/projects/${projectId}/upload`} className="btn-primary">
                <CloudArrowUpIcon className="h-4 w-4 mr-2" />
                Upload Dataset
              </Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {project.datasets.map((dataset) => (
                <div key={dataset.id} className="card">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-medium text-neutral-900">{dataset.name}</h4>
                    <button className="text-primary-600 hover:text-primary-700">
                      <EyeIcon className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="space-y-2 text-sm text-neutral-600">
                    <div className="flex justify-between">
                      <span>Rows:</span>
                      <span className="font-medium">{dataset.rows.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Columns:</span>
                      <span className="font-medium">{dataset.columns}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uploaded:</span>
                      <span className="font-medium">{dataset.uploadDate}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'models' && (
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-neutral-900">Trained Models</h3>
              <Link to={`/projects/${projectId}/training`} className="btn-primary">
                <BeakerIcon className="h-4 w-4 mr-2" />
                Train New Model
              </Link>
            </div>
            
            <div className="card overflow-hidden">
              <table className="min-w-full divide-y divide-neutral-200">
                <thead className="bg-neutral-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Model</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Accuracy</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Trained</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-neutral-500 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-200">
                  {project.models.map((model) => (
                    <tr key={model.id} className="hover:bg-neutral-50">
                      <td className="px-6 py-4 whitespace-nowrap font-medium text-neutral-900">
                        {model.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-green-600 font-medium">
                        {model.accuracy}%
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="badge badge-success">{model.status}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-neutral-500">
                        {model.trainedAt}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Link 
                          to={`/projects/${projectId}/explain`}
                          className="text-primary-600 hover:text-primary-700"
                        >
                          Explain
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}

export default ProjectDetail
