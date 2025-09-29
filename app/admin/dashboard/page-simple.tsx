'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SupabaseService } from '../../services/supabaseService'

// Types
type Status = 'Accepted' | 'Rejected' | 'Pending'

type Student = {
  id: string
  fullName: string
  admissionNumber: string
  email: string
  phone: string
  course: string
  status: Status
}

type Course = {
  id: string
  name: string
  feeBalance: number
  feePerYear: number
}

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [reportingDate, setReportingDate] = useState('')
  const [approvalMode, setApprovalMode] = useState<'manual' | 'automatic'>('manual')
  const [autoApprovalDelay, setAutoApprovalDelay] = useState(5)

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        console.log('Loading data from Supabase...')
        
        // Load students
        const supabaseStudents = await SupabaseService.getStudents()
        console.log('Students loaded:', supabaseStudents.length)
        
        const formattedStudents = supabaseStudents.map(student => ({
          id: student.id,
          fullName: student.full_name,
          admissionNumber: student.admission_number,
          email: student.email || '',
          phone: student.phone,
          course: student.course,
          status: student.status as Status
        }))
        
        setStudents(formattedStudents)
        
        // Load courses
        const supabaseCourses = await SupabaseService.getCourses()
        console.log('Courses loaded:', supabaseCourses.length)
        
        const formattedCourses = supabaseCourses.map(course => ({
          id: course.id,
          name: course.name,
          feeBalance: course.fee_balance,
          feePerYear: course.fee_per_year
        }))
        
        setCourses(formattedCourses)
        
        // Load settings
        const reportingDateSetting = await SupabaseService.getSetting('reporting_date')
        if (reportingDateSetting?.value) {
          setReportingDate(reportingDateSetting.value)
        }
        
        const approvalModeSetting = await SupabaseService.getSetting('approval_mode')
        if (approvalModeSetting?.value) {
          setApprovalMode(approvalModeSetting.value as 'manual' | 'automatic')
        }
        
        const delaySettings = await SupabaseService.getSetting('auto_approval_delay')
        if (delaySettings?.value) {
          setAutoApprovalDelay(parseInt(delaySettings.value))
        }
        
      } catch (error) {
        console.error('Error loading data:', error)
        setError('Failed to load data. Please refresh the page.')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  const updateStudentStatus = async (id: string, status: Status) => {
    try {
      await SupabaseService.updateStudent(id, { status })
      setStudents(students.map(s => s.id === id ? { ...s, status } : s))
    } catch (error) {
      console.error('Error updating student:', error)
      alert('Failed to update student status')
    }
  }

  const saveReportingDate = async () => {
    try {
      await SupabaseService.setSetting('reporting_date', reportingDate)
      alert('Reporting date saved!')
    } catch (error) {
      console.error('Error saving reporting date:', error)
      alert('Failed to save reporting date')
    }
  }

  const saveApprovalMode = async () => {
    try {
      await SupabaseService.setSetting('approval_mode', approvalMode)
      await SupabaseService.setSetting('auto_approval_delay', autoApprovalDelay.toString())
      alert('Approval settings saved!')
    } catch (error) {
      console.error('Error saving approval settings:', error)
      alert('Failed to save approval settings')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Refresh Page
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">EAVI Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
              >
                View Application Form
              </Link>
              <Link
                href="/admin/login"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
              >
                Logout
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl font-bold text-blue-600">{students.length}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-gray-500 truncate">Total Students</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl font-bold text-yellow-600">
                    {students.filter(s => s.status === 'Pending').length}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-gray-500 truncate">Pending</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl font-bold text-green-600">
                    {students.filter(s => s.status === 'Accepted').length}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-gray-500 truncate">Accepted</div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="bg-white overflow-hidden shadow rounded-lg">
            <div className="p-5">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-2xl font-bold text-red-600">
                    {students.filter(s => s.status === 'Rejected').length}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-sm font-medium text-gray-500 truncate">Rejected</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Settings</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Reporting Date</label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={reportingDate}
                    onChange={(e) => setReportingDate(e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md px-3 py-2"
                  />
                  <button
                    onClick={saveReportingDate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                  >
                    Save
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Approval Mode</label>
                <div className="flex space-x-4 mb-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="manual"
                      checked={approvalMode === 'manual'}
                      onChange={(e) => setApprovalMode(e.target.value as 'manual' | 'automatic')}
                      className="mr-2"
                    />
                    Manual
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="automatic"
                      checked={approvalMode === 'automatic'}
                      onChange={(e) => setApprovalMode(e.target.value as 'manual' | 'automatic')}
                      className="mr-2"
                    />
                    Automatic
                  </label>
                </div>
                
                {approvalMode === 'automatic' && (
                  <div className="mb-2">
                    <label className="block text-xs text-gray-600 mb-1">Auto-approval delay (minutes)</label>
                    <input
                      type="number"
                      value={autoApprovalDelay}
                      onChange={(e) => setAutoApprovalDelay(parseInt(e.target.value))}
                      className="w-20 border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                )}
                
                <button
                  onClick={saveApprovalMode}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Courses */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Courses ({courses.length})</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(course => (
                <div key={course.id} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900">{course.name}</h4>
                  <p className="text-sm text-gray-600 mt-1">
                    Fee Balance: KES {course.feeBalance.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">
                    Fee Per Year: KES {course.feePerYear.toLocaleString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Students */}
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Students ({students.length})</h3>
            
            {students.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No students found.</p>
                <p className="text-sm text-gray-400 mt-2">Students will appear here when they submit applications.</p>
              </div>
            ) : (
              <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Contact
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Course
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {students.map(student => (
                      <tr key={student.id}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                            <div className="text-sm text-gray-500">{student.admissionNumber}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900">{student.email}</div>
                            <div className="text-sm text-gray-500">{student.phone}</div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{student.course}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                            student.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                            student.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {student.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {student.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => updateStudentStatus(student.id, 'Accepted')}
                                className="text-green-600 hover:text-green-900"
                              >
                                Accept
                              </button>
                              <button
                                onClick={() => updateStudentStatus(student.id, 'Rejected')}
                                className="text-red-600 hover:text-red-900"
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {student.status === 'Accepted' && (
                            <button
                              onClick={() => updateStudentStatus(student.id, 'Pending')}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              Mark Pending
                            </button>
                          )}
                          {student.status === 'Rejected' && (
                            <button
                              onClick={() => updateStudentStatus(student.id, 'Pending')}
                              className="text-yellow-600 hover:text-yellow-900"
                            >
                              Mark Pending
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}