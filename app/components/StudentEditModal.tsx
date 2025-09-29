'use client'

import { useState, useEffect } from 'react'
import { Modal } from './Modal'
import { countiesByRegion, regionNames } from '../data/kenyan-counties'
import { SupabaseService } from '../services/supabaseService'

interface Student {
  id: string
  fullName: string
  admissionNumber: string
  email: string
  phone: string
  course: string
  status: 'Accepted' | 'Rejected' | 'Pending'
  kcseGrade?: string
  location?: string
  appliedAt?: string
  source?: string
}

interface StudentEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (student: Student) => void
  student: Student | null
  isLoading?: boolean
}

const statuses: Array<'Accepted' | 'Rejected' | 'Pending'> = ['Pending', 'Accepted', 'Rejected']

export function StudentEditModal({ 
  isOpen, 
  onClose, 
  onSave, 
  student, 
  isLoading = false 
}: StudentEditModalProps) {
  const [formData, setFormData] = useState<Student>({
    id: '',
    fullName: '',
    admissionNumber: '',
    email: '',
    phone: '',
    course: '',
    status: 'Pending',
    kcseGrade: '',
    location: '',
    appliedAt: '',
    source: ''
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [availableCourses, setAvailableCourses] = useState<string[]>([])

  // Load available courses from Supabase
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const courses = await SupabaseService.getCourses()
        if (courses.length > 0) {
          const courseNames = courses.map(course => course.name)
          setAvailableCourses(courseNames)
        } else {
          // Fallback to default courses if none found
          setAvailableCourses([
            'Business Administration',
            'Computer Science',
            'Information Technology',
            'Public Health',
            'Education',
            'Engineering',
            'Other'
          ])
        }
      } catch (error) {
        console.error('Error loading courses from Supabase in StudentEditModal:', error)
        // Fallback courses
        setAvailableCourses([
          'Business Administration',
          'Computer Science',
          'Information Technology',
          'Public Health',
          'Education',
          'Engineering',
          'Other'
        ])
      }
    }
    
    if (isOpen) {
      loadCourses()
    }
  }, [isOpen]) // Reload courses when modal opens

  // Populate form when student changes
  useEffect(() => {
    if (student && isOpen) {
      setFormData(student)
      setErrors({})
    }
  }, [student, isOpen])

  // Reset form when modal closes
  useEffect(() => {
    if (!isOpen) {
      setFormData({
        id: '',
        fullName: '',
        admissionNumber: '',
        email: '',
        phone: '',
        course: '',
        status: 'Pending',
        kcseGrade: '',
        location: '',
        appliedAt: '',
        source: ''
      })
      setErrors({})
    }
  }, [isOpen])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const validateForm = async (): Promise<boolean> => {
    const newErrors: Record<string, string> = {}

    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full name is required'
    }

    if (!formData.admissionNumber.trim()) {
      newErrors.admissionNumber = 'Admission number is required'
    }

    // Email is optional, but if provided, it should be valid and unique
    if (formData.email.trim()) {
      if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Email is invalid'
      } else {
        // Check for duplicate email (only if editing a different student or creating new)
        try {
          const emailExists = await SupabaseService.checkEmailExists(formData.email, formData.id || undefined)
          if (emailExists) {
            newErrors.email = 'This email address is already used by another student'
          }
        } catch (error) {
          console.error('Error checking email duplication:', error)
        }
      }
    }

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    }

    if (!formData.course.trim()) {
      newErrors.course = 'Course is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    const isValid = await validateForm()
    if (!isValid) {
      return
    }

    onSave(formData)
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={student ? 'Edit Student' : 'Add Student'}
      size="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Personal Information Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
            Personal Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name *
              </label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.fullName ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="Enter full name"
              />
              {errors.fullName && (
                <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
              )}
            </div>

            <div>
              <label htmlFor="admissionNumber" className="block text-sm font-medium text-gray-700 mb-1">
                Admission Number *
              </label>
              <input
                type="text"
                id="admissionNumber"
                name="admissionNumber"
                value={formData.admissionNumber}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.admissionNumber ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="e.g., EAVI/2025/001"
              />
              {errors.admissionNumber && (
                <p className="mt-1 text-sm text-red-600">{errors.admissionNumber}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
            Contact Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address (optional)
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="student@example.com (optional - needed for email notifications)"
              />
              {errors.email && (
                <p className="mt-1 text-sm text-red-600">{errors.email}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                Phone Number *
              </label>
              <input
                type="tel"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
                placeholder="+254 700 000 000"
              />
              {errors.phone && (
                <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
              )}
            </div>
          </div>
          
          {/* Email notification info */}
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0">
                <svg className="w-4 h-4 text-blue-600 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <div>
                <p className="text-sm text-blue-800">
                  <strong>Email Notifications:</strong> If you provide an email address, the student will automatically receive:
                </p>
                <ul className="mt-2 text-sm text-blue-700 space-y-1">
                  <li>• Admission letter with PDF attachment when approved</li>
                  <li>• Status update notifications</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* Academic Information Section */}
        <div>
          <h4 className="text-sm font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
            Academic Information
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-1">
                Course *
              </label>
              <select
                id="course"
                name="course"
                value={formData.course}
                onChange={handleInputChange}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.course ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              >
                <option value="">Select a course</option>
                {availableCourses.map(course => (
                  <option key={course} value={course}>{course}</option>
                ))}
              </select>
              {errors.course && (
                <p className="mt-1 text-sm text-red-600">{errors.course}</p>
              )}
            </div>

            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {statuses.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <div>
              <label htmlFor="kcseGrade" className="block text-sm font-medium text-gray-700 mb-1">
                KCSE Grade
              </label>
              <input
                type="text"
                id="kcseGrade"
                name="kcseGrade"
                value={formData.kcseGrade || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., B+, A-, C"
              />
            </div>

            <div>
              <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
                County/Location
              </label>
              <select
                id="location"
                name="location"
                value={formData.location || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select county</option>
                {regionNames.map(regionName => (
                  <optgroup key={regionName} label={regionName}>
                    {countiesByRegion[regionName].map(county => (
                      <option key={county.value} value={county.value}>
                        {county.label}
                      </option>
                    ))}
                  </optgroup>
                ))}
                <option value="Other">Other (Outside Kenya)</option>
              </select>
            </div>
          </div>
        </div>

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
            <span>{student ? 'Update Student' : 'Add Student'}</span>
          </button>
        </div>
      </form>
    </Modal>
  )
}