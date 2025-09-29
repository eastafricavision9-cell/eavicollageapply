'use client'

import { useState, useEffect } from 'react'
import { Modal } from './Modal'

interface Course {
  id: string
  name: string
  feeBalance: number
  feePerYear: number
  createdAt: string
}

interface CourseEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (course: Course) => void
  course: Course | null
  isLoading?: boolean
}

export function CourseEditModal({ 
  isOpen, 
  onClose, 
  onSave, 
  course, 
  isLoading = false 
}: CourseEditModalProps) {
  const [formData, setFormData] = useState<Course>({
    id: '',
    name: '',
    feeBalance: 0,
    feePerYear: 0,
    createdAt: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Populate form when course changes
  useEffect(() => {
    if (course && isOpen) {
      setFormData(course)
      setErrors({})
    }
  }, [course, isOpen])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        id: '',
        name: '',
        feeBalance: 0,
        feePerYear: 0,
        createdAt: ''
      })
      setErrors({})
    }
  }, [isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: name === 'feeBalance' || name === 'feePerYear' ? Number(value) || 0 : value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Course name is required'
    }

    if (formData.feeBalance < 0) {
      newErrors.feeBalance = 'Fee balance cannot be negative'
    }

    if (formData.feePerYear <= 0) {
      newErrors.feePerYear = 'Fee per year must be greater than 0'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      return
    }

    const courseData = {
      ...formData,
      id: course?.id || Date.now().toString(),
      createdAt: course?.createdAt || new Date().toISOString()
    }

    onSave(courseData)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={course ? 'Edit Course' : 'Add Course'}
      size="md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Course Information */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
            Course Information
          </h4>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Course Name *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter course name"
              />
              {errors.name && (
                <p className="mt-1 text-sm text-red-600">{errors.name}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="feeBalance" className="block text-sm font-medium text-gray-700 mb-1">
                  Fee Balance (KES)
                </label>
                <input
                  type="number"
                  id="feeBalance"
                  name="feeBalance"
                  value={formData.feeBalance}
                  onChange={handleInputChange}
                  min="0"
                  step="1000"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.feeBalance ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="0"
                />
                {errors.feeBalance && (
                  <p className="mt-1 text-sm text-red-600">{errors.feeBalance}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Current outstanding balance for this course
                </p>
              </div>

              <div>
                <label htmlFor="feePerYear" className="block text-sm font-medium text-gray-700 mb-1">
                  Fee Per Year (KES) *
                </label>
                <input
                  type="number"
                  id="feePerYear"
                  name="feePerYear"
                  value={formData.feePerYear}
                  onChange={handleInputChange}
                  min="1"
                  step="1000"
                  className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                    errors.feePerYear ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="1000000"
                />
                {errors.feePerYear && (
                  <p className="mt-1 text-sm text-red-600">{errors.feePerYear}</p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  Annual tuition fee for this course
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        {formData.name && formData.feePerYear > 0 && (
          <div className="bg-gray-50 rounded-lg p-4">
            <h5 className="text-sm font-medium text-gray-900 mb-2">Preview</h5>
            <div className="bg-white rounded-md border border-gray-200 p-3">
              <h6 className="font-semibold text-gray-900">{formData.name}</h6>
              <div className="space-y-1 text-sm text-gray-600 mt-1">
                <p>Fee Balance: <span className="font-medium text-green-600">KES {formData.feeBalance.toLocaleString()}</span></p>
                <p>Fee/Year: <span className="font-medium text-blue-600">KES {formData.feePerYear.toLocaleString()}</span></p>
              </div>
            </div>
          </div>
        )}

        {/* Form Actions */}
        <div className="flex justify-end space-x-3 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {isLoading && (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
            )}
            <span>{course ? 'Update Course' : 'Add Course'}</span>
          </button>
        </div>
      </form>
    </Modal>
  )
}