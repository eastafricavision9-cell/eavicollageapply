'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SupabaseService } from '../../services/supabaseService'
import { PDFService } from '../../services/pdfService'
import { ViewIcon, DownloadIcon, PhoneIcon, SMSIcon, WhatsAppIcon, EditIcon, DeleteIcon, PlusIcon, SettingsIcon, SearchIcon, FilterIcon } from '../../components/Icons'

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
  location?: string
  appliedAt?: string
}

type Course = {
  id: string
  name: string
  feeBalance: number
  feePerYear: number
}

type Settings = {
  reportingDate: string
  approvalMode: 'manual' | 'automatic'
  autoApprovalDelay: number
}

export default function CompleteFunctionalDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<Settings>({
    reportingDate: '',
    approvalMode: 'manual',
    autoApprovalDelay: 5
  })

  // Modal states
  const [showAddStudent, setShowAddStudent] = useState(false)
  const [showEditStudent, setShowEditStudent] = useState(false)
  const [showAddCourse, setShowAddCourse] = useState(false)
  const [showEditCourse, setShowEditCourse] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showPDFViewer, setShowPDFViewer] = useState(false)
  const [showWhatsAppShare, setShowWhatsAppShare] = useState(false)

  // Selected items
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{type: 'student' | 'course', id: string, name: string} | null>(null)

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(9)

  // PDF state
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  // Form states
  const [studentForm, setStudentForm] = useState({
    fullName: '', email: '', phone: '', course: '', location: '', kcseGrade: ''
  })
  const [courseForm, setCourseForm] = useState({
    name: '', feeBalance: 0, feePerYear: 0
  })

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
          kcseGrade: student.kcse_grade,
          location: student.location,
          appliedAt: student.applied_at
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

  // Filter and search students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.admissionNumber.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesFilter = statusFilter === 'All' || student.status === statusFilter
    return matchesSearch && matchesFilter
  })

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage)
  const paginatedStudents = filteredStudents.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Student CRUD operations
  const handleAddStudent = async () => {
    try {
      const admissionNumber = await SupabaseService.generateAdmissionNumber()
      const newStudent = await SupabaseService.createStudent({
        full_name: studentForm.fullName,
        admission_number: admissionNumber,
        email: studentForm.email,
        phone: studentForm.phone,
        course: studentForm.course,
        location: studentForm.location,
        kcse_grade: studentForm.kcseGrade,
        status: 'Pending',
        applied_at: new Date().toISOString(),
        source: 'manual' as const
      })

      setStudents(prev => [...prev, {
        id: newStudent.id,
        fullName: newStudent.full_name,
        admissionNumber: newStudent.admission_number,
        email: newStudent.email || '',
        phone: newStudent.phone,
        course: newStudent.course,
        status: newStudent.status as Status,
        kcseGrade: newStudent.kcse_grade,
        location: newStudent.location,
        appliedAt: newStudent.applied_at
      }])

      setShowAddStudent(false)
      setStudentForm({ fullName: '', email: '', phone: '', course: '', location: '', kcseGrade: '' })
    } catch (error) {
      console.error('Error adding student:', error)
      alert('Failed to add student')
    }
  }

  const handleEditStudent = async () => {
    if (!selectedStudent) return
    
    try {
      await SupabaseService.updateStudent(selectedStudent.id, {
        full_name: studentForm.fullName,
        email: studentForm.email,
        phone: studentForm.phone,
        course: studentForm.course,
        location: studentForm.location,
        kcse_grade: studentForm.kcseGrade
      })

      setStudents(prev => prev.map(s => s.id === selectedStudent.id ? {
        ...s,
        fullName: studentForm.fullName,
        email: studentForm.email,
        phone: studentForm.phone,
        course: studentForm.course,
        location: studentForm.location,
        kcseGrade: studentForm.kcseGrade
      } : s))

      setShowEditStudent(false)
      setSelectedStudent(null)
    } catch (error) {
      console.error('Error updating student:', error)
      alert('Failed to update student')
    }
  }

  const handleDeleteStudent = async (id: string) => {
    try {
      await SupabaseService.deleteStudent(id)
      setStudents(prev => prev.filter(s => s.id !== id))
      setShowDeleteConfirm(false)
      setDeleteTarget(null)
    } catch (error) {
      console.error('Error deleting student:', error)
      alert('Failed to delete student')
    }
  }

  const handleStatusChange = async (studentId: string, newStatus: Status) => {
    try {
      await SupabaseService.updateStudentStatus(studentId, newStatus)
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: newStatus } : s))
    } catch (error) {
      console.error('Error updating status:', error)
      alert('Failed to update student status')
    }
  }

  // Course CRUD operations
  const handleAddCourse = async () => {
    try {
      const newCourse = await SupabaseService.createCourse({
        name: courseForm.name,
        fee_balance: courseForm.feeBalance,
        fee_per_year: courseForm.feePerYear
      })

      setCourses(prev => [...prev, {
        id: newCourse.id,
        name: newCourse.name,
        feeBalance: newCourse.fee_balance,
        feePerYear: newCourse.fee_per_year
      }])

      setShowAddCourse(false)
      setCourseForm({ name: '', feeBalance: 0, feePerYear: 0 })
    } catch (error) {
      console.error('Error adding course:', error)
      alert('Failed to add course')
    }
  }

  // PDF operations
  const handleViewPDF = async (student: Student) => {
    try {
      const pdfBlob = await PDFService.generateAdmissionLetter(student)
      setPdfBlob(pdfBlob)
      const url = URL.createObjectURL(pdfBlob)
      setPdfUrl(url)
      setSelectedStudent(student)
      setShowPDFViewer(true)
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Failed to generate PDF')
    }
  }

  const handleDownloadPDF = () => {
    if (pdfBlob && selectedStudent) {
      const url = URL.createObjectURL(pdfBlob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${selectedStudent.fullName}_Admission_Letter.pdf`
      a.click()
      URL.revokeObjectURL(url)
    }
  }

  // Communication functions
  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  const handleSMS = (phone: string) => {
    window.open(`sms:${phone}`, '_self')
  }

  const handleWhatsApp = (student: Student) => {
    setSelectedStudent(student)
    setShowWhatsAppShare(true)
  }

  const sendWhatsAppMessage = (message: string) => {
    if (selectedStudent) {
      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/${selectedStudent.phone.replace(/[^\d]/g, '')}?text=${encodedMessage}`
      window.open(whatsappUrl, '_blank')
      setShowWhatsAppShare(false)
    }
  }

  // Modal handlers
  const openEditStudent = (student: Student) => {
    setSelectedStudent(student)
    setStudentForm({
      fullName: student.fullName,
      email: student.email,
      phone: student.phone,
      course: student.course,
      location: student.location || '',
      kcseGrade: student.kcseGrade || ''
    })
    setShowEditStudent(true)
  }

  const openDeleteConfirm = (type: 'student' | 'course', id: string, name: string) => {
    setDeleteTarget({ type, id, name })
    setShowDeleteConfirm(true)
  }

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
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.03'%3E%3Ccircle cx='30' cy='30' r='30'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
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
                  <p className="text-blue-200">Complete Admin Portal</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => setShowSettings(true)}
                  className="glass-button backdrop-blur-sm bg-purple-500/20 border border-purple-400/30 px-4 py-2 rounded-2xl text-white hover:bg-purple-500/30 transition-all duration-300 transform hover:scale-105 flex items-center"
                >
                  <SettingsIcon className="w-4 h-4 mr-2" />
                  Settings
                </button>
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

          {/* Search and Filter Controls */}
          <div className="glass-card backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-6 shadow-2xl mb-8 animate-slide-up">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-4 flex-1">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="text"
                    placeholder="Search students..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300"
                  />
                </div>

                {/* Status Filter */}
                <div className="relative">
                  <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as Status | 'All')}
                    className="pl-10 pr-8 py-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-300 appearance-none"
                  >
                    <option value="All">All Status</option>
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="flex gap-4">
                <button 
                  onClick={() => setShowAddStudent(true)}
                  className="glass-button-3d backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-white/20 px-6 py-3 rounded-2xl text-white font-medium hover:from-blue-500/30 hover:to-purple-500/30 transition-all duration-300 transform hover:scale-105 hover:-rotate-1 flex items-center shadow-lg"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Student
                </button>
                <button 
                  onClick={() => setShowAddCourse(true)}
                  className="glass-button-3d backdrop-blur-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-white/20 px-6 py-3 rounded-2xl text-white font-medium hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 transform hover:scale-105 hover:rotate-1 flex items-center shadow-lg"
                >
                  <PlusIcon className="w-5 h-5 mr-2" />
                  Add Course
                </button>
              </div>
            </div>
          </div>

          {/* Students Section */}
          <div className="glass-card backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl animate-slide-up mb-8" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <div className="text-3xl mr-3">👥</div>
                <h3 className="text-2xl font-bold text-white">Students ({filteredStudents.length})</h3>
              </div>
              
              {/* Pagination Info */}
              {totalPages > 1 && (
                <div className="text-blue-200 text-sm">
                  Page {currentPage} of {totalPages}
                </div>
              )}
            </div>
            
            {filteredStudents.length === 0 ? (
              <div className="text-center py-16">
                <div className="text-8xl mb-6 opacity-30">👨‍🎓</div>
                <h4 className="text-2xl font-medium text-white mb-4">No students found</h4>
                <p className="text-blue-200 mb-6">
                  {students.length === 0 
                    ? "Students will appear here when they submit applications"
                    : "Try adjusting your search or filter criteria"
                  }
                </p>
                {students.length === 0 && (
                  <Link 
                    href="/" 
                    className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 font-medium transition-all duration-300 transform hover:scale-105 shadow-lg"
                  >
                    <span className="mr-2">🌐</span>
                    View Application Form
                  </Link>
                )}
              </div>
            ) : (
              <>
                {/* Students Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6 mb-8">
                  {paginatedStudents.map((student, index) => (
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
                          <button 
                            onClick={() => openEditStudent(student)}
                            className="p-1 glass-button backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 rounded-lg text-blue-200 hover:text-white transition-all duration-300"
                          >
                            <EditIcon className="w-3 h-3" />
                          </button>
                          <button 
                            onClick={() => openDeleteConfirm('student', student.id, student.fullName)}
                            className="p-1 glass-button backdrop-blur-sm bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 hover:text-white transition-all duration-300"
                          >
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
                        {student.location && (
                          <div className="flex items-center text-sm text-blue-100">
                            <img src="/location.webp" alt="Location" className="mr-2 w-4 h-4" />
                            {student.location}
                          </div>
                        )}
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
                              <button 
                                onClick={() => handleStatusChange(student.id, 'Accepted')}
                                className="flex-1 px-3 py-2 text-xs font-medium glass-button backdrop-blur-sm bg-green-500/20 border border-green-400/30 text-green-200 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-105"
                              >
                                ✅ Accept
                              </button>
                              <button 
                                onClick={() => handleStatusChange(student.id, 'Rejected')}
                                className="flex-1 px-3 py-2 text-xs font-medium glass-button backdrop-blur-sm bg-red-500/20 border border-red-400/30 text-red-200 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-105"
                              >
                                ❌ Reject
                              </button>
                            </>
                          )}
                          {student.status === 'Accepted' && (
                            <button 
                              onClick={() => handleViewPDF(student)}
                              className="flex-1 px-3 py-2 text-xs font-medium glass-button backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 text-blue-200 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                            >
                              <ViewIcon className="w-3 h-3 mr-1" />
                              View PDF
                            </button>
                          )}
                        </div>

                        {/* Communication Actions */}
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => handleCall(student.phone)}
                            className="flex-1 px-3 py-2 text-xs font-medium glass-button backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 text-blue-200 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                          >
                            <PhoneIcon className="w-3 h-3 mr-1" />
                            Call
                          </button>
                          <button 
                            onClick={() => handleSMS(student.phone)}
                            className="flex-1 px-3 py-2 text-xs font-medium glass-button backdrop-blur-sm bg-purple-500/20 border border-purple-400/30 text-purple-200 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                          >
                            <SMSIcon className="w-3 h-3 mr-1" />
                            SMS
                          </button>
                          <button 
                            onClick={() => handleWhatsApp(student)}
                            className="flex-1 px-3 py-2 text-xs font-medium glass-button backdrop-blur-sm bg-green-500/20 border border-green-400/30 text-green-200 hover:text-white rounded-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                          >
                            <WhatsAppIcon className="w-3 h-3 mr-1" />
                            WhatsApp
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex justify-center items-center space-x-2">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      disabled={currentPage === 1}
                      className="px-4 py-2 glass-button backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300"
                    >
                      Previous
                    </button>
                    
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-4 py-2 glass-button backdrop-blur-sm border rounded-xl transition-all duration-300 ${
                          page === currentPage
                            ? 'bg-blue-500/30 border-blue-400/50 text-white'
                            : 'bg-white/10 border-white/20 text-white/70 hover:bg-white/20'
                        }`}
                      >
                        {page}
                      </button>
                    ))}
                    
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      disabled={currentPage === totalPages}
                      className="px-4 py-2 glass-button backdrop-blur-sm bg-white/10 border border-white/20 rounded-xl text-white disabled:opacity-50 disabled:cursor-not-allowed hover:bg-white/20 transition-all duration-300"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Courses Section */}
          <div className="glass-card backdrop-blur-xl bg-white/5 border border-white/10 rounded-3xl p-8 shadow-2xl animate-slide-up">
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
                      <button 
                        onClick={() => openDeleteConfirm('course', course.id, course.name)}
                        className="p-2 glass-button backdrop-blur-sm bg-red-500/20 border border-red-400/30 rounded-lg text-red-200 hover:text-white transition-all duration-300 transform hover:scale-110"
                      >
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
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl w-full max-w-md animate-scale-in">
            <h3 className="text-2xl font-bold text-white mb-6">Add New Student</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={studentForm.fullName}
                onChange={(e) => setStudentForm({...studentForm, fullName: e.target.value})}
                className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60"
              />
              <input
                type="email"
                placeholder="Email"
                value={studentForm.email}
                onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={studentForm.phone}
                onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60"
              />
              <select
                value={studentForm.course}
                onChange={(e) => setStudentForm({...studentForm, course: e.target.value})}
                className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white"
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.name}>{course.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Location"
                value={studentForm.location}
                onChange={(e) => setStudentForm({...studentForm, location: e.target.value})}
                className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60"
              />
              <input
                type="text"
                placeholder="KCSE Grade"
                value={studentForm.kcseGrade}
                onChange={(e) => setStudentForm({...studentForm, kcseGrade: e.target.value})}
                className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60"
              />
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowAddStudent(false)}
                className="flex-1 px-6 py-3 glass-button backdrop-blur-sm bg-gray-500/20 border border-gray-400/30 text-white rounded-2xl hover:bg-gray-500/30 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Add Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Student Modal */}
      {showEditStudent && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl w-full max-w-md animate-scale-in">
            <h3 className="text-2xl font-bold text-white mb-6">Edit Student</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={studentForm.fullName}
                onChange={(e) => setStudentForm({...studentForm, fullName: e.target.value})}
                className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60"
              />
              <input
                type="email"
                placeholder="Email"
                value={studentForm.email}
                onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={studentForm.phone}
                onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60"
              />
              <select
                value={studentForm.course}
                onChange={(e) => setStudentForm({...studentForm, course: e.target.value})}
                className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white"
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.name}>{course.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Location"
                value={studentForm.location}
                onChange={(e) => setStudentForm({...studentForm, location: e.target.value})}
                className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60"
              />
              <input
                type="text"
                placeholder="KCSE Grade"
                value={studentForm.kcseGrade}
                onChange={(e) => setStudentForm({...studentForm, kcseGrade: e.target.value})}
                className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60"
              />
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowEditStudent(false)}
                className="flex-1 px-6 py-3 glass-button backdrop-blur-sm bg-gray-500/20 border border-gray-400/30 text-white rounded-2xl hover:bg-gray-500/30 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleEditStudent}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Update Student
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Course Modal */}
      {showAddCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl w-full max-w-md animate-scale-in">
            <h3 className="text-2xl font-bold text-white mb-6">Add New Course</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Course Name"
                value={courseForm.name}
                onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
                className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60"
              />
              <input
                type="number"
                placeholder="Fee Balance"
                value={courseForm.feeBalance}
                onChange={(e) => setCourseForm({...courseForm, feeBalance: Number(e.target.value)})}
                className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60"
              />
              <input
                type="number"
                placeholder="Fee Per Year"
                value={courseForm.feePerYear}
                onChange={(e) => setCourseForm({...courseForm, feePerYear: Number(e.target.value)})}
                className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60"
              />
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowAddCourse(false)}
                className="flex-1 px-6 py-3 glass-button backdrop-blur-sm bg-gray-500/20 border border-gray-400/30 text-white rounded-2xl hover:bg-gray-500/30 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleAddCourse}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              >
                Add Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl w-full max-w-md animate-scale-in">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h3 className="text-2xl font-bold text-white mb-4">Confirm Delete</h3>
              <p className="text-gray-300 mb-6">
                Are you sure you want to delete {deleteTarget.type} &quot;{deleteTarget.name}&quot;?
                This action cannot be undone.
              </p>
              <div className="flex space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteConfirm(false)
                    setDeleteTarget(null)
                  }}
                  className="flex-1 px-6 py-3 glass-button backdrop-blur-sm bg-gray-500/20 border border-gray-400/30 text-white rounded-2xl hover:bg-gray-500/30 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={() => {
                    if (deleteTarget.type === 'student') {
                      handleDeleteStudent(deleteTarget.id)
                    }
                    // Add course delete handler here
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-red-600 to-pink-600 text-white rounded-2xl hover:from-red-700 hover:to-pink-700 transition-all duration-300"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* PDF Viewer Modal */}
      {showPDFViewer && pdfUrl && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl w-full max-w-4xl h-5/6 flex flex-col animate-scale-in">
            <div className="flex items-center justify-between p-6 border-b border-white/20">
              <h3 className="text-2xl font-bold text-white">Admission Letter - {selectedStudent.fullName}</h3>
              <div className="flex space-x-2">
                <button
                  onClick={handleDownloadPDF}
                  className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300 flex items-center"
                >
                  <DownloadIcon className="w-4 h-4 mr-2" />
                  Download
                </button>
                <button
                  onClick={() => {
                    setShowPDFViewer(false)
                    setPdfUrl(null)
                    setPdfBlob(null)
                  }}
                  className="px-4 py-2 glass-button backdrop-blur-sm bg-red-500/20 border border-red-400/30 text-white rounded-xl hover:bg-red-500/30 transition-all duration-300"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 p-6">
              <iframe
                src={pdfUrl}
                className="w-full h-full rounded-2xl border border-white/20"
                title="Admission Letter PDF"
              />
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Share Modal */}
      {showWhatsAppShare && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl w-full max-w-md animate-scale-in">
            <h3 className="text-2xl font-bold text-white mb-6">Send WhatsApp Message</h3>
            <p className="text-gray-300 mb-4">To: {selectedStudent.fullName} ({selectedStudent.phone})</p>
            <div className="space-y-3">
              <button
                onClick={() => sendWhatsAppMessage(`Hello ${selectedStudent.fullName}, your application to East Africa Vision Institute has been received and is being reviewed. We'll get back to you soon!`)}
                className="w-full p-3 glass-button backdrop-blur-sm bg-green-500/20 border border-green-400/30 text-green-200 hover:text-white rounded-2xl transition-all duration-300 text-left"
              >
                📝 Application Received
              </button>
              <button
                onClick={() => sendWhatsAppMessage(`Congratulations ${selectedStudent.fullName}! Your application to East Africa Vision Institute has been APPROVED. Please check your email for your admission letter.`)}
                className="w-full p-3 glass-button backdrop-blur-sm bg-green-500/20 border border-green-400/30 text-green-200 hover:text-white rounded-2xl transition-all duration-300 text-left"
              >
                ✅ Approval Notification
              </button>
              <button
                onClick={() => sendWhatsAppMessage(`Hello ${selectedStudent.fullName}, we need additional information for your application to East Africa Vision Institute. Please call us at 0726022044.`)}
                className="w-full p-3 glass-button backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 text-blue-200 hover:text-white rounded-2xl transition-all duration-300 text-left"
              >
                📞 Request More Info
              </button>
            </div>
            <button
              onClick={() => setShowWhatsAppShare(false)}
              className="w-full mt-4 px-6 py-3 glass-button backdrop-blur-sm bg-gray-500/20 border border-gray-400/30 text-white rounded-2xl hover:bg-gray-500/30 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-8 shadow-2xl w-full max-w-md animate-scale-in">
            <h3 className="text-2xl font-bold text-white mb-6">Dashboard Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-white font-medium mb-2">Reporting Date</label>
                <input
                  type="date"
                  value={settings.reportingDate}
                  onChange={(e) => setSettings({...settings, reportingDate: e.target.value})}
                  className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white"
                />
              </div>
              <div>
                <label className="block text-white font-medium mb-2">Approval Mode</label>
                <select
                  value={settings.approvalMode}
                  onChange={(e) => setSettings({...settings, approvalMode: e.target.value as 'manual' | 'automatic'})}
                  className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white"
                >
                  <option value="manual">Manual Approval</option>
                  <option value="automatic">Automatic Approval</option>
                </select>
              </div>
              {settings.approvalMode === 'automatic' && (
                <div>
                  <label className="block text-white font-medium mb-2">Auto-Approval Delay (minutes)</label>
                  <input
                    type="number"
                    min="1"
                    value={settings.autoApprovalDelay}
                    onChange={(e) => setSettings({...settings, autoApprovalDelay: Number(e.target.value)})}
                    className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white"
                  />
                </div>
              )}
            </div>
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 px-6 py-3 glass-button backdrop-blur-sm bg-gray-500/20 border border-gray-400/30 text-white rounded-2xl hover:bg-gray-500/30 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Save settings logic here
                  setShowSettings(false)
                }}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}

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

        .glass-input {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
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

        @keyframes scale-in {
          0% { opacity: 0; transform: scale(0.9); }
          100% { opacity: 1; transform: scale(1); }
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

        .animate-scale-in {
          animation: scale-in 0.3s ease-out both;
        }
      `}</style>
    </div>
  )
}