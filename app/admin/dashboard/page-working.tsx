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
  appliedAt?: string
  source?: string
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
        setError(null)
        console.log('🚀 Loading data from Supabase...')
        
        // Load courses first
        try {
          const supabaseCourses = await SupabaseService.getCourses()
          console.log('✅ Courses loaded:', supabaseCourses.length)
          
          const formattedCourses = supabaseCourses.map(course => ({
            id: course.id,
            name: course.name,
            feeBalance: course.fee_balance || 0,
            feePerYear: course.fee_per_year || 0
          }))
          
          setCourses(formattedCourses)
        } catch (courseError) {
          console.error('Course loading error:', courseError)
        }
        
        // Load students
        try {
          const supabaseStudents = await SupabaseService.getStudents()
          console.log('✅ Students loaded:', supabaseStudents.length)
          
          const formattedStudents = supabaseStudents.map(student => ({
            id: student.id,
            fullName: student.full_name,
            admissionNumber: student.admission_number,
            email: student.email || '',
            phone: student.phone,
            course: student.course,
            status: student.status as Status,
            appliedAt: student.applied_at,
            source: student.source || 'manual'
          }))
          
          setStudents(formattedStudents)
        } catch (studentError) {
          console.error('Student loading error:', studentError)
        }
        
        // Load settings
        try {
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
        } catch (settingsError) {
          console.error('Settings loading error:', settingsError)
        }
        
        console.log('🎉 Data loading completed!')
        
      } catch (error) {
        console.error('Fatal error loading data:', error)
        setError('Failed to load dashboard data. Please check your connection.')
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
      console.log(`✅ Student ${id} status updated to ${status}`)
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
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-700 text-lg">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-800 mb-2">Dashboard Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 font-medium"
          >
            Refresh Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <div className="text-3xl mr-3">🎓</div>
              <h1 className="text-3xl font-bold text-gray-900">EAVI Admin Dashboard</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Link
                href="/"
                className="px-4 py-2 border border-blue-300 rounded-md text-sm font-medium text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors"
              >
                🌐 View Application Form
              </Link>
              <Link
                href="/admin/login"
                className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
              >
                🚪 Logout
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 overflow-hidden shadow-lg rounded-lg">
            <div className="p-6 text-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl font-bold">{students.length}</div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-lg font-medium truncate">Total Students</div>
                  <div className="text-blue-100 text-sm">All applications</div>
                </div>
                <div className="text-4xl opacity-50">👥</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-yellow-500 to-orange-500 overflow-hidden shadow-lg rounded-lg">
            <div className="p-6 text-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl font-bold">
                    {students.filter(s => s.status === 'Pending').length}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-lg font-medium truncate">Pending</div>
                  <div className="text-yellow-100 text-sm">Awaiting review</div>
                </div>
                <div className="text-4xl opacity-50">⏳</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-green-500 to-emerald-500 overflow-hidden shadow-lg rounded-lg">
            <div className="p-6 text-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl font-bold">
                    {students.filter(s => s.status === 'Accepted').length}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-lg font-medium truncate">Accepted</div>
                  <div className="text-green-100 text-sm">Approved</div>
                </div>
                <div className="text-4xl opacity-50">✅</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-r from-red-500 to-pink-500 overflow-hidden shadow-lg rounded-lg">
            <div className="p-6 text-white">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <div className="text-3xl font-bold">
                    {students.filter(s => s.status === 'Rejected').length}
                  </div>
                </div>
                <div className="ml-5 w-0 flex-1">
                  <div className="text-lg font-medium truncate">Rejected</div>
                  <div className="text-red-100 text-sm">Declined</div>
                </div>
                <div className="text-4xl opacity-50">❌</div>
              </div>
            </div>
          </div>
        </div>

        {/* Settings */}
        <div className="bg-white shadow-lg rounded-lg mb-8 border border-gray-200">
          <div className="px-6 py-5 sm:p-6">
            <h3 className="text-xl leading-6 font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-2">⚙️</span>
              Dashboard Settings
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <label className="block text-sm font-medium text-blue-900 mb-2">📅 Reporting Date</label>
                <div className="flex space-x-2">
                  <input
                    type="date"
                    value={reportingDate}
                    onChange={(e) => setReportingDate(e.target.value)}
                    className="flex-1 border border-blue-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                  <button
                    onClick={saveReportingDate}
                    className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 font-medium transition-colors"
                  >
                    Save
                  </button>
                </div>
              </div>
              
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <label className="block text-sm font-medium text-green-900 mb-2">🔧 Approval Mode</label>
                <div className="flex space-x-4 mb-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="manual"
                      checked={approvalMode === 'manual'}
                      onChange={(e) => setApprovalMode(e.target.value as 'manual' | 'automatic')}
                      className="mr-2 text-green-600"
                    />
                    <span className="text-green-800">Manual</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="automatic"
                      checked={approvalMode === 'automatic'}
                      onChange={(e) => setApprovalMode(e.target.value as 'manual' | 'automatic')}
                      className="mr-2 text-green-600"
                    />
                    <span className="text-green-800">Automatic</span>
                  </label>
                </div>
                
                {approvalMode === 'automatic' && (
                  <div className="mb-3">
                    <label className="block text-xs text-green-700 mb-1">⏱️ Auto-approval delay (minutes)</label>
                    <input
                      type="number"
                      value={autoApprovalDelay}
                      onChange={(e) => setAutoApprovalDelay(parseInt(e.target.value))}
                      className="w-24 border border-green-300 rounded px-2 py-1 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                )}
                
                <button
                  onClick={saveApprovalMode}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Courses */}
        <div className="bg-white shadow-lg rounded-lg mb-8 border border-gray-200">
          <div className="px-6 py-5 sm:p-6">
            <h3 className="text-xl leading-6 font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-2">📚</span>
              Courses ({courses.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(course => (
                <div key={course.id} className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h4 className="font-bold text-purple-900 text-lg mb-2">{course.name}</h4>
                  <div className="space-y-1">
                    <p className="text-sm text-purple-700">
                      💰 <span className="font-medium">Fee Balance:</span> KES {course.feeBalance.toLocaleString()}
                    </p>
                    <p className="text-sm text-purple-700">
                      📅 <span className="font-medium">Fee Per Year:</span> KES {course.feePerYear.toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            
            {courses.length === 0 && (
              <div className="text-center py-8">
                <div className="text-4xl text-gray-300 mb-2">📚</div>
                <p className="text-gray-500">No courses found</p>
                <p className="text-sm text-gray-400">Courses will appear here once added to the database</p>
              </div>
            )}
          </div>
        </div>

        {/* Students */}
        <div className="bg-white shadow-lg rounded-lg border border-gray-200">
          <div className="px-6 py-5 sm:p-6">
            <h3 className="text-xl leading-6 font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-2">👥</span>
              Students ({students.length})
            </h3>
            
            {students.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl text-gray-300 mb-4">👨‍🎓</div>
                <h4 className="text-xl font-medium text-gray-500 mb-2">No students yet</h4>
                <p className="text-gray-400">Students will appear here when they submit applications</p>
                <div className="mt-4">
                  <Link 
                    href="/" 
                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    🌐 View Application Form
                  </Link>
                </div>
              </div>
            ) : (
              <div className="overflow-hidden shadow-lg ring-1 ring-black ring-opacity-5 rounded-lg">
                <table className="min-w-full divide-y divide-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Student Info
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
                      <tr key={student.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm font-medium text-gray-900 flex items-center">
                              <span className="mr-2">👤</span>
                              {student.fullName}
                            </div>
                            <div className="text-sm text-gray-500">{student.admissionNumber}</div>
                            {student.source === 'online_application' && (
                              <div className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded-full inline-block mt-1">
                                🌐 Online Application
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <div className="text-sm text-gray-900 flex items-center">
                              <span className="mr-2">📧</span>
                              {student.email}
                            </div>
                            <div className="text-sm text-gray-500 flex items-center">
                              <span className="mr-2">📱</span>
                              {student.phone}
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900 flex items-center">
                            <span className="mr-2">📚</span>
                            {student.course}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                            student.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                            student.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }`}>
                            {student.status === 'Accepted' ? '✅ Accepted' :
                             student.status === 'Rejected' ? '❌ Rejected' :
                             '⏳ Pending'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                          {student.status === 'Pending' && (
                            <>
                              <button
                                onClick={() => updateStudentStatus(student.id, 'Accepted')}
                                className="text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 px-3 py-1 rounded-md transition-colors"
                              >
                                ✅ Accept
                              </button>
                              <button
                                onClick={() => updateStudentStatus(student.id, 'Rejected')}
                                className="text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-md transition-colors"
                              >
                                ❌ Reject
                              </button>
                            </>
                          )}
                          {student.status !== 'Pending' && (
                            <button
                              onClick={() => updateStudentStatus(student.id, 'Pending')}
                              className="text-yellow-600 hover:text-yellow-900 bg-yellow-50 hover:bg-yellow-100 px-3 py-1 rounded-md transition-colors"
                            >
                              ⏳ Mark Pending
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