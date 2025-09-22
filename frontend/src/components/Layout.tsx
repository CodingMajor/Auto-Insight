import React, { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  HomeIcon,
  FolderIcon,
  ChartBarIcon,
  CogIcon,
  DocumentTextIcon,
  BeakerIcon,
  LightBulbIcon,
  CloudArrowUpIcon,
  Bars3Icon,
  XMarkIcon,
  SparklesIcon
} from '@heroicons/react/24/outline'
import { motion, AnimatePresence } from 'framer-motion'

interface LayoutProps {
  children: React.ReactNode
}

const navigation = [
  { name: 'Dashboard', href: '/', icon: HomeIcon },
  { name: 'Projects', href: '/projects', icon: FolderIcon },
  { name: 'Analytics', href: '/analysis', icon: ChartBarIcon },
  { name: 'Upload Data', href: '/upload', icon: CloudArrowUpIcon },
  { name: 'EDA Reports', href: '/analysis', icon: DocumentTextIcon },
  { name: 'Model Training', href: '/training', icon: BeakerIcon },
  { name: 'Explainability', href: '/insights', icon: LightBulbIcon },
  { name: 'Settings', href: '/settings', icon: CogIcon },
]

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const location = useLocation()

  return (
    <div className="flex h-screen bg-neutral-50">
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-neutral-600 bg-opacity-75 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-72 bg-white shadow-xl lg:hidden"
            >
              <SidebarContent onClose={() => setSidebarOpen(false)} />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex lg:w-72 lg:flex-col">
        <SidebarContent />
      </div>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top header */}
        <header className="bg-white shadow-sm border-b border-neutral-200">
          <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
            <div className="flex items-center">
              <button
                type="button"
                className="lg:hidden -ml-0.5 -mt-0.5 h-12 w-12 inline-flex items-center justify-center rounded-md text-neutral-500 hover:text-neutral-900 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-primary-500"
                onClick={() => setSidebarOpen(true)}
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <h1 className="ml-4 lg:ml-0 text-2xl font-semibold text-neutral-900">
                Your Intelligence Feed
              </h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-neutral-600">
                <SparklesIcon className="h-4 w-4 text-primary-500" />
                <span>3 articles</span>
                <span className="text-neutral-400">•</span>
                <span>Updated 17:29</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 rounded-full bg-gradient-to-r from-primary-500 to-primary-600 flex items-center justify-center">
                  <span className="text-white text-sm font-medium">G</span>
                </div>
                <span className="hidden sm:block text-sm font-medium text-neutral-700">Guest User</span>
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="py-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  )
}

interface SidebarContentProps {
  onClose?: () => void
}

const SidebarContent: React.FC<SidebarContentProps> = ({ onClose }) => {
  const location = useLocation()

  return (
    <div className="flex flex-col h-full bg-white border-r border-neutral-200">
      {/* Logo and close button */}
      <div className="flex items-center justify-between h-16 px-6 border-b border-neutral-200">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 gradient-bg rounded-lg flex items-center justify-center">
            <SparklesIcon className="h-5 w-5 text-white" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-neutral-900">Auto-Insights</h2>
            <p className="text-xs text-neutral-500">AI News Aggregator</p>
          </div>
        </div>
        
        {onClose && (
          <button
            type="button"
            className="lg:hidden h-6 w-6 text-neutral-400 hover:text-neutral-600"
            onClick={onClose}
          >
            <XMarkIcon className="h-6 w-6" />
          </button>
        )}
      </div>

      {/* Welcome section */}
      <div className="px-6 py-4 bg-accent-50 border-b border-accent-100">
        <div className="accent-gradient-bg rounded-lg p-4 text-center">
          <h3 className="text-lg font-bold text-neutral-900 mb-1">Your Intelligence Feed</h3>
          <p className="text-sm text-neutral-700 mb-3">Welcome back, Guest User</p>
          
          {/* Get Started section */}
          <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 mb-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-neutral-800">🚀 Get Started</span>
              <button className="text-xs bg-white/30 px-2 py-1 rounded text-neutral-800 hover:bg-white/40 transition-colors">
                Set Preferences
              </button>
            </div>
            <p className="text-xs text-neutral-700">
              Set your topic preferences to get personalized article recommendations
            </p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href
          return (
            <Link
              key={item.name}
              to={item.href}
              className={isActive ? 'sidebar-item-active' : 'sidebar-item-inactive'}
              onClick={onClose}
            >
              <item.icon className="mr-3 h-5 w-5 flex-shrink-0" />
              {item.name}
            </Link>
          )
        })}
      </nav>
    </div>
  )
}

export default Layout
