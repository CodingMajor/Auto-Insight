import React, { useState } from 'react'
import { motion } from 'framer-motion'
import {
  UserIcon,
  BellIcon,
  ShieldCheckIcon,
  PaintBrushIcon,
  KeyIcon,
  CircleStackIcon,
  CloudIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'

const Settings: React.FC = () => {
  const [activeTab, setActiveTab] = useState('profile')
  const [settings, setSettings] = useState({
    profile: {
      name: 'Guest User',
      email: 'guest@auto-insights.com',
      organization: 'Auto-Insights Demo',
      timezone: 'Asia/Kolkata'
    },
    notifications: {
      emailNotifications: true,
      trainingComplete: true,
      modelAlerts: true,
      weeklyReports: false,
      systemUpdates: true
    },
    security: {
      twoFactorAuth: false,
      sessionTimeout: 30,
      apiKeyRotation: 'monthly'
    },
    preferences: {
      theme: 'light',
      language: 'en',
      defaultChartType: 'interactive',
      autoSave: true
    },
    integrations: {
      geminiApiKey: 'AIzaSyCU8Is4Xj0CP3JUACrC4RPvpcgdswz08lM',
      databaseUrl: 'postgresql://localhost:5432/auto_insights',
      minioEndpoint: 'localhost:9000'
    }
  })

  const tabs = [
    { id: 'profile', name: 'Profile', icon: UserIcon },
    { id: 'notifications', name: 'Notifications', icon: BellIcon },
    { id: 'security', name: 'Security', icon: ShieldCheckIcon },
    { id: 'preferences', name: 'Preferences', icon: PaintBrushIcon },
    { id: 'integrations', name: 'Integrations', icon: CloudIcon }
  ]

  const handleSave = (section: string) => {
    toast.success(`${section} settings saved successfully!`)
  }

  const handleSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [key]: value
      }
    }))
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-neutral-900">Settings</h1>
        <p className="text-neutral-600 mt-1">Manage your account and application preferences</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <div className="card sticky top-6">
            <nav className="space-y-1">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full flex items-center space-x-3 px-3 py-2 text-left rounded-lg transition-colors ${
                    activeTab === tab.id
                      ? 'bg-primary-50 text-primary-700 border border-primary-200'
                      : 'text-neutral-600 hover:bg-neutral-50 hover:text-neutral-900'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-3">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {activeTab === 'profile' && (
              <div className="card">
                <h3 className="text-xl font-semibold text-neutral-900 mb-6">Profile Information</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Full Name
                      </label>
                      <input
                        type="text"
                        value={settings.profile.name}
                        onChange={(e) => handleSettingChange('profile', 'name', e.target.value)}
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={settings.profile.email}
                        onChange={(e) => handleSettingChange('profile', 'email', e.target.value)}
                        className="input-field"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Organization
                      </label>
                      <input
                        type="text"
                        value={settings.profile.organization}
                        onChange={(e) => handleSettingChange('profile', 'organization', e.target.value)}
                        className="input-field"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Timezone
                      </label>
                      <select
                        value={settings.profile.timezone}
                        onChange={(e) => handleSettingChange('profile', 'timezone', e.target.value)}
                        className="input-field"
                      >
                        <option value="Asia/Kolkata">Asia/Kolkata (IST)</option>
                        <option value="America/New_York">America/New_York (EST)</option>
                        <option value="Europe/London">Europe/London (GMT)</option>
                        <option value="Asia/Tokyo">Asia/Tokyo (JST)</option>
                      </select>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSave('Profile')}
                      className="btn-primary"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'notifications' && (
              <div className="card">
                <h3 className="text-xl font-semibold text-neutral-900 mb-6">Notification Preferences</h3>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    {Object.entries(settings.notifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between py-3">
                        <div>
                          <h4 className="font-medium text-neutral-900 capitalize">
                            {key.replace(/([A-Z])/g, ' $1').trim()}
                          </h4>
                          <p className="text-sm text-neutral-600">
                            {key === 'emailNotifications' && 'Receive email notifications for important updates'}
                            {key === 'trainingComplete' && 'Get notified when model training is complete'}
                            {key === 'modelAlerts' && 'Receive alerts for model performance issues'}
                            {key === 'weeklyReports' && 'Get weekly summary reports via email'}
                            {key === 'systemUpdates' && 'Notifications about system updates and maintenance'}
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={value as boolean}
                            onChange={(e) => handleSettingChange('notifications', key, e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-neutral-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                        </label>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSave('Notification')}
                      className="btn-primary"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'security' && (
              <div className="card">
                <h3 className="text-xl font-semibold text-neutral-900 mb-6">Security Settings</h3>
                
                <div className="space-y-6">
                  <div className="flex items-center justify-between py-4 border-b border-neutral-200">
                    <div>
                      <h4 className="font-medium text-neutral-900">Two-Factor Authentication</h4>
                      <p className="text-sm text-neutral-600">Add an extra layer of security to your account</p>
                    </div>
                    <div className="flex items-center space-x-3">
                      {settings.security.twoFactorAuth ? (
                        <span className="badge badge-success">Enabled</span>
                      ) : (
                        <span className="badge badge-warning">Disabled</span>
                      )}
                      <button
                        onClick={() => handleSettingChange('security', 'twoFactorAuth', !settings.security.twoFactorAuth)}
                        className="btn-secondary"
                      >
                        {settings.security.twoFactorAuth ? 'Disable' : 'Enable'}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      Session Timeout (minutes)
                    </label>
                    <select
                      value={settings.security.sessionTimeout}
                      onChange={(e) => handleSettingChange('security', 'sessionTimeout', Number(e.target.value))}
                      className="input-field w-48"
                    >
                      <option value={15}>15 minutes</option>
                      <option value={30}>30 minutes</option>
                      <option value={60}>1 hour</option>
                      <option value={120}>2 hours</option>
                      <option value={480}>8 hours</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-2">
                      API Key Rotation
                    </label>
                    <select
                      value={settings.security.apiKeyRotation}
                      onChange={(e) => handleSettingChange('security', 'apiKeyRotation', e.target.value)}
                      className="input-field w-48"
                    >
                      <option value="weekly">Weekly</option>
                      <option value="monthly">Monthly</option>
                      <option value="quarterly">Quarterly</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSave('Security')}
                      className="btn-primary"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'preferences' && (
              <div className="card">
                <h3 className="text-xl font-semibold text-neutral-900 mb-6">Application Preferences</h3>
                
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Theme
                      </label>
                      <select
                        value={settings.preferences.theme}
                        onChange={(e) => handleSettingChange('preferences', 'theme', e.target.value)}
                        className="input-field"
                      >
                        <option value="light">Light</option>
                        <option value="dark">Dark</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Language
                      </label>
                      <select
                        value={settings.preferences.language}
                        onChange={(e) => handleSettingChange('preferences', 'language', e.target.value)}
                        className="input-field"
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="hi">Hindi</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        Default Chart Type
                      </label>
                      <select
                        value={settings.preferences.defaultChartType}
                        onChange={(e) => handleSettingChange('preferences', 'defaultChartType', e.target.value)}
                        className="input-field"
                      >
                        <option value="interactive">Interactive</option>
                        <option value="static">Static</option>
                        <option value="animated">Animated</option>
                      </select>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <input
                        type="checkbox"
                        id="autoSave"
                        checked={settings.preferences.autoSave}
                        onChange={(e) => handleSettingChange('preferences', 'autoSave', e.target.checked)}
                        className="rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
                      />
                      <label htmlFor="autoSave" className="text-sm font-medium text-neutral-700">
                        Enable Auto-save
                      </label>
                    </div>
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={() => handleSave('Preferences')}
                      className="btn-primary"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'integrations' && (
              <div className="space-y-6">
                <div className="card">
                  <h3 className="text-xl font-semibold text-neutral-900 mb-6">API Integrations</h3>
                  
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        <div className="flex items-center space-x-2">
                          <KeyIcon className="h-4 w-4" />
                          <span>Gemini API Key</span>
                        </div>
                      </label>
                      <div className="flex space-x-3">
                        <input
                          type="password"
                          value={settings.integrations.geminiApiKey}
                          onChange={(e) => handleSettingChange('integrations', 'geminiApiKey', e.target.value)}
                          className="input-field flex-1"
                          placeholder="Enter your Gemini API key"
                        />
                        <button className="btn-secondary">Test</button>
                      </div>
                      <p className="text-xs text-neutral-600 mt-1">
                        Used for AI-powered explanations and natural language generation
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        <div className="flex items-center space-x-2">
                          <CircleStackIcon className="h-4 w-4" />
                          <span>Database URL</span>
                        </div>
                      </label>
                      <input
                        type="text"
                        value={settings.integrations.databaseUrl}
                        onChange={(e) => handleSettingChange('integrations', 'databaseUrl', e.target.value)}
                        className="input-field"
                        placeholder="postgresql://user:password@host:port/database"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-2">
                        <div className="flex items-center space-x-2">
                          <CloudIcon className="h-4 w-4" />
                          <span>MinIO Endpoint</span>
                        </div>
                      </label>
                      <input
                        type="text"
                        value={settings.integrations.minioEndpoint}
                        onChange={(e) => handleSettingChange('integrations', 'minioEndpoint', e.target.value)}
                        className="input-field"
                        placeholder="localhost:9000"
                      />
                    </div>

                    <div className="flex justify-end">
                      <button
                        onClick={() => handleSave('Integration')}
                        className="btn-primary"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>

                <div className="card bg-green-50 border-green-200">
                  <div className="flex items-center space-x-3 mb-4">
                    <CheckCircleIcon className="h-6 w-6 text-green-600" />
                    <h3 className="text-lg font-semibold text-green-900">Integration Status</h3>
                  </div>
                  
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-green-800">Gemini AI</span>
                      <span className="badge badge-success">Connected</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-green-800">Database</span>
                      <span className="badge badge-success">Connected</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-green-800">Object Storage</span>
                      <span className="badge badge-success">Connected</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  )
}

export default Settings
