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
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const [reportingDate, setReportingDate] = useState('')
  const [approvalMode, setApprovalMode] = useState<'manual' | 'automatic'>('manual')
  const [autoApprovalDelay, setAutoApprovalDelay] = useState(5)

  const addDebugInfo = (message: string) => {
    console.log(message)
    setDebugInfo(prev => [...prev, `${new Date().toISOString().split('T')[1].split('.')[0]}: ${message}`])
  }

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        addDebugInfo('🚀 Starting to load data from Supabase...')
        
        // Test basic Supabase connection first
        try {
          addDebugInfo('🔌 Testing Supabase connection...')
          const testConnection = await SupabaseService.getCourses()
          addDebugInfo(`✅ Supabase connected - found ${testConnection.length} courses`)
        } catch (connError) {
          addDebugInfo(`❌ Supabase connection failed: ${connError}`)
          throw new Error(`Supabase connection failed: ${connError}`)
        }

        // Load students
        try {
          addDebugInfo('👥 Loading students...')
          const supabaseStudents = await SupabaseService.getStudents()
          addDebugInfo(`📊 Students loaded: ${supabaseStudents.length}`)
          
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
          addDebugInfo(`✅ Students processed: ${formattedStudents.length}`)
        } catch (studentError) {
          addDebugInfo(`⚠️ Student loading error: ${studentError}`)
          // Continue loading other data even if students fail
        }
        
        // Load courses
        try {
          addDebugInfo('📚 Loading courses...')
          const supabaseCourses = await SupabaseService.getCourses()
          addDebugInfo(`📊 Courses loaded: ${supabaseCourses.length}`)
          
          const formattedCourses = supabaseCourses.map(course => ({
            id: course.id,
            name: course.name,
            feeBalance: course.fee_balance,
            feePerYear: course.fee_per_year
          }))
          
          setCourses(formattedCourses)
          addDebugInfo(`✅ Courses processed: ${formattedCourses.length}`)
        } catch (courseError) {
          addDebugInfo(`⚠️ Course loading error: ${courseError}`)
        }
        
        // Load settings
        try {
          addDebugInfo('⚙️ Loading settings...')
          
          const reportingDateSetting = await SupabaseService.getSetting('reporting_date')
          if (reportingDateSetting?.value) {
            setReportingDate(reportingDateSetting.value)
            addDebugInfo(`📅 Reporting date: ${reportingDateSetting.value}`)
          }
          
          const approvalModeSetting = await SupabaseService.getSetting('approval_mode')
          if (approvalModeSetting?.value) {
            setApprovalMode(approvalModeSetting.value as 'manual' | 'automatic')
            addDebugInfo(`🔧 Approval mode: ${approvalModeSetting.value}`)
          }
          
          const delaySettings = await SupabaseService.getSetting('auto_approval_delay')
          if (delaySettings?.value) {
            setAutoApprovalDelay(parseInt(delaySettings.value))
            addDebugInfo(`⏱️ Auto-approval delay: ${delaySettings.value} minutes`)
          }
          
          addDebugInfo('✅ Settings loaded successfully')
        } catch (settingsError) {
          addDebugInfo(`⚠️ Settings loading error: ${settingsError}`)
        }
        
        addDebugInfo('🎉 Data loading completed!')
        
      } catch (error) {
        console.error('Error loading data:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        setError(`Failed to load data: ${errorMessage}`)
        addDebugInfo(`💥 Fatal error: ${errorMessage}`)
      } finally {
        setLoading(false)
        addDebugInfo('🏁 Loading state set to false')
      }
    }
    
    loadData()
  }, [])

  const updateStudentStatus = async (id: string, status: Status) => {
    try {
      await SupabaseService.updateStudent(id, { status })
      setStudents(students.map(s => s.id === id ? { ...s, status } : s))
      addDebugInfo(`✅ Student ${id} status updated to ${status}`)
    } catch (error) {
      console.error('Error updating student:', error)
      addDebugInfo(`❌ Failed to update student: ${error}`)
      alert('Failed to update student status')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-2xl">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
          
          {debugInfo.length > 0 && (
            <div className="mt-6 text-left bg-white p-4 rounded-lg shadow max-h-60 overflow-y-auto">
              <h4 className="font-medium text-gray-900 mb-2">Debug Log:</h4>
              {debugInfo.map((info, index) => (
                <div key={index} className="text-xs text-gray-600 font-mono">{info}</div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center max-w-2xl">
          <div className="text-red-600 text-xl mb-4">⚠️ Error</div>
          <p className="text-gray-600 mb-4">{error}</p>
          
          <div className="text-left bg-white p-4 rounded-lg shadow mb-4 max-h-60 overflow-y-auto">
            <h4 className="font-medium text-gray-900 mb-2">Debug Log:</h4>
            {debugInfo.map((info, index) => (
              <div key={index} className="text-xs text-gray-600 font-mono">{info}</div>
            ))}
          </div>
          
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
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
              <h1 className="text-2xl font-bold text-gray-900">EAVI Admin Dashboard (Debug Mode)</h1>
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
        {/* Debug Info */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Debug Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-3 rounded">
                <div className="text-sm font-medium text-blue-900">Students Loaded</div>
                <div className="text-2xl font-bold text-blue-600">{students.length}</div>
              </div>
              <div className="bg-green-50 p-3 rounded">
                <div className="text-sm font-medium text-green-900">Courses Loaded</div>
                <div className="text-2xl font-bold text-green-600">{courses.length}</div>
              </div>
              <div className="bg-purple-50 p-3 rounded">
                <div className="text-sm font-medium text-purple-900">Approval Mode</div>
                <div className="text-lg font-bold text-purple-600">{approvalMode}</div>
              </div>
            </div>
            
            <div className="bg-gray-50 p-3 rounded max-h-40 overflow-y-auto">
              <h4 className="font-medium text-gray-900 mb-2">Loading Log:</h4>
              {debugInfo.map((info, index) => (
                <div key={index} className="text-xs text-gray-600 font-mono">{info}</div>
              ))}
            </div>
          </div>
        </div>

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
                          {student.status !== 'Pending' && (
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