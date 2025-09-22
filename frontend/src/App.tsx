import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import Layout from './components/Layout'
import Dashboard from './pages/NewDashboard'
import Projects from './pages/Projects'
import ProjectDetail from './pages/ProjectDetail'
import DataUpload from './pages/StandaloneDataUpload'
import EDAReport from './pages/StandaloneAnalysis'
import ModelTraining from './pages/ModelTraining'
import ModelExplain from './pages/StandaloneInsights'
import Settings from './pages/Settings'

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-neutral-50">
        <Layout>
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/projects" element={<Projects />} />
            <Route path="/projects/:projectId" element={<ProjectDetail />} />
            <Route path="/projects/:projectId/upload" element={<DataUpload />} />
            <Route path="/projects/:projectId/eda" element={<EDAReport />} />
            <Route path="/projects/:projectId/training" element={<ModelTraining />} />
            <Route path="/upload" element={<DataUpload />} />
            <Route path="/analysis" element={<EDAReport />} />
            <Route path="/insights" element={<ModelExplain />} />
            <Route path="/training" element={<ModelTraining />} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </Layout>
        <Toaster 
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#fff',
              color: '#374151',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            },
          }}
        />
      </div>
    </Router>
  )
}

export default App
