'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { generateAdmissionPDF, downloadPDF, viewPDF, debugPDFFields, type StudentDetails } from '../../utils/pdfGenerator'
import { useDebounce } from '../../hooks/useDebounce'
import { Pagination, usePagination } from '../../components/Pagination'
import { EditIcon, DeleteIcon, ViewIcon, PlusIcon, PhoneIcon, SMSIcon, WhatsAppIcon } from '../../components/Icons'
import { StudentEditModal } from '../../components/StudentEditModal'
import { CourseEditModal } from '../../components/CourseEditModal'
import { ConfirmModal } from '../../components/Modal'
import { EmailService } from '../../services/emailService'
import { SupabaseService } from '../../services/supabaseService'
import { AutoApprovalService } from '../../services/autoApprovalService'

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
  appliedAt?: string
  source?: string
  location?: string
}

type Course = {
  id: string
  name: string
  feeBalance: number
  feePerYear: number
  createdAt: string
}

export default function AdminDashboard() {
  // State
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const debouncedSearch = useDebounce(search, 300)
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All')
  const [courses, setCourses] = useState<Course[]>([])
  const [pdfGenerating, setPdfGenerating] = useState<string | null>(null)
  const [reportingDate, setReportingDate] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  // Modals
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [showSMSModal, setShowSMSModal] = useState(false)
  const [selectedStudentForSMS, setSelectedStudentForSMS] = useState<Student | null>(null)
  const [smsMessage, setSmsMessage] = useState('')
  
  // Edit/Delete modals
  const [showStudentEditModal, setShowStudentEditModal] = useState(false)
  const [showCourseEditModal, setShowCourseEditModal] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [deleteType, setDeleteType] = useState<'student' | 'course'>('student')
  const [emailLogs, setEmailLogs] = useState<any[]>([])
  const [approvalMode, setApprovalMode] = useState<'manual' | 'automatic'>('manual')
  const [autoApprovalDelay, setAutoApprovalDelay] = useState(5)
  
  // Forms
  const [studentForm, setStudentForm] = useState({
    fullName: '', admissionNumber: '', email: '', phone: '', course: '', status: 'Pending' as Status, kcseGrade: ''
  })
  const [courseForm, setCourseForm] = useState({ name: '', feeBalance: '', feePerYear: '' })

  // Load data from Supabase
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        setError(null)
        console.log('🚀 Loading data from Supabase...')
        
        // Load students from Supabase
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
          kcseGrade: student.kcse_grade,
          appliedAt: student.applied_at,
          source: student.source || 'manual',
          location: student.location
        }))
        
        setStudents(formattedStudents)
        
        // Load courses from Supabase
        const supabaseCourses = await SupabaseService.getCourses()
        console.log('✅ Courses loaded:', supabaseCourses.length)
        
        const formattedCourses = supabaseCourses.map(course => ({
          id: course.id,
          name: course.name,
          feeBalance: course.fee_balance,
          feePerYear: course.fee_per_year,
          createdAt: course.created_at || new Date().toISOString()
        }))
        
        setCourses(formattedCourses)
        
        // Load settings from Supabase
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
        
        // Load email logs from Supabase
        try {
          const emailLogsData = await EmailService.getEmailLogs()
          setEmailLogs(emailLogsData)
        } catch (emailError) {
          console.warn('Could not load email logs:', emailError)
        }
        
        // Initialize auto-approval system if enabled
        if (approvalModeSetting?.value === 'automatic') {
          await AutoApprovalService.initializeAutoApproval()
          console.log('🚀 Auto-approval system initialized')
        }
        
      } catch (error) {
        console.error('Error loading data from Supabase:', error)
        setError('Failed to load dashboard data. Please check your connection.')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
    
    // Cleanup auto-approval timers on component unmount
    return () => {
      AutoApprovalService.cleanup()
    }
  }, [])

  // Filter students with debounced search
  const filtered = useMemo(() => {
    const q = debouncedSearch.trim().toLowerCase()
    return students.filter((s) => {
      const matchQuery = !q || 
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q) ||
        (s.kcseGrade && s.kcseGrade.toLowerCase().includes(q))
      const matchStatus = statusFilter === 'All' || s.status === statusFilter
      return matchQuery && matchStatus
    })
  }, [debouncedSearch, students, statusFilter])

  // Pagination
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12
  const totalPages = Math.ceil(filtered.length / itemsPerPage)
  
  const paginatedStudents = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    return filtered.slice(startIndex, startIndex + itemsPerPage)
  }, [filtered, currentPage, itemsPerPage])

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearch, statusFilter])

  // Actions
  const setStatus = async (id: string, status: Status) => {
    const student = students.find(s => s.id === id)
    if (!student) return

    try {
      // Cancel auto-approval timer if exists (manual action takes precedence)
      AutoApprovalService.cancelAutoApproval(id)
      
      // Update student status in Supabase
      await SupabaseService.updateStudent(id, { status })
      
      // Update local state
      const updatedStudents = students.map((s) => s.id === id ? { ...s, status } : s)
      setStudents(updatedStudents)

      // Auto-send admission PDF email when student is approved
      if (status === 'Accepted' && student.email && student.admissionNumber) {
        try {
          console.log(`🎉 Student approved! Auto-sending admission PDF to ${student.email}...`)
          
          // Generate PDF
          const courseInfo = courses.find(c => c.name === student.course)
          const studentDetails: StudentDetails = {
            fullName: student.fullName,
            course: student.course,
            admissionNumber: student.admissionNumber,
            reportingDate: reportingDate,
            feeBalance: courseInfo?.feeBalance,
            feePerYear: courseInfo?.feePerYear
          }
          
          const pdfBytes = await generateAdmissionPDF(studentDetails)
          
          // Send email with PDF attachment
          const emailSent = await EmailService.sendAdmissionPDF({
            fullName: student.fullName,
            email: student.email,
            course: student.course,
            admissionNumber: student.admissionNumber,
            pdfBytes
          })
          
          if (emailSent) {
            console.log(`✅ Admission PDF email sent successfully to ${student.email}`)
            // Refresh email logs to show the new email
            const emailLogsData = await EmailService.getEmailLogs()
            setEmailLogs(emailLogsData)
          } else {
            console.log(`⚠️ Failed to send admission PDF email to ${student.email}`)
          }
          
        } catch (error) {
          console.error('Error auto-sending admission PDF:', error)
          // Still update status even if email fails
        }
      }
    } catch (error) {
      console.error('Error updating student status:', error)
      alert('Failed to update student status. Please try again.')
    }
  }

  const handleViewPDF = async (student: Student) => {
    try {
      setPdfGenerating(student.id)
      const courseInfo = courses.find(c => c.name === student.course)
      
      const studentDetails: StudentDetails = {
        fullName: student.fullName,
        course: student.course,
        admissionNumber: student.admissionNumber,
        reportingDate: reportingDate,
        feeBalance: courseInfo?.feeBalance,
        feePerYear: courseInfo?.feePerYear
      }
      
      const pdfBytes = await generateAdmissionPDF(studentDetails)
      viewPDF(pdfBytes)
    } catch (error) {
      console.error('Error viewing PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setPdfGenerating(null)
    }
  }

  const handleDownloadPDF = async (student: Student) => {
    try {
      setPdfGenerating(student.id)
      const courseInfo = courses.find(c => c.name === student.course)
      
      const studentDetails: StudentDetails = {
        fullName: student.fullName,
        course: student.course,
        admissionNumber: student.admissionNumber,
        reportingDate: reportingDate,
        feeBalance: courseInfo?.feeBalance,
        feePerYear: courseInfo?.feePerYear
      }
      
      const pdfBytes = await generateAdmissionPDF(studentDetails)
      downloadPDF(pdfBytes, `${student.fullName}-admission-letter.pdf`)
    } catch (error) {
      console.error('Error downloading PDF:', error)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      setPdfGenerating(null)
    }
  }

  // Communication functions
  const call = (phone: string) => {
    window.open(`tel:${phone}`)
  }

  const openSMSModal = (student: Student) => {
    setSelectedStudentForSMS(student)
    setSmsMessage(`Hello ${student.fullName}, this is East Africa Vision Institute. Your admission status: ${student.status}. For inquiries, call 0726022044 or 0748022044. Thank you.`)
    setShowSMSModal(true)
  }

  const sendSMS = () => {
    if (selectedStudentForSMS && smsMessage.trim()) {
      const phone = selectedStudentForSMS.phone.replace(/[^0-9]/g, '')
      const encodedMessage = encodeURIComponent(smsMessage)
      const smsUrl = `sms:${phone}?body=${encodedMessage}`
      window.open(smsUrl)
      setShowSMSModal(false)
      setSmsMessage('')
      setSelectedStudentForSMS(null)
    }
  }

  const sendToWhatsApp = () => {
    if (selectedStudentForSMS && smsMessage.trim()) {
      const phone = selectedStudentForSMS.phone.replace(/[^0-9]/g, '')
      const encodedMessage = encodeURIComponent(smsMessage)
      const whatsappUrl = `https://wa.me/${phone}?text=${encodedMessage}`
      window.open(whatsappUrl)
      setShowSMSModal(false)
      setSmsMessage('')
      setSelectedStudentForSMS(null)
    }
  }

  const whatsapp = (phone: string) => {
    const cleanPhone = phone.replace(/[^0-9]/g, '')
    window.open(`https://wa.me/${cleanPhone}`)
  }

  // Student management
  const addStudent = async () => {
    try {
      const newStudent = {
        full_name: studentForm.fullName,
        admission_number: studentForm.admissionNumber,
        email: studentForm.email,
        phone: studentForm.phone,
        course: studentForm.course,
        status: studentForm.status,
        kcse_grade: studentForm.kcseGrade,
        applied_at: new Date().toISOString(),
        source: 'manual' as const,
        location: ''
      }

      const createdStudent = await SupabaseService.createStudent(newStudent)
      
      const formattedStudent = {
        id: createdStudent.id,
        fullName: createdStudent.full_name,
        admissionNumber: createdStudent.admission_number,
        email: createdStudent.email || '',
        phone: createdStudent.phone,
        course: createdStudent.course,
        status: createdStudent.status as Status,
        kcseGrade: createdStudent.kcse_grade,
        appliedAt: createdStudent.applied_at,
        source: createdStudent.source || 'manual',
        location: createdStudent.location
      }

      setStudents([formattedStudent, ...students])
      setStudentForm({
        fullName: '', admissionNumber: '', email: '', phone: '', course: '', status: 'Pending', kcseGrade: ''
      })
      setShowStudentModal(false)
    } catch (error) {
      console.error('Error adding student:', error)
      alert('Failed to add student. Please try again.')
    }
  }

  const editStudent = async (student: Student) => {
    try {
      const updatedData = {
        full_name: student.fullName,
        admission_number: student.admissionNumber,
        email: student.email,
        phone: student.phone,
        course: student.course,
        status: student.status,
        kcse_grade: student.kcseGrade
      }

      await SupabaseService.updateStudent(student.id, updatedData)
      
      const updatedStudents = students.map(s => s.id === student.id ? student : s)
      setStudents(updatedStudents)
      setShowStudentEditModal(false)
      setSelectedStudent(null)
    } catch (error) {
      console.error('Error updating student:', error)
      alert('Failed to update student. Please try again.')
    }
  }

  const deleteStudent = async (id: string) => {
    try {
      await SupabaseService.deleteStudent(id)
      setStudents(students.filter(s => s.id !== id))
      setShowDeleteConfirm(false)
      setSelectedStudent(null)
    } catch (error) {
      console.error('Error deleting student:', error)
      alert('Failed to delete student. Please try again.')
    }
  }

  // Course management
  const addCourse = async () => {
    try {
      const newCourse = {
        name: courseForm.name,
        fee_balance: parseFloat(courseForm.feeBalance) || 0,
        fee_per_year: parseFloat(courseForm.feePerYear) || 0
      }

      const createdCourse = await SupabaseService.createCourse(newCourse)
      
      const formattedCourse = {
        id: createdCourse.id,
        name: createdCourse.name,
        feeBalance: createdCourse.fee_balance,
        feePerYear: createdCourse.fee_per_year,
        createdAt: createdCourse.created_at || new Date().toISOString()
      }

      setCourses([...courses, formattedCourse])
      setCourseForm({ name: '', feeBalance: '', feePerYear: '' })
      setShowCourseModal(false)
    } catch (error) {
      console.error('Error adding course:', error)
      alert('Failed to add course. Please try again.')
    }
  }

  const editCourse = async (course: Course) => {
    try {
      const updatedData = {
        name: course.name,
        fee_balance: course.feeBalance,
        fee_per_year: course.feePerYear
      }

      await SupabaseService.updateCourse(course.id, updatedData)
      
      const updatedCourses = courses.map(c => c.id === course.id ? course : c)
      setCourses(updatedCourses)
      setShowCourseEditModal(false)
      setSelectedCourse(null)
    } catch (error) {
      console.error('Error updating course:', error)
      alert('Failed to update course. Please try again.')
    }
  }

  const deleteCourse = async (id: string) => {
    try {
      await SupabaseService.deleteCourse(id)
      setCourses(courses.filter(c => c.id !== id))
      setShowDeleteConfirm(false)
      setSelectedCourse(null)
    } catch (error) {
      console.error('Error deleting course:', error)
      alert('Failed to delete course. Please try again.')
    }
  }

  // Settings
  const saveReportingDate = async () => {
    try {
      await SupabaseService.setSetting('reporting_date', reportingDate)
      alert('Reporting date saved!')
    } catch (error) {
      console.error('Error saving reporting date:', error)
      alert('Failed to save reporting date')
    }
  }

  const saveApprovalSettings = async () => {
    try {
      await SupabaseService.setSetting('approval_mode', approvalMode)
      await SupabaseService.setSetting('auto_approval_delay', autoApprovalDelay.toString())
      
      // Initialize or cleanup auto-approval system based on mode
      if (approvalMode === 'automatic') {
        await AutoApprovalService.initializeAutoApproval()
        console.log('🚀 Auto-approval system enabled')
      } else {
        AutoApprovalService.cleanup()
        console.log('🛑 Auto-approval system disabled')
      }
      
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
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="px-4 py-2 border border-purple-300 rounded-md text-sm font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 transition-colors"
              >
                ⚙️ Settings
              </button>
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
        {/* Settings Panel */}
        {showSettings && (
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
                    onClick={saveApprovalSettings}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 font-medium transition-colors"
                  >
                    Save Settings
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

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

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-4 mb-6">
          <button
            onClick={() => setShowStudentModal(true)}
            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Student
          </button>
          <button
            onClick={() => setShowCourseModal(true)}
            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
          >
            <PlusIcon className="w-5 h-5 mr-2" />
            Add Course
          </button>
        </div>

        {/* Search and Filter */}
        <div className="bg-white shadow-lg rounded-lg mb-8 border border-gray-200">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder="🔍 Search students by name, email, phone, or admission number..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <div>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as Status | 'All')}
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">⏳ Pending</option>
                  <option value="Accepted">✅ Accepted</option>
                  <option value="Rejected">❌ Rejected</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Courses Section */}
        <div className="bg-white shadow-lg rounded-lg mb-8 border border-gray-200">
          <div className="px-6 py-5 sm:p-6">
            <h3 className="text-xl leading-6 font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-2">📚</span>
              Courses ({courses.length})
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map(course => (
                <div key={course.id} className="bg-gradient-to-br from-purple-50 to-indigo-50 border border-purple-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex justify-between items-start mb-2">
                    <h4 className="font-bold text-purple-900 text-lg">{course.name}</h4>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => {
                          setSelectedCourse(course)
                          setShowCourseEditModal(true)
                        }}
                        className="p-1 text-blue-600 hover:text-blue-800"
                      >
                        <EditIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedCourse(course)
                          setDeleteType('course')
                          setShowDeleteConfirm(true)
                        }}
                        className="p-1 text-red-600 hover:text-red-800"
                      >
                        <DeleteIcon className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
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
          </div>
        </div>

        {/* Students Table */}
        <div className="bg-white shadow-lg rounded-lg border border-gray-200">
          <div className="px-6 py-5 sm:p-6">
            <h3 className="text-xl leading-6 font-bold text-gray-900 mb-6 flex items-center">
              <span className="text-2xl mr-2">👥</span>
              Students ({filtered.length})
            </h3>
            
            {filtered.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-6xl text-gray-300 mb-4">👨‍🎓</div>
                <h4 className="text-xl font-medium text-gray-500 mb-2">No students found</h4>
                <p className="text-gray-400">
                  {search || statusFilter !== 'All' 
                    ? 'Try adjusting your search or filter criteria'
                    : 'Students will appear here when they submit applications'
                  }
                </p>
                {!search && statusFilter === 'All' && (
                  <div className="mt-4">
                    <Link 
                      href="/" 
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    >
                      🌐 View Application Form
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
                  {paginatedStudents.map((student) => (
                    <div key={student.id} className="bg-gradient-to-br from-gray-50 to-blue-50 border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                      {/* Student Header */}
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <h4 className="font-bold text-gray-900 text-lg flex items-center">
                            <span className="mr-2">👤</span>
                            {student.fullName}
                          </h4>
                          <p className="text-sm text-gray-600">{student.admissionNumber}</p>
                          {student.source === 'online_application' && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 mt-1">
                              🌐 Online Application
                            </span>
                          )}
                        </div>
                        <div className="flex space-x-1">
                          <button
                            onClick={() => {
                              setSelectedStudent(student)
                              setShowStudentEditModal(true)
                            }}
                            className="p-1 text-blue-600 hover:text-blue-800"
                          >
                            <EditIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => {
                              setSelectedStudent(student)
                              setDeleteType('student')
                              setShowDeleteConfirm(true)
                            }}
                            className="p-1 text-red-600 hover:text-red-800"
                          >
                            <DeleteIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Student Details */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center text-sm text-gray-700">
                          <span className="mr-2">📧</span>
                          {student.email}
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <span className="mr-2">📱</span>
                          {student.phone}
                        </div>
                        <div className="flex items-center text-sm text-gray-700">
                          <span className="mr-2">📚</span>
                          {student.course}
                        </div>
                        {student.kcseGrade && (
                          <div className="flex items-center text-sm text-gray-700">
                            <span className="mr-2">📊</span>
                            KCSE Grade: {student.kcseGrade}
                          </div>
                        )}
                        {student.location && (
                          <div className="flex items-center text-sm text-gray-700">
                            <img src="/location.webp" alt="Location" className="mr-2 w-4 h-4" />
                            {student.location}
                          </div>
                        )}
                      </div>

                      {/* Status Badge */}
                      <div className="mb-4">
                        <span className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full ${
                          student.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                          student.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
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
                                onClick={() => setStatus(student.id, 'Accepted')}
                                className="flex-1 px-3 py-1 text-xs font-medium text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                              >
                                ✅ Accept
                              </button>
                              <button
                                onClick={() => setStatus(student.id, 'Rejected')}
                                className="flex-1 px-3 py-1 text-xs font-medium text-red-600 hover:text-red-900 bg-red-50 hover:bg-red-100 rounded-md transition-colors"
                              >
                                ❌ Reject
                              </button>
                            </>
                          )}
                          {student.status !== 'Pending' && (
                            <button
                              onClick={() => setStatus(student.id, 'Pending')}
                              className="flex-1 px-3 py-1 text-xs font-medium text-yellow-600 hover:text-yellow-900 bg-yellow-50 hover:bg-yellow-100 rounded-md transition-colors"
                            >
                              ⏳ Mark Pending
                            </button>
                          )}
                        </div>

                        {/* PDF Actions */}
                        {student.status === 'Accepted' && (
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleViewPDF(student)}
                              disabled={pdfGenerating === student.id}
                              className="flex-1 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors disabled:opacity-50"
                            >
                              {pdfGenerating === student.id ? '⏳' : '👁️'} View PDF
                            </button>
                            <button
                              onClick={() => handleDownloadPDF(student)}
                              disabled={pdfGenerating === student.id}
                              className="flex-1 px-3 py-1 text-xs font-medium text-purple-600 hover:text-purple-900 bg-purple-50 hover:bg-purple-100 rounded-md transition-colors disabled:opacity-50"
                            >
                              {pdfGenerating === student.id ? '⏳' : '📥'} Download
                            </button>
                          </div>
                        )}

                        {/* Communication Actions */}
                        <div className="flex space-x-2">
                          <button
                            onClick={() => call(student.phone)}
                            className="flex-1 px-3 py-1 text-xs font-medium text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                          >
                            📞 Call
                          </button>
                          <button
                            onClick={() => openSMSModal(student)}
                            className="flex-1 px-3 py-1 text-xs font-medium text-blue-600 hover:text-blue-900 bg-blue-50 hover:bg-blue-100 rounded-md transition-colors"
                          >
                            💬 SMS
                          </button>
                          <button
                            onClick={() => whatsapp(student.phone)}
                            className="flex-1 px-3 py-1 text-xs font-medium text-green-600 hover:text-green-900 bg-green-50 hover:bg-green-100 rounded-md transition-colors"
                          >
                            📱 WhatsApp
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-8 flex justify-center">
                    <Pagination
                      currentPage={currentPage}
                      totalItems={filtered.length}
                      itemsPerPage={itemsPerPage}
                      onPageChange={setCurrentPage}
                    />
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showStudentModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Student</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full Name"
                value={studentForm.fullName}
                onChange={(e) => setStudentForm({...studentForm, fullName: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="text"
                placeholder="Admission Number"
                value={studentForm.admissionNumber}
                onChange={(e) => setStudentForm({...studentForm, admissionNumber: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="email"
                placeholder="Email"
                value={studentForm.email}
                onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="tel"
                placeholder="Phone"
                value={studentForm.phone}
                onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <select
                value={studentForm.course}
                onChange={(e) => setStudentForm({...studentForm, course: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              >
                <option value="">Select Course</option>
                {courses.map(course => (
                  <option key={course.id} value={course.name}>{course.name}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="KCSE Grade (optional)"
                value={studentForm.kcseGrade}
                onChange={(e) => setStudentForm({...studentForm, kcseGrade: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="mt-6 flex space-x-3">
              <button
                onClick={addStudent}
                disabled={!studentForm.fullName || !studentForm.phone || !studentForm.course}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Student
              </button>
              <button
                onClick={() => setShowStudentModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showCourseModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Add New Course</h3>
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Course Name"
                value={courseForm.name}
                onChange={(e) => setCourseForm({...courseForm, name: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="number"
                placeholder="Fee Balance (KES)"
                value={courseForm.feeBalance}
                onChange={(e) => setCourseForm({...courseForm, feeBalance: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
              <input
                type="number"
                placeholder="Fee Per Year (KES)"
                value={courseForm.feePerYear}
                onChange={(e) => setCourseForm({...courseForm, feePerYear: e.target.value})}
                className="w-full border border-gray-300 rounded-md px-3 py-2"
              />
            </div>
            <div className="mt-6 flex space-x-3">
              <button
                onClick={addCourse}
                disabled={!courseForm.name}
                className="flex-1 px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Add Course
              </button>
              <button
                onClick={() => setShowCourseModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* SMS Modal */}
      {showSMSModal && selectedStudentForSMS && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              Send Message to {selectedStudentForSMS.fullName}
            </h3>
            <textarea
              value={smsMessage}
              onChange={(e) => setSmsMessage(e.target.value)}
              className="w-full border border-gray-300 rounded-md px-3 py-2 h-32 resize-none"
              placeholder="Type your message..."
            />
            <div className="mt-6 flex space-x-3">
              <button
                onClick={sendSMS}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                💬 Send SMS
              </button>
              <button
                onClick={sendToWhatsApp}
                className="flex-1 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                📱 WhatsApp
              </button>
              <button
                onClick={() => setShowSMSModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modals */}
      {showStudentEditModal && selectedStudent && (
        <StudentEditModal
          isOpen={showStudentEditModal}
          student={selectedStudent}
          onSave={editStudent}
          onClose={() => {
            setShowStudentEditModal(false)
            setSelectedStudent(null)
          }}
        />
      )}

      {showCourseEditModal && selectedCourse && (
        <CourseEditModal
          isOpen={showCourseEditModal}
          course={selectedCourse}
          onSave={editCourse}
          onClose={() => {
            setShowCourseEditModal(false)
            setSelectedCourse(null)
          }}
        />
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (selectedStudent || selectedCourse) && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title={`Delete ${deleteType === 'student' ? 'Student' : 'Course'}`}
          message={`Are you sure you want to delete ${
            deleteType === 'student' ? selectedStudent?.fullName : selectedCourse?.name
          }? This action cannot be undone.`}
          onConfirm={() => {
            if (deleteType === 'student' && selectedStudent) {
              deleteStudent(selectedStudent.id)
            } else if (deleteType === 'course' && selectedCourse) {
              deleteCourse(selectedCourse.id)
            }
          }}
          onClose={() => {
            setShowDeleteConfirm(false)
            setSelectedStudent(null)
            setSelectedCourse(null)
          }}
        />
      )}
    </div>
  )
}