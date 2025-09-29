'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { supabase } from '../../lib/supabase'

export default function AdminDashboard() {
  const [connectionStatus, setConnectionStatus] = useState('testing')
  const [courses, setCourses] = useState<any[]>([])
  const [students, setStudents] = useState<any[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const testConnection = async () => {
      try {
        setConnectionStatus('connecting')
        console.log('🔌 Testing Supabase connection...')
        
        // Test basic connection by fetching courses
        const { data: coursesData, error: coursesError } = await supabase
          .from('courses')
          .select('*')
          .limit(10)
        
        if (coursesError) {
          console.error('Courses error:', coursesError)
          setError(`Courses error: ${coursesError.message}`)
        } else {
          console.log('✅ Courses loaded:', coursesData.length)
          setCourses(coursesData || [])
        }
        
        // Test students table
        const { data: studentsData, error: studentsError } = await supabase
          .from('students')
          .select('*')
          .limit(10)
        
        if (studentsError) {
          console.error('Students error:', studentsError)
          setError(prev => prev ? `${prev}, Students: ${studentsError.message}` : `Students error: ${studentsError.message}`)
        } else {
          console.log('✅ Students loaded:', studentsData.length)
          setStudents(studentsData || [])
        }
        
        setConnectionStatus('connected')
        
      } catch (error) {
        console.error('Connection test failed:', error)
        setError(`Connection failed: ${error}`)
        setConnectionStatus('failed')
      }
    }
    
    testConnection()
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <span className="text-4xl mr-3">🎓</span>
              EAVI Admin Dashboard - Connection Test
            </h1>
            <Link
              href="/admin/login"
              className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
              🚪 Logout
            </Link>
          </div>
        </div>

        {/* Connection Status */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h2 className="text-2xl font-bold mb-4 flex items-center">
            <span className="text-2xl mr-2">🔌</span>
            Connection Status
          </h2>
          
          <div className={`p-4 rounded-lg mb-4 ${
            connectionStatus === 'connected' ? 'bg-green-100 text-green-800' :
            connectionStatus === 'failed' ? 'bg-red-100 text-red-800' :
            'bg-yellow-100 text-yellow-800'
          }`}>
            {connectionStatus === 'testing' && '⏳ Testing connection...'}
            {connectionStatus === 'connecting' && '🔌 Connecting to Supabase...'}
            {connectionStatus === 'connected' && '✅ Successfully connected to Supabase!'}
            {connectionStatus === 'failed' && '❌ Connection failed'}
          </div>
          
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700">
              <strong>Error Details:</strong> {error}
            </div>
          )}
        </div>

        {/* Database Data */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Courses */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="text-2xl mr-2">📚</span>
              Courses ({courses.length})
            </h3>
            
            {courses.length > 0 ? (
              <div className="space-y-3">
                {courses.map((course, index) => (
                  <div key={course.id || index} className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <div className="font-medium text-purple-900">{course.name}</div>
                    <div className="text-sm text-purple-700">
                      Fee Balance: KES {course.fee_balance?.toLocaleString() || '0'}
                    </div>
                    <div className="text-sm text-purple-700">
                      Fee Per Year: KES {course.fee_per_year?.toLocaleString() || '0'}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl text-gray-300 mb-2">📚</div>
                <p className="text-gray-500">No courses found</p>
              </div>
            )}
          </div>

          {/* Students */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <span className="text-2xl mr-2">👥</span>
              Students ({students.length})
            </h3>
            
            {students.length > 0 ? (
              <div className="space-y-3">
                {students.slice(0, 5).map((student, index) => (
                  <div key={student.id || index} className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                    <div className="font-medium text-blue-900">{student.full_name}</div>
                    <div className="text-sm text-blue-700">{student.course}</div>
                    <div className="text-sm text-blue-600">
                      Status: <span className={`px-2 py-1 rounded-full text-xs ${
                        student.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                        student.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {student.status}
                      </span>
                    </div>
                  </div>
                ))}
                {students.length > 5 && (
                  <div className="text-center text-gray-500 text-sm">
                    ... and {students.length - 5} more students
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="text-4xl text-gray-300 mb-2">👨‍🎓</div>
                <p className="text-gray-500">No students found</p>
              </div>
            )}
          </div>
        </div>

        {/* Test Results */}
        <div className="bg-white rounded-lg shadow-lg p-6 mt-6">
          <h3 className="text-xl font-bold mb-4">🧪 Test Results</h3>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className={connectionStatus === 'connected' ? 'text-green-600' : 'text-gray-400'}>
                {connectionStatus === 'connected' ? '✅' : '⏳'}
              </span>
              <span>Supabase client initialization</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={courses.length > 0 ? 'text-green-600' : 'text-gray-400'}>
                {courses.length > 0 ? '✅' : '❌'}
              </span>
              <span>Courses table access</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className={students.length >= 0 ? 'text-green-600' : 'text-gray-400'}>
                {students.length >= 0 ? '✅' : '❌'}
              </span>
              <span>Students table access</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}