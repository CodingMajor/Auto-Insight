import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ChartBarIcon,
  DocumentTextIcon,
  LightBulbIcon,
  ArrowTrendingUpIcon,
  ClockIcon,
  ArrowUpIcon,
  CheckCircleIcon,
  ArrowPathIcon,
  ExclamationTriangleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'

interface DashboardStats {
  totalProjects: number
  activeAnalyses: number
  completedInsights: number
  dataProcessed: string
}

interface RecentActivity {
  id: string
  title: string
  description: string
  type: 'analysis' | 'prediction' | 'alert' | 'upload'
  timestamp: string
  status: 'completed' | 'processing' | 'failed'
  impact?: 'high' | 'medium' | 'low'
}

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 6,
    activeAnalyses: 3,
    completedInsights: 24,
    dataProcessed: '2.4 GB'
  })
  
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      title: 'Customer Churn Analysis Complete',
      description: 'Identified key factors contributing to customer churn with 89% accuracy',
      type: 'analysis',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      impact: 'high'
    },
    {
      id: '2',
      title: 'Sales Forecast Updated',
      description: 'Q4 sales projection shows 15% increase based on current trends',
      type: 'prediction',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      status: 'completed',
      impact: 'medium'
    },
    {
      id: '3',
      title: 'New Dataset Processing',
      description: 'Processing customer_data_2024.csv - 45% complete',
      type: 'upload',
      timestamp: new Date(Date.now() - 30 * 60 * 1000).toISOString(),
      status: 'processing',
      impact: 'low'
    }
  ])
  
  const [isLoading, setIsLoading] = useState(false)
  const [lastUpdated, setLastUpdated] = useState(new Date())

  // Fetch real-time dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        
        const statsResponse = await fetch('http://localhost:8000/api/dashboard/stats')
        if (statsResponse.ok) {
          const statsData = await statsResponse.json()
          setStats(statsData)
        }

        const activityResponse = await fetch('http://localhost:8000/api/dashboard/activity')
        if (activityResponse.ok) {
          const activityData = await activityResponse.json()
          setRecentActivity(activityData)
        }
        
        setLastUpdated(new Date())
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
    const interval = setInterval(fetchDashboardData, 30000)
    return () => clearInterval(interval)
  }, [])

  const quickActions = [
    {
      title: 'Upload New Dataset',
      description: 'Start by uploading your data for analysis',
      icon: DocumentTextIcon,
      gradient: 'from-blue-500 to-blue-600',
      action: () => window.location.href = '/upload'
    },
    {
      title: 'View Analysis',
      description: 'Explore EDA results and data insights',
      icon: ChartBarIcon,
      gradient: 'from-green-500 to-green-600',
      action: () => window.location.href = '/analysis'
    },
    {
      title: 'AI Insights',
      description: 'Get AI-powered explanations and recommendations',
      icon: LightBulbIcon,
      gradient: 'from-yellow-500 to-yellow-600',
      action: () => window.location.href = '/insights'
    }
  ]

  const formatTimeAgo = (timestamp: string) => {
    const now = new Date()
    const time = new Date(timestamp)
    const diffInMinutes = Math.floor((now.getTime() - time.getTime()) / (1000 * 60))
    
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`
    const diffInHours = Math.floor(diffInMinutes / 60)
    if (diffInHours < 24) return `${diffInHours}h ago`
    const diffInDays = Math.floor(diffInHours / 24)
    return `${diffInDays}d ago`
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'processing':
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />
      case 'failed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-green-50 to-white">
      {/* Header with Intelligence Feed */}
      <div className="bg-gradient-to-r from-yellow-400 via-green-400 to-green-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Your Intelligence Feed</h1>
              <p className="text-green-100">Welcome back! Transform your data into actionable insights with AI-powered analytics.</p>
              <div className="mt-4 flex items-center space-x-6 text-sm text-white">
                <div className="flex items-center space-x-2">
                  <SparklesIcon className="h-4 w-4" />
                  <span>{stats.completedInsights} insights available</span>
                </div>
                <div className="flex items-center space-x-2">
                  <ClockIcon className="h-4 w-4" />
                  <span>Updated {lastUpdated.toLocaleTimeString()}</span>
                </div>
                {isLoading && (
                  <div className="flex items-center space-x-2">
                    <ArrowPathIcon className="h-4 w-4 animate-spin" />
                    <span>Refreshing...</span>
                  </div>
                )}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-green-100 mb-1">Guest User</div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-300 rounded-full animate-pulse"></div>
                <span className="text-sm text-white">Live Analysis</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-2xl shadow-lg border border-yellow-200 p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Projects</p>
                <p className="text-3xl font-bold text-gray-900">{stats.totalProjects}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-blue-500 to-blue-600 rounded-xl">
                <DocumentTextIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">+12.5%</span>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl shadow-lg border border-green-200 p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Analyses</p>
                <p className="text-3xl font-bold text-gray-900">{stats.activeAnalyses}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-green-500 to-green-600 rounded-xl">
                <ChartBarIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">+8.3%</span>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl shadow-lg border border-yellow-200 p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Insights Generated</p>
                <p className="text-3xl font-bold text-gray-900">{stats.completedInsights}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-yellow-500 to-yellow-600 rounded-xl">
                <LightBulbIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">+15.7%</span>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl shadow-lg border border-green-200 p-6 hover:shadow-xl transition-shadow"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Data Processed</p>
                <p className="text-3xl font-bold text-gray-900">{stats.dataProcessed}</p>
              </div>
              <div className="p-3 bg-gradient-to-r from-purple-500 to-purple-600 rounded-xl">
                <ArrowTrendingUpIcon className="h-6 w-6 text-white" />
              </div>
            </div>
            <div className="mt-4 flex items-center">
              <ArrowUpIcon className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-sm text-green-600 font-medium">+22.1%</span>
              <span className="text-sm text-gray-500 ml-2">vs last month</span>
            </div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-2xl shadow-lg border border-yellow-200 p-8 mb-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Get Started</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {quickActions.map((action, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.05, y: -5 }}
                whileTap={{ scale: 0.95 }}
                onClick={action.action}
                className={`p-6 rounded-2xl bg-gradient-to-r ${action.gradient} text-white text-left hover:shadow-2xl transition-all duration-300 transform`}
              >
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-white/20 rounded-xl">
                    <action.icon className="h-8 w-8" />
                  </div>
                  <div>
                    <div className="font-bold text-lg">{action.title}</div>
                    <div className="text-sm opacity-90 mt-1">{action.description}</div>
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-2xl shadow-lg border border-green-200 p-8"
        >
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <motion.div
                key={activity.id}
                whileHover={{ scale: 1.02 }}
                className="p-6 border border-gray-200 rounded-xl hover:border-green-300 hover:shadow-md transition-all duration-200"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {getStatusIcon(activity.status)}
                    <div>
                      <h3 className="font-semibold text-gray-900">{activity.title}</h3>
                      <p className="text-gray-600 mt-1">{activity.description}</p>
                      <div className="flex items-center space-x-4 mt-2">
                        <span className="text-sm text-gray-500">{formatTimeAgo(activity.timestamp)}</span>
                        {activity.impact && (
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            activity.impact === 'high' ? 'bg-red-100 text-red-800' :
                            activity.impact === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {activity.impact.toUpperCase()} IMPACT
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Dashboard
