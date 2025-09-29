'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SupabaseService } from '../../services/supabaseService'
import { ViewIcon, DownloadIcon, PhoneIcon, SMSIcon, WhatsAppIcon, EditIcon, DeleteIcon, PlusIcon } from '../../components/Icons'

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
  kcseGrade?: string
}

type Course = {
  id: string
  name: string
  feeBalance: number
  feePerYear: number
}

export default function Modern3DDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        
        // Load students
        const supabaseStudents = await SupabaseService.getStudents()
        const formattedStudents = supabaseStudents.map(student => ({
          id: student.id,
          fullName: student.full_name,
          admissionNumber: student.admission_number,
          email: student.email || '',
          phone: student.phone,
          course: student.course,
          status: student.status as Status,
          kcseGrade: student.kcse_grade
        }))
        setStudents(formattedStudents)
        
        // Load courses
        const supabaseCourses = await SupabaseService.getCourses()
        const formattedCourses = supabaseCourses.map(course => ({
          id: course.id,
          name: course.name,
          feeBalance: course.fee_balance,
          feePerYear: course.fee_per_year
        }))
        setCourses(formattedCourses)
        
      } catch (error) {
        console.error('Error loading data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex items-center justify-center">
        <div className="glass-card backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto mb-4"></div>
            <p className="text-white text-lg">Loading your modern dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-900 via-pink-900 to-purple-800 flex items-center justify-center">
        <div className="glass-card backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-white mb-2">Dashboard Error</h2>
          <p className="text-pink-200 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl hover:from-red-700 hover:to-pink-700 font-medium transition-all duration-300 transform hover:scale-105"
          >
            Refresh Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
      </div>
      
      {/* Floating 3D Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-float blur-xl"></div>
      <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-30 animate-float-delayed blur-lg"></div>
      <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-15 animate-float-slow blur-2xl"></div>

      {/* Header */}
      <div className="relative z-10">
        <div className="glass-header backdrop-blur-xl bg-white/5 border-b border-white/10 shadow-2xl">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-6">
              <div className="flex items-center">
                <div className="relative">
                  <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur opacity-30 animate-pulse"></div>
                  <div className="relative text-4xl mr-4 animate-bounce">🎓</div>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-white tracking-wide">EAVI Dashboard</h1>
                  <p className="text-blue-200">Modern Admin Portal</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <Link
                  href="/"
                  className="glass-button backdrop-blur-sm bg-white/10 border border-white/20 px-4 py-2 rounded-2xl text-white hover:bg-white/20 transition-all duration-300 transform hover:scale-105 flex items-center"
                >
                  <span className="mr-2">🌐</span>
                  View Form
                </Link>
                <Link
                  href="/admin/login"
                  className="glass-button backdrop-blur-sm bg-red-500/20 border border-red-400/30 px-4 py-2 rounded-2xl text-white hover:bg-red-500/30 transition-all duration-300 transform hover:scale-105 flex items-center"
                >
                  <span className="mr-2">🚪</span>
                  Logout
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            {/* Total Students Card */}
            <div className="glass-card-3d backdrop-blur-xl bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-white/20 rounded-3xl p-6 shadow-2xl transform hover:scale-105 hover:rotate-1 transition-all duration-300 animate-fade-in">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-white mb-2">{students.length}</div>
                  <div className="text-blue-200 font-medium">Total Students</div>
                  <div className="text-blue-300 text-sm">All applications</div>
                </div>
                <div className="relative">
                  <div className="absolute -inset-2 bg-blue-400 rounded-full blur opacity-30"></div>
                  <div className="relative text-5xl opacity-60">👥</div>
                </div>
              </div>
              <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-blue-400 to-cyan-400 rounded-full" style={{width: '100%'}}></div>
              </div>
            </div>

            {/* Pending Students Card */}
            <div className="glass-card-3d backdrop-blur-xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 border border-white/20 rounded-3xl p-6 shadow-2xl transform hover:scale-105 hover:rotate-1 transition-all duration-300 animate-fade-in" style={{animationDelay: '0.1s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {students.filter(s => s.status === 'Pending').length}
                  </div>
                  <div className="text-yellow-200 font-medium">Pending</div>
                  <div className="text-yellow-300 text-sm">Awaiting review</div>
                </div>
                <div className="relative">
                  <div className="absolute -inset-2 bg-yellow-400 rounded-full blur opacity-30"></div>
                  <div className="relative text-5xl opacity-60">⏳</div>
                </div>
              </div>
              <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full" 
                     style={{width: `${students.length > 0 ? (students.filter(s => s.status === 'Pending').length / students.length) * 100 : 0}%`}}></div>
              </div>
            </div>

            {/* Accepted Students Card */}
            <div className="glass-card-3d backdrop-blur-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-white/20 rounded-3xl p-6 shadow-2xl transform hover:scale-105 hover:rotate-1 transition-all duration-300 animate-fade-in" style={{animationDelay: '0.2s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {students.filter(s => s.status === 'Accepted').length}
                  </div>
                  <div className="text-green-200 font-medium">Accepted</div>
                  <div className="text-green-300 text-sm">Approved</div>
                </div>
                <div className="relative">
                  <div className="absolute -inset-2 bg-green-400 rounded-full blur opacity-30"></div>
                  <div className="relative text-5xl opacity-60">✅</div>
                </div>
              </div>
              <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-green-400 to-emerald-400 rounded-full"
                     style={{width: `${students.length > 0 ? (students.filter(s => s.status === 'Accepted').length / students.length) * 100 : 0}%`}}></div>
              </div>
            </div>

            {/* Rejected Students Card */}
            <div className="glass-card-3d backdrop-blur-xl bg-gradient-to-br from-red-500/20 to-pink-500/20 border border-white/20 rounded-3xl p-6 shadow-2xl transform hover:scale-105 hover:rotate-1 transition-all duration-300 animate-fade-in" style={{animationDelay: '0.3s'}}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-4xl font-bold text-white mb-2">
                    {students.filter(s => s.status === 'Rejected').length}
                  </div>
                  <div className="text-red-200 font-medium">Rejected</div>
                  <div className="text-red-300 text-sm">Declined</div>
                </div>
                <div className="relative">
                  <div className="absolute -inset-2 bg-red-400 rounded-full blur opacity-30"></div>
                  <div className="relative text-5xl opacity-60">❌</div>
                </div>
              </div>
              <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-400 to-pink-400 rounded-full"
                     style={{width: `${students.length > 0 ? (students.filter(s => s.status === 'Rejected').length / students.length) * 100 : 0}%`}}></div>
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap gap-4 mb-8">
            <button className="glass-button-3d backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 px-6 py-3 rounded-2xl text-white font-medium hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 transform hover:scale-105 hover:-rotate-1 flex items-center shadow-lg">
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Student
            </button>
            <button className="glass-button-3d backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/20 px-6 py-3 rounded-2xl text-white font-medium hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 transform hover:scale-105 hover:rotate-1 flex items-center shadow-lg">
              <PlusIcon className="w-5 h-5 mr-2" />
              Add Course
            </button>
          </div>

          {/* Courses Section */}
          <div className="glass-card backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl mb-8 animate-slide-up">
            <div className="flex items-center mb-6">
              <div className="text-3xl mr-3">📚</div>
              <h3 className="text-2xl font-bold text-white">Courses ({courses.length})</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.map((course, index) => (
                <div key={course.id} 
                     className="glass-card-3d backdrop-blur-lg bg-gradient-to-br from-purple-500/20 to-indigo-500/20 border border-white/20 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:rotate-1 animate-fade-in"
                     style={{animationDelay: `${index * 0.1}s`}}>
                  <div className="flex justify-between items-start mb-4">
                    <h4 className="font-bold text-white text-lg">{course.name}</h4>
                    <div className="flex space-x-2">
                      <button className="p-2 glass-button backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-200 hover:text-white transition-all duration-300 transform hover:scale-110">
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button className="p-2 glass-button backdrop-blur-sm bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 hover:text-white transition-all duration-300 transform hover:scale-110">
                        <DeleteIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center text-purple-200">
                      <span className="mr-2">💰</span>
                      <span className="font-medium">Fee Balance:</span>
                      <span className="ml-auto font-bold">KES {course.feeBalance.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center text-purple-200">
                      <span className="mr-2">📅</span>
                      <span className="font-medium">Fee Per Year:</span>
                      <span className="ml-auto font-bold">KES {course.feePerYear.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {courses.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4 opacity-50">📚</div>
                <h4 className="text-xl font-medium text-white mb-2">No courses found</h4>
                <p className="text-purple-200">Courses will appear here once added to the database</p>
              </div>
            )}
          </div>

          {/* Students Section */}
          <div className="glass-card backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl animate-slide-up" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center mb-6">
              <div className="text-3xl mr-3">👥</div>
              <h3 className="text-2xl font-bold text-white">Students ({students.length})</h3>
            </div>
            
            {students.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-8xl mb-6 opacity-30">👨‍🎓</div>
                <h4 className="text-2xl font-medium text-white mb-4">No students yet</h4>
                <p className="text-blue-200 mb-6">Students will appear here when they submit applications</p>
                <Link 
                  href="/" 
                  className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                >
                  <span className="mr-2">🌐</span>
                  View Application Form
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                {students.map((student, index) => (
                  <div key={student.id} 
                       className="glass-card-3d backdrop-blur-lg bg-gradient-to-br from-gray-500/20 to-blue-500/20 border border-white/20 rounded-2xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:scale-105 hover:-rotate-1 animate-fade-in"
                       style={{animationDelay: `${index * 0.05}s`}}>
                    
                    {/* Student Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-white text-lg flex items-center">
                          <span className="mr-2">👤</span>
                          {student.fullName}
                        </h4>
                        <p className="text-blue-200 text-sm">{student.admissionNumber}</p>
                      </div>
                      <div className="flex space-x-1">
                        <button className="p-1 glass-button backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-200 hover:text-white transition-all duration-300">
                          <EditIcon className="w-3 h-3" />
                        </button>
                        <button className="p-1 glass-button backdrop-blur-sm bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 hover:text-white transition-all duration-300">
                          <DeleteIcon className="w-3 h-3" />
                        </button>
                      </div>
                    </div>

                    {/* Student Details */}
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-blue-100">
                        <span className="mr-2">📧</span>
                        {student.email}
                      </div>
                      <div className="flex items-center text-sm text-blue-100">
                        <span className="mr-2">📱</span>
                        {student.phone}
                      </div>
                      <div className="flex items-center text-sm text-blue-100">
                        <span className="mr-2">📚</span>
                        {student.course}
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full backdrop-blur-sm border ${
                        student.status === 'Accepted' ? 'bg-green-500/30 border-green-400/50 text-green-100' :
                        student.status === 'Rejected' ? 'bg-red-500/30 border-red-400/50 text-red-100' :
                        'bg-yellow-500/30 border-yellow-400/50 text-yellow-100'
                      }`}>
                        {student.status === 'Accepted' ? '✅ Accepted' :
                         student.status === 'Rejected' ? '❌ Rejected' :
                         '⏳ Pending'}
                      </span>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-2">
                      {/* Status Actions */}
                      <div className="flex space-x-2">
                        {student.status === 'Pending' && (
                          <>
                            <button className="flex-1 px-3 py-2 text-xs font-medium glass-button backdrop-blur-sm bg-green-500/20 border border-green-400/30 text-green-200 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-105">
                              ✅ Accept
                            </button>
                            <button className="flex-1 px-3 py-2 text-xs font-medium glass-button backdrop-blur-sm bg-red-500/20 border border-red-400/30 text-red-200 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-105">
                              ❌ Reject
                            </button>
                          </>
                        )}
                      </div>

                      {/* Communication Actions */}
                      <div className="flex space-x-2">
                        <button className="flex-1 px-3 py-2 text-xs font-medium glass-button backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 text-blue-200 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                          <PhoneIcon className="w-3 h-3 mr-1" />
                          Call
                        </button>
                        <button className="flex-1 px-3 py-2 text-xs font-medium glass-button backdrop-blur-sm bg-purple-500/20 border border-purple-400/30 text-purple-200 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                          <SMSIcon className="w-3 h-3 mr-1" />
                          SMS
                        </button>
                        <button className="flex-1 px-3 py-2 text-xs font-medium glass-button backdrop-blur-sm bg-green-500/20 border border-green-400/30 text-green-200 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center">
                          <WhatsAppIcon className="w-3 h-3 mr-1" />
                          WhatsApp
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        
        .glass-card-3d {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
          transform-style: preserve-3d;
        }
        
        .glass-header {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(30px);
          -webkit-backdrop-filter: blur(30px);
        }
        
        .glass-button {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        
        .glass-button-3d {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
          transform-style: preserve-3d;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }
        
        @keyframes float-delayed {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-30px) rotate(-180deg); }
        }
        
        @keyframes float-slow {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-15px) rotate(90deg); }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; transform: translateY(30px) scale(0.9); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
        }
        
        @keyframes slide-up {
          0% { opacity: 0; transform: translateY(50px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-float-delayed {
          animation: float-delayed 8s ease-in-out infinite;
        }
        
        .animate-float-slow {
          animation: float-slow 10s ease-in-out infinite;
        }
        
        .animate-fade-in {
          animation: fade-in 0.6s ease-out both;
        }
        
        .animate-slide-up {
          animation: slide-up 0.8s ease-out both;
        }
      `}</style>
    </div>
  )
}