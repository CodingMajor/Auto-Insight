import React, { useState, useCallback, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useDropzone } from 'react-dropzone'
import { motion } from 'framer-motion'
import {
  CloudArrowUpIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  XMarkIcon,
  SparklesIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline'
import toast from 'react-hot-toast'
import { dataService, projectService } from '../services/api'

interface UploadedFile {
  file: File
  id: string
  status: 'uploading' | 'completed' | 'error'
  progress: number
  preview?: any
  projectId?: string
  datasetId?: string
}

interface Project {
  id: string
  name: string
  description?: string
  problem_type: string
  target_column?: string
  created_at: string
  status: string
}

const StandaloneDataUpload: React.FC = () => {
  const navigate = useNavigate()
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [projects, setProjects] = useState<Project[]>([])
  const [selectedProject, setSelectedProject] = useState<string>('')
  const [isLoadingProjects, setIsLoadingProjects] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    setIsLoadingProjects(true)
    try {
      const response = await projectService.list()
      setProjects(response.data)
    } catch (error: any) {
      console.error('Failed to fetch projects:', error)
      toast.error('Failed to load projects')
    } finally {
      setIsLoadingProjects(false)
    }
  }

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const newFiles: UploadedFile[] = acceptedFiles.map(file => ({
      file,
      id: Math.random().toString(36).substr(2, 9),
      status: 'uploading',
      progress: 0
    }))

    setUploadedFiles(prev => [...prev, ...newFiles])

    // Upload files to backend
    newFiles.forEach(uploadFile => {
      uploadToBackend(uploadFile)
    })
  }, [selectedProject])

  const uploadToBackend = async (uploadFile: UploadedFile) => {
    if (!selectedProject) {
      toast.error('Please select a project first')
      setUploadedFiles(prev => prev.map(f =>
        f.id === uploadFile.id ? { ...f, status: 'error' as const } : f
      ))
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append('file', uploadFile.file)

    try {
      const response = await dataService.upload(selectedProject, uploadFile.file, (progress) => {
        setUploadedFiles(prev => prev.map(f =>
          f.id === uploadFile.id ? { ...f, progress } : f
        ))
      })

      setUploadedFiles(prev => prev.map(f =>
        f.id === uploadFile.id ? {
          ...f,
          status: 'completed' as const,
          progress: 100,
          projectId: selectedProject,
          datasetId: response.data.dataset_id
        } : f
      ))
      toast.success(`${uploadFile.file.name} uploaded successfully!`)

      // Navigate to analysis page with the uploaded dataset
      setTimeout(() => {
        navigate(`/projects/${selectedProject}/eda?dataset=${response.data.dataset_id}`)
      }, 1000)
    } catch (error: any) {
      console.error('Upload error:', error)
      setUploadedFiles(prev => prev.map(f =>
        f.id === uploadFile.id ? { ...f, status: 'error' as const } : f
      ))
      toast.error(error.response?.data?.detail || `Failed to upload ${uploadFile.file.name}`)
    } finally {
      setIsUploading(false)
    }
  }

const simulateUpload = (uploadFile: UploadedFile) => {
    // This function is no longer needed since we're using real uploads
    return
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />
      case 'error':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />
      default:
        return <ArrowPathIcon className="h-5 w-5 text-blue-500 animate-spin" />
    }
  }

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/csv': ['.csv'],
      'application/vnd.ms-excel': ['.xls'],
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
      'application/json': ['.json']
    },
    multiple: true,
    maxSize: 50 * 1024 * 1024 // 50MB
  })

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Upload Your Data</h1>
          <p className="text-lg text-gray-600">Upload datasets for analysis and insights</p>
        </div>

        {/* Project Selection */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Select Project</h3>
          {isLoadingProjects ? (
            <div className="flex items-center space-x-2">
              <ArrowPathIcon className="h-5 w-5 animate-spin text-blue-500" />
              <span className="text-gray-600">Loading projects...</span>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-8">
              <DocumentTextIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 mb-4">No projects found</p>
              <button
                onClick={() => navigate('/projects')}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700"
              >
                Create Project
              </button>
            </div>
          ) : (
            <select
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="">Select a project...</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>
                  {project.name} - {project.problem_type}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 cursor-pointer ${
            isDragActive
              ? 'border-blue-500 bg-blue-50'
              : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
          }`}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
              <CloudArrowUpIcon className="h-8 w-8 text-white" />
            </div>
            <div>
              <p className="text-xl font-semibold text-gray-900 mb-2">
                {isDragActive ? 'Drop your files here' : 'Upload your dataset'}
              </p>
              <p className="text-gray-600">
                Drag and drop your files here, or click to select files
              </p>
              <p className="text-sm text-gray-500 mt-2">
                Supports CSV, Excel (.xls, .xlsx), and JSON files up to 50MB
              </p>
            </div>
          </div>
        </div>

        {/* Upload Progress */}
        {uploadedFiles.length > 0 && (
          <div className="mt-8 bg-white rounded-2xl shadow-lg p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Progress</h3>
            <div className="space-y-4">
              {uploadedFiles.map(file => (
                <motion.div
                  key={file.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex items-center space-x-4 p-4 border border-gray-200 rounded-lg"
                >
                  <div className="flex-shrink-0">
                    {getStatusIcon(file.status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(file.file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                    {file.status === 'uploading' && (
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${file.progress}%` }}
                        ></div>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    <button
                      onClick={() => removeFile(file.id)}
                      className="text-gray-400 hover:text-red-500"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="mt-8 flex justify-between">
          <button
            onClick={() => navigate('/')}
            className="bg-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-400"
          >
            Back to Dashboard
          </button>
          <button
            onClick={() => navigate('/analysis')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            View Analysis
          </button>
        </div>
      </div>
    </div>
  )
}

export default StandaloneDataUpload
