import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  PlusIcon,
  MagnifyingGlassIcon,
  EllipsisVerticalIcon,
  CalendarIcon,
  ChartBarIcon,
  BeakerIcon,
  CheckCircleIcon,
  ClockIcon,
  ExclamationTriangleIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline'
import { Menu, Transition } from '@headlessui/react'
import { Fragment } from 'react'
import toast from 'react-hot-toast'

interface ProjectApi {
  id: string
  name: string
  description?: string
  problem_type: string
  target_column?: string
  created_at: string
  status: 'created' | 'training' | 'completed' | 'failed'
}

type Project = ProjectApi

const Projects: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterType, setFilterType] = useState<string>('all')
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    name: '',
    description: '',
    problem_type: 'classification',
    target_column: ''
  })
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    fetchProjects()
  }, [])

  const fetchProjects = async () => {
    try {
      setIsLoading(true)
      const res = await fetch('http://localhost:8000/api/projects')
      if (!res.ok) throw new Error('Failed to fetch projects')
      const data: Project[] = await res.json()
      setProjects(data)
    } catch (e) {
      console.error(e)
      toast.error('Could not load projects from backend')
    } finally {
      setIsLoading(false)
    }
  }

  const filteredProjects = projects.filter(project => {
    const matchesSearch = project.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (project.description || '').toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = filterStatus === 'all' || project.status === filterStatus
    const matchesType = filterType === 'all' || project.problem_type === filterType
    
    return matchesSearch && matchesStatus && matchesType
  })

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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return 'badge-success'
      case 'training':
        return 'badge-info'
      case 'failed':
        return 'badge-warning'
      default:
        return 'badge'
    }
  }

  const getProblemTypeIcon = (type: string) => {
    switch (type) {
      case 'classification':
      case 'regression':
        return <ChartBarIcon className="h-5 w-5" />
      case 'forecasting':
        return <CalendarIcon className="h-5 w-5" />
      case 'nlp':
        return <DocumentTextIcon className="h-5 w-5" />
      case 'cv':
        return <BeakerIcon className="h-5 w-5" />
      default:
        return <ChartBarIcon className="h-5 w-5" />
    }
  }

  const handleDeleteProject = (projectId: string) => {
    setProjects(projects.filter(p => p.id !== projectId))
    toast.success('Project removed (local only)')
  }

  const createProject = async () => {
    try {
      if (!createForm.name.trim()) {
        toast.error('Project name is required')
        return
      }
      const res = await fetch('http://localhost:8000/api/projects', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: createForm.name,
          description: createForm.description || undefined,
          problem_type: createForm.problem_type,
          target_column: createForm.target_column || undefined,
          success_criteria: undefined
        })
      })
      if (!res.ok) throw new Error(await res.text())
      toast.success('Project created')
      setShowCreateModal(false)
      setCreateForm({ name: '', description: '', problem_type: 'classification', target_column: '' })
      fetchProjects()
    } catch (e) {
      console.error(e)
      toast.error('Failed to create project')
    }
  }

  return (
    <div className="px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-neutral-900">Projects</h1>
            <p className="mt-2 text-neutral-600">
              Manage your machine learning projects and experiments
            </p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center space-x-2"
          >
            <PlusIcon className="h-5 w-5" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col sm:flex-row gap-4">
        <div className="flex-1 relative">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-neutral-400" />
          <input
            type="text"
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="input-field pl-10"
          />
        </div>
        
        <div className="flex space-x-3">
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Status</option>
            <option value="created">Created</option>
            <option value="training">Training</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>
          
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="input-field w-auto"
          >
            <option value="all">All Types</option>
            <option value="classification">Classification</option>
            <option value="regression">Regression</option>
            <option value="forecasting">Forecasting</option>
            <option value="nlp">NLP</option>
            <option value="cv">Computer Vision</option>
          </select>
        </div>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProjects.map((project, index) => (
          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="card-hover group"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-primary-50 rounded-lg">
                  {getProblemTypeIcon(project.problem_type)}
                </div>
                <div>
                  <h3 className="font-semibold text-neutral-900 group-hover:text-primary-600 transition-colors">
                    {project.name}
                  </h3>
                  <p className="text-sm text-neutral-500 capitalize">{project.problem_type}</p>
                </div>
              </div>
              
              <Menu as="div" className="relative">
                <Menu.Button className="p-1 rounded-md hover:bg-neutral-100">
                  <EllipsisVerticalIcon className="h-5 w-5 text-neutral-400" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                    <div className="py-1">
                      <Menu.Item>
                        {({ active }) => (
                          <Link
                            to={`/projects/${project.id}`}
                            className={`${active ? 'bg-neutral-50' : ''} block px-4 py-2 text-sm text-neutral-700`}
                          >
                            View Details
                          </Link>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            className={`${active ? 'bg-neutral-50' : ''} block w-full text-left px-4 py-2 text-sm text-neutral-700`}
                          >
                            Edit Project
                          </button>
                        )}
                      </Menu.Item>
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={() => handleDeleteProject(project.id)}
                            className={`${active ? 'bg-red-50 text-red-700' : 'text-red-600'} block w-full text-left px-4 py-2 text-sm`}
                          >
                            Delete Project
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>

            <p className="text-sm text-neutral-600 mb-4 line-clamp-2">
              {project.description || 'No description'}
            </p>

            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(project.status)}
                <span className={`badge ${getStatusBadge(project.status)}`}>
                  {project.status}
                </span>
              </div>
              <span className="text-sm text-neutral-500">{new Date(project.created_at).toLocaleDateString()}</span>
            </div>

            <div className="flex items-center justify-between text-sm text-neutral-500 mb-4"></div>

            <Link
              to={`/projects/${project.id}`}
              className="block w-full text-center btn-secondary"
            >
              View Project
            </Link>
          </motion.div>
        ))}
      </div>

      {filteredProjects.length === 0 && (
        <div className="text-center py-12">
          <DocumentTextIcon className="mx-auto h-12 w-12 text-neutral-400" />
          <h3 className="mt-2 text-sm font-medium text-neutral-900">No projects found</h3>
          <p className="mt-1 text-sm text-neutral-500">
            {searchTerm || filterStatus !== 'all' || filterType !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Get started by creating a new project'}
          </p>
          {!searchTerm && filterStatus === 'all' && filterType === 'all' && (
            <div className="mt-6">
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create your first project
              </button>
            </div>
          )}
        </div>
      )}

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 overflow-y-auto">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-neutral-500 opacity-75"></div>
            </div>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <h3 className="text-lg leading-6 font-medium text-neutral-900 mb-4">Create New Project</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Name</label>
                    <input className="input-field" value={createForm.name} onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })} />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 mb-1">Description</label>
                    <textarea className="input-field" rows={3} value={createForm.description} onChange={(e) => setCreateForm({ ...createForm, description: e.target.value })} />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Problem Type</label>
                      <select className="input-field" value={createForm.problem_type} onChange={(e) => setCreateForm({ ...createForm, problem_type: e.target.value })}>
                        <option value="classification">Classification</option>
                        <option value="regression">Regression</option>
                        <option value="forecasting">Forecasting</option>
                        <option value="nlp">NLP</option>
                        <option value="cv">Computer Vision</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-700 mb-1">Target Column (optional)</label>
                      <input className="input-field" value={createForm.target_column} onChange={(e) => setCreateForm({ ...createForm, target_column: e.target.value })} />
                    </div>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  className="btn-primary sm:ml-3"
                  onClick={createProject}
                >
                  Create Project
                </button>
                <button
                  type="button"
                  className="btn-secondary mt-3 sm:mt-0"
                  onClick={() => setShowCreateModal(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Projects
