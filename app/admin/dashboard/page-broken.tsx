'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { generateAdmissionPDF, downloadPDF, viewPDF, debugPDFFields, type StudentDetails } from '../../utils/pdfGenerator'

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
  createdAt: string
}

const initialStudents: Student[] = [
  {
    id: '1',
    fullName: 'Jane Doe',
    admissionNumber: 'EAVI/0001/25',
    email: 'jane.doe@example.com',
    phone: '+254712345678',
    course: 'Computer Science',
    status: 'Pending',
  },
  {
    id: '2',
    fullName: 'John Smith',
    admissionNumber: 'EAVI/0002/25',
    email: 'john.smith@example.com',
    phone: '+256701234567',
    course: 'Business Administration',
    status: 'Accepted',
  },
  {
    id: '3',
    fullName: 'Amina Hassan',
    admissionNumber: 'EAVI/0003/25',
    email: 'amina.hassan@example.com',
    phone: '+255713334455',
    course: 'Public Health',
    status: 'Rejected',
  },
]

const initialCourses: Course[] = [
  { id: '1', name: 'Computer Science', feeBalance: 500000, feePerYear: 1200000, createdAt: new Date().toISOString() },
  { id: '2', name: 'Business Administration', feeBalance: 400000, feePerYear: 1000000, createdAt: new Date().toISOString() },
  { id: '3', name: 'Public Health', feeBalance: 450000, feePerYear: 1100000, createdAt: new Date().toISOString() }
]

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('students')
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [pdfGenerating, setPdfGenerating] = useState<string | null>(null)
  const [reportingDate, setReportingDate] = useState('')
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)

  // Modal states
  const [showStudentModal, setShowStudentModal] = useState(false)
  const [showCourseModal, setShowCourseModal] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)

  // Form states
  const [studentForm, setStudentForm] = useState({
    fullName: '', admissionNumber: '', email: '', phone: '', course: '', status: 'Pending' as Status
  })
  const [courseForm, setCourseForm] = useState({ name: '', feeBalance: '', feePerYear: '' })

  // Load data from localStorage
  useEffect(() => {
    const loadApplications = () => {
      try {
        const savedApplications = JSON.parse(localStorage.getItem('studentApplications') || '[]')
        const mergedStudents = [...initialStudents]
        
        savedApplications.forEach((app: any) => {
          const exists = mergedStudents.some(s => s.email === app.email)
          if (!exists && app.fullName && app.email && app.phone && app.course) {
            const studentWithAdmission = {
              ...app,
              admissionNumber: app.admissionNumber || `EAVI/${String(mergedStudents.length + 1).padStart(4, '0')}/25`
            }
            mergedStudents.unshift(studentWithAdmission)
          }
        })
        
        setStudents(mergedStudents)
      } catch (error) {
        console.error('Error loading applications:', error)
        setStudents(initialStudents)
      }
    }
    
    const loadCourses = () => {
      try {
        const savedCourses = JSON.parse(localStorage.getItem('instituteCourses') || '[]')
        if (savedCourses.length > 0) {
          setCourses(savedCourses)
        } else {
          localStorage.setItem('instituteCourses', JSON.stringify(initialCourses))
        }
      } catch (error) {
        console.error('Error loading courses:', error)
        setCourses(initialCourses)
      }
    }
    
    loadApplications()
    loadCourses()
    
    const savedReportingDate = localStorage.getItem('adminReportingDate')
    if (savedReportingDate) {
      setReportingDate(savedReportingDate)
    }
  }, [])

  // Filtered students
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return students.filter((s) => {
      const matchQuery = !q || 
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'All' || s.status === statusFilter
      return matchQuery && matchStatus
    })
  }, [search, students, statusFilter])

  // Student actions
  const setStatus = (id: string, status: Status) => {
    const updatedStudents = students.map((s) => s.id === id ? { ...s, status } : s)
    setStudents(updatedStudents)
    
    const savedApplications = JSON.parse(localStorage.getItem('studentApplications') || '[]')
    const updatedApplications = savedApplications.map((app: any) => 
      app.id === id ? { ...app, status } : app
    )
    localStorage.setItem('studentApplications', JSON.stringify(updatedApplications))
  }

  const generateAdmissionNumber = () => {
    return `EAVI/${String(students.length + 1).padStart(4, '0')}/25`
  }

  // PDF generation functions
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

  // Communication actions
  const call = (phone: string) => window.open(`tel:${phone}`)
  const sms = (phone: string) => window.open(`sms:${phone}`)
  const whatsapp = (phone: string) => window.open(`https://wa.me/${phone.replace(/[^0-9]/g, '')}`)

  const saveStudent = () => {
    const newStudent: Student = {
      id: editingStudent?.id || Date.now().toString(),
      ...studentForm,
      admissionNumber: studentForm.admissionNumber || generateAdmissionNumber()
    }

    if (editingStudent) {
      setStudents(students.map(s => s.id === editingStudent.id ? newStudent : s))
    } else {
      setStudents([newStudent, ...students])
    }

    setShowStudentModal(false)
    setEditingStudent(null)
    setStudentForm({ fullName: '', admissionNumber: '', email: '', phone: '', course: '', status: 'Pending' })
  }

  const saveCourse = () => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name: courseForm.name,
      feeBalance: Number(courseForm.feeBalance),
      feePerYear: Number(courseForm.feePerYear),
      createdAt: new Date().toISOString()
    }

    const updatedCourses = [...courses, newCourse]
    setCourses(updatedCourses)
    localStorage.setItem('instituteCourses', JSON.stringify(updatedCourses))
    
    setShowCourseModal(false)
    setCourseForm({ name: '', feeBalance: '', feePerYear: '' })
  }

  const handleReportingDateChange = (date: string) => {
    setReportingDate(date)
    localStorage.setItem('adminReportingDate', date)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 lg:static lg:inset-0`}>
        <div className="flex items-center justify-between h-16 px-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-gray-900">EAVI Admin</h2>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            ✕
          </button>
        </div>

        <nav className="mt-5 px-2">
          <div className="space-y-1">
            <button
              onClick={() => setActiveTab('students')}
              className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                activeTab === 'students' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              👥 Students ({students.length})
            </button>
            <button
              onClick={() => setActiveTab('courses')}
              className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                activeTab === 'courses' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              📚 Courses ({courses.length})
            </button>
            <button
              onClick={() => setActiveTab('settings')}
              className={`w-full flex items-center px-2 py-2 text-sm font-medium rounded-md ${
                activeTab === 'settings' ? 'bg-blue-100 text-blue-700' : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
              }`}
            >
              ⚙️ Settings
            </button>
          </div>

          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="px-2">
              <h3 className="text-xs font-semibold text-gray-400 uppercase tracking-wide">Quick Actions</h3>
              <div className="mt-2 space-y-1">
                <button
                  onClick={() => setShowStudentModal(true)}
                  className="w-full flex items-center px-2 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-50"
                >
                  ➕ Add Student
                </button>
                <button
                  onClick={() => setShowCourseModal(true)}
                  className="w-full flex items-center px-2 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-50"
                >
                  ➕ Add Course
                </button>
                <button
                  onClick={() => window.location.reload()}
                  className="w-full flex items-center px-2 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-50"
                >
                  🔄 Refresh
                </button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-4 left-0 right-0 px-2">
            <Link href="/" className="w-full flex items-center px-2 py-2 text-sm text-gray-600 rounded-md hover:bg-gray-50">
              ← Logout
            </Link>
          </div>
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 lg:ml-0">
        {/* Top bar */}
        <header className="bg-white shadow-sm border-b border-gray-200">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              <div className="flex items-center">
                <button
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                  className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
                >
                  ☰
                </button>
                <h1 className="ml-4 lg:ml-0 text-2xl font-bold text-gray-900 capitalize">
                  {activeTab} Dashboard
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Content area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          {activeTab === 'students' && (
            <div className="space-y-6">
              {/* Search and filters */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1">
                    <input
                      type="text"
                      placeholder="Search students..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value as Status | 'All')}
                    className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="All">All ({filtered.length})</option>
                    <option value="Pending">Pending ({students.filter(s => s.status === 'Pending').length})</option>
                    <option value="Accepted">Accepted ({students.filter(s => s.status === 'Accepted').length})</option>
                    <option value="Rejected">Rejected ({students.filter(s => s.status === 'Rejected').length})</option>
                  </select>
                </div>
              </div>

              {/* Student cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map((student) => (
                  <div key={student.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 truncate">{student.fullName}</h3>
                        <p className="text-sm text-gray-500">{student.admissionNumber}</p>
                        <p className="text-sm text-gray-600 mt-1">{student.course}</p>
                      </div>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        student.status === 'Accepted' ? 'bg-green-100 text-green-800' :
                        student.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        'bg-yellow-100 text-yellow-800'
                      }`}>
                        {student.status}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-1 mb-3">
                      <button
                        onClick={() => setStatus(student.id, 'Accepted')}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white px-2 py-1 rounded text-xs"
                      >
                        ✓ Approve
                      </button>
                      <button
                        onClick={() => setStatus(student.id, 'Rejected')}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white px-2 py-1 rounded text-xs"
                      >
                        ✗ Reject
                      </button>
                    </div>

                    <div className="grid grid-cols-2 gap-1 mb-3">
                      <button
                        onClick={() => handleViewPDF(student)}
                        disabled={pdfGenerating === student.id}
                        className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-2 py-1 rounded text-xs disabled:opacity-50"
                      >
                        {pdfGenerating === student.id ? '...' : '📄 View'}
                      </button>
                      <button
                        onClick={() => handleDownloadPDF(student)}
                        disabled={pdfGenerating === student.id}
                        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-2 py-1 rounded text-xs disabled:opacity-50"
                      >
                        {pdfGenerating === student.id ? '...' : '⬇️ Download'}
                      </button>
                    </div>

                    <div className="grid grid-cols-3 gap-1">
                      <button
                        onClick={() => call(student.phone)}
                        className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded text-xs"
                        title="Call"
                      >
                        📞
                      </button>
                      <button
                        onClick={() => sms(student.phone)}
                        className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-2 py-1 rounded text-xs"
                        title="SMS"
                      >
                        💬
                      </button>
                      <button
                        onClick={() => whatsapp(student.phone)}
                        className="bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded text-xs"
                        title="WhatsApp"
                      >
                        💚
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {filtered.length === 0 && (
                <div className="text-center py-12">
                  <div className="text-gray-400 text-6xl mb-4">👥</div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No students found</h3>
                  <p className="text-gray-500">Try adjusting your search or filters.</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'courses' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {courses.map((course) => (
                  <div key={course.id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{course.name}</h3>
                    <div className="space-y-2 text-sm text-gray-600">
                      <p>Fee Balance: <span className="font-medium">UGX {course.feeBalance.toLocaleString()}</span></p>
                      <p>Fee/Year: <span className="font-medium">UGX {course.feePerYear.toLocaleString()}</span></p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'settings' && (
            <div className="space-y-6">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">PDF Settings</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Reporting Date
                    </label>
                    <input
                      type="date"
                      value={reportingDate}
                      onChange={(e) => handleReportingDateChange(e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      {reportingDate 
                        ? `Using: ${new Date(reportingDate).toLocaleDateString('en-GB')}`
                        : `Using current date: ${new Date().toLocaleDateString('en-GB')}`
                      }
                    </p>
                  </div>
                  <button
                    onClick={async () => {
                      const fields = await debugPDFFields()
                      console.log('PDF Fields:', fields)
                      alert(`Found ${fields.length} PDF fields. Check console for details.`)
                    }}
                    className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-4 py-2 rounded-md text-sm"
                  >
                    🔍 Debug PDF Fields
                  </button>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Student Modal */}
      {showStudentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Student</h3>
            </div>
            <div className="p-6 space-y-4">
              <input
                placeholder="Full Name"
                value={studentForm.fullName}
                onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Email"
                type="email"
                value={studentForm.email}
                onChange={(e) => setStudentForm({ ...studentForm, email: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Phone"
                value={studentForm.phone}
                onChange={(e) => setStudentForm({ ...studentForm, phone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <select
                value={studentForm.course}
                onChange={(e) => setStudentForm({ ...studentForm, course: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Course</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.name}>{course.name}</option>
                ))}
              </select>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowStudentModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={saveStudent}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {showCourseModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-white w-full max-w-lg rounded-lg shadow-xl">
            <div className="px-6 py-4 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Add Course</h3>
            </div>
            <div className="p-6 space-y-4">
              <input
                placeholder="Course Name"
                value={courseForm.name}
                onChange={(e) => setCourseForm({ ...courseForm, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Fee Balance (UGX)"
                type="number"
                value={courseForm.feeBalance}
                onChange={(e) => setCourseForm({ ...courseForm, feeBalance: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
              <input
                placeholder="Fee Per Year (UGX)"
                type="number"
                value={courseForm.feePerYear}
                onChange={(e) => setCourseForm({ ...courseForm, feePerYear: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex justify-end gap-3">
              <button
                onClick={() => setShowCourseModal(false)}
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-2 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={saveCourse}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}