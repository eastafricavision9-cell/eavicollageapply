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

// Initial courses data
const initialCourses: Course[] = [
  {
    id: '1',
    name: 'Computer Science',
    feeBalance: 500000,
    feePerYear: 1200000,
    createdAt: new Date().toISOString()
  },
  {
    id: '2', 
    name: 'Business Administration',
    feeBalance: 400000,
    feePerYear: 1000000,
    createdAt: new Date().toISOString()
  },
  {
    id: '3',
    name: 'Public Health',
    feeBalance: 450000,
    feePerYear: 1100000,
    createdAt: new Date().toISOString()
  }
]

export default function AdminDashboard() {
  const [students, setStudents] = useState<Student[]>([])
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [editingStudent, setEditingStudent] = useState<Student | null>(null)
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All')
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('students')
  
  // Course management state
  const [courses, setCourses] = useState<Course[]>(initialCourses)
  const [courseModalOpen, setCourseModalOpen] = useState(false)
  const [courseForm, setCourseForm] = useState({
    name: '',
    feeBalance: '',
    feePerYear: ''
  })
  
  // PDF generation state
  const [pdfGenerating, setPdfGenerating] = useState<string | null>(null)
  const [paybillMessage, setPaybillMessage] = useState<string | null>(null)
  
  // Reporting date settings
  const [reportingDate, setReportingDate] = useState('')
  const [showDateSettings, setShowDateSettings] = useState(false)

  // Load applications and courses from localStorage
  useEffect(() => {
    const loadApplications = () => {
      try {
        const savedApplications = JSON.parse(localStorage.getItem('studentApplications') || '[]')
        const mergedStudents = [...initialStudents]
        
        // Add applications that don't already exist
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
          // Save initial courses to localStorage
          localStorage.setItem('instituteCourses', JSON.stringify(initialCourses))
        }
      } catch (error) {
        console.error('Error loading courses:', error)
        setCourses(initialCourses)
      }
    }
    
    loadApplications()
    loadCourses()
    
    // Load reporting date from localStorage
    const savedReportingDate = localStorage.getItem('adminReportingDate')
    if (savedReportingDate) {
      setReportingDate(savedReportingDate)
    }
    
    // Listen for new applications from other tabs/windows
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'studentApplications') {
        loadApplications()
      } else if (e.key === 'instituteCourses') {
        loadCourses()
      }
    }
    
    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [])

  // Derived filtered students
  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    return students.filter((s) => {
      const matchQuery =
        !q ||
        s.fullName.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.phone.toLowerCase().includes(q) ||
        s.course.toLowerCase().includes(q) ||
        s.admissionNumber.toLowerCase().includes(q)
      const matchStatus = statusFilter === 'All' || s.status === statusFilter
      return matchQuery && matchStatus
    })
  }, [search, students, statusFilter])

  // Modal form state
  const [form, setForm] = useState<{
    fullName: string
    admissionNumber: string
    email: string
    phone: string
    course: string
    status: Status
  }>({
    fullName: '',
    admissionNumber: '',
    email: '',
    phone: '',
    course: '',
    status: 'Pending',
  })

  useEffect(() => {
    if (editingStudent) {
      setForm({
        fullName: editingStudent.fullName,
        admissionNumber: editingStudent.admissionNumber,
        email: editingStudent.email,
        phone: editingStudent.phone,
        course: editingStudent.course,
        status: editingStudent.status,
      })
    } else {
      setForm({ fullName: '', admissionNumber: '', email: '', phone: '', course: '', status: 'Pending' })
    }
  }, [editingStudent])

  // Generate admission number in format EAVI/0066/25
  const generateAdmissionNumber = () => {
    const currentYear = new Date().getFullYear().toString().slice(-2) // Get last 2 digits of year
    const nextNumber = students.length + 1
    const paddedNumber = nextNumber.toString().padStart(4, '0')
    return `EAVI/${paddedNumber}/${currentYear}`
  }

  // Course handlers
  const openCourseModal = () => {
    setCourseForm({ name: '', feeBalance: '', feePerYear: '' })
    setCourseModalOpen(true)
  }

  const handleCourseInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setCourseForm(prev => ({ ...prev, [name]: value }))
  }

  const saveCourse = () => {
    if (!courseForm.name || !courseForm.feeBalance || !courseForm.feePerYear) return
    
    const newCourse: Course = {
      id: Math.random().toString(36).slice(2, 9),
      name: courseForm.name,
      feeBalance: parseFloat(courseForm.feeBalance),
      feePerYear: parseFloat(courseForm.feePerYear),
      createdAt: new Date().toISOString()
    }
    
    setCourses(prev => [newCourse, ...prev])
    setCourseModalOpen(false)
    setCourseForm({ name: '', feeBalance: '', feePerYear: '' })
    
    // Save to localStorage
    const savedCourses = [...courses, newCourse]
    localStorage.setItem('instituteCourses', JSON.stringify(savedCourses))
    
    console.log('New course added:', newCourse)
  }

  // Handlers
  const openAddModal = () => {
    setEditingStudent(null)
    setModalOpen(true)
  }

  const openEditModal = (s: Student) => {
    setEditingStudent(s)
    setModalOpen(true)
  }

  const saveStudent = () => {
    if (!form.fullName || !form.email || !form.phone || !form.course) return

    if (editingStudent) {
      // When editing, keep existing admission number unless manually changed
      const updatedStudents = students.map((s) => (s.id === editingStudent.id ? { ...editingStudent, ...form } : s))
      setStudents(updatedStudents)
      
      // Update localStorage applications if this was from online application
      const savedApplications = JSON.parse(localStorage.getItem('studentApplications') || '[]')
      const updatedApplications = savedApplications.map((app: any) => 
        app.email === editingStudent.email ? { ...app, ...form } : app
      )
      localStorage.setItem('studentApplications', JSON.stringify(updatedApplications))
    } else {
      // For new students, auto-generate admission number
      const newStudent: Student = {
        id: Math.random().toString(36).slice(2, 9),
        fullName: form.fullName,
        admissionNumber: form.admissionNumber || generateAdmissionNumber(),
        email: form.email,
        phone: form.phone,
        course: form.course,
        status: form.status,
      }
      setStudents((prev) => [newStudent, ...prev])
      
      // Add to localStorage as well
      const savedApplications = JSON.parse(localStorage.getItem('studentApplications') || '[]')
      const applicationData = {
        ...newStudent,
        appliedAt: new Date().toISOString(),
        source: 'manual_entry'
      }
      savedApplications.unshift(applicationData)
      localStorage.setItem('studentApplications', JSON.stringify(savedApplications))
    }
    setModalOpen(false)
  }

  const setStatus = (id: string, status: Status) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, status } : s)))
    
    // Update localStorage
    const savedApplications = JSON.parse(localStorage.getItem('studentApplications') || '[]')
    const updatedApplications = savedApplications.map((app: any) => 
      app.id === id ? { ...app, status } : app
    )
    localStorage.setItem('studentApplications', JSON.stringify(updatedApplications))
  }

  const removeStudent = (id: string) => {
    setStudents((prev) => prev.filter((s) => s.id !== id))
    
    // Remove from localStorage
    const savedApplications = JSON.parse(localStorage.getItem('studentApplications') || '[]')
    const updatedApplications = savedApplications.filter((app: any) => app.id !== id)
    localStorage.setItem('studentApplications', JSON.stringify(updatedApplications))
  }

  // Reporting date handlers
  const handleReportingDateChange = (date: string) => {
    setReportingDate(date)
    localStorage.setItem('adminReportingDate', date)
  }

  const clearReportingDate = () => {
    setReportingDate('')
    localStorage.removeItem('adminReportingDate')
  }

  // Debug PDF fields function
  const handleDebugPDF = async () => {
    try {
      const fields = await debugPDFFields()
      alert(`PDF Form Fields Found:\n\n${fields.join('\n')}\n\nCheck console for more details.`)
    } catch (error) {
      console.error('Error debugging PDF:', error)
      alert('Error debugging PDF fields. Check console for details.')
    }
  }

  // PDF generation functions
  const handleViewPDF = async (student: Student) => {
    try {
      setPdfGenerating(student.id)
      
      // Find course fee information
      const courseInfo = courses.find(c => c.name === student.course)
      
      const studentDetails: StudentDetails = {
        fullName: student.fullName,
        course: student.course,
        admissionNumber: student.admissionNumber,
        reportingDate: reportingDate, // Pass reporting date to PDF generator
        feeBalance: courseInfo?.feeBalance, // Pass fee balance if available
        feePerYear: courseInfo?.feePerYear // Pass fee per year if available
      }
      
      const pdfBytes = await generateAdmissionPDF(studentDetails)
      viewPDF(pdfBytes)
      
      // Show paybill message with M-PESA details
      setPaybillMessage(`M-PESA Paybill: 257557, Account Number: ${student.admissionNumber}`)
      setTimeout(() => setPaybillMessage(null), 8000)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    } finally {
      setPdfGenerating(null)
    }
  }
  
  const handleDownloadPDF = async (student: Student) => {
    try {
      setPdfGenerating(student.id)
      
      // Find course fee information
      const courseInfo = courses.find(c => c.name === student.course)
      
      const studentDetails: StudentDetails = {
        fullName: student.fullName,
        course: student.course,
        admissionNumber: student.admissionNumber,
        reportingDate: reportingDate, // Pass reporting date to PDF generator
        feeBalance: courseInfo?.feeBalance, // Pass fee balance if available
        feePerYear: courseInfo?.feePerYear // Pass fee per year if available
      }
      
      const pdfBytes = await generateAdmissionPDF(studentDetails)
      const filename = `admission_${student.admissionNumber.replace(/\//g, '_')}.pdf`
      downloadPDF(pdfBytes, filename)
      
      // Show paybill message with M-PESA details
      setPaybillMessage(`M-PESA Paybill: 257557, Account Number: ${student.admissionNumber}`)
      setTimeout(() => setPaybillMessage(null), 8000)
      
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    } finally {
      setPdfGenerating(null)
    }
  }

  // Utilities for actions (frontend only)
  const call = (phone: string) => window.open(`tel:${phone}`)
  const sms = (phone: string) => window.open(`sms:${phone}`)
  const whatsapp = (phone: string) => window.open(`https://wa.me/${phone.replace(/[^\d]/g, '')}`)
  const share = (s: Student) => {
    const text = `Student: ${s.fullName} | ${s.admissionNumber} | ${s.course} | ${s.status}`
    if (navigator.share) navigator.share({ title: 'Student', text })
    else alert(text)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Paybill Message */}
      {paybillMessage && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 sticky top-0 z-30">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-green-800">
                PDF Generated Successfully! {paybillMessage}
              </p>
            </div>
            <div className="ml-auto pl-3">
              <div className="-mx-1.5 -my-1.5">
                <button
                  onClick={() => setPaybillMessage(null)}
                  className="inline-flex rounded-md p-1.5 text-green-500 hover:bg-green-100 focus:outline-none"
                >
                  <span className="sr-only">Dismiss</span>
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Top Bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between mb-3 md:mb-0">
            <div className="flex items-center gap-3">
              <h1 className="text-xl md:text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <span className="hidden sm:inline-block text-xs text-gray-500">East Africa Vision Institute</span>
            </div>
            <div className="flex items-center gap-2">
              <Link href="/" className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-3 text-sm rounded-lg">
                ← Logout
              </Link>
            </div>
          </div>
          
          {/* Mobile-friendly action buttons */}
          <div className="flex flex-wrap gap-2 md:hidden">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-3 text-sm rounded-lg flex-1 min-w-0"
              title="Refresh applications"
            >
              ↻ Refresh
            </button>
            <button
              onClick={openAddModal}
              className="btn-primary py-2 px-3 text-sm rounded-lg flex-1 min-w-0"
              title="Add Student"
            >
              + Student
            </button>
            <button
              onClick={openCourseModal}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-3 text-sm rounded-lg flex-1 min-w-0"
              title="Add Course"
            >
              + Course
            </button>
          </div>
          
          <div className="flex flex-wrap gap-2 md:hidden mt-2">
            <button
              onClick={() => {
                const updatedStudents = students.map((s) => ({ ...s, status: 'Accepted' as Status }))
                setStudents(updatedStudents)
                // Update localStorage
                const savedApplications = JSON.parse(localStorage.getItem('studentApplications') || '[]')
                const updatedApplications = savedApplications.map((app: any) => ({ ...app, status: 'Accepted' }))
                localStorage.setItem('studentApplications', JSON.stringify(updatedApplications))
              }}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-3 text-sm rounded-lg flex-1 min-w-0"
            >
              ✓ Approve All
            </button>
          </div>
          
          {/* Desktop buttons */}
          <div className="hidden md:flex items-center gap-3 mt-3">
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 px-4 text-sm rounded-md"
              title="Refresh applications"
            >
              ↻ Refresh
            </button>
            <button
              onClick={() => setShowDateSettings(!showDateSettings)}
              className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 py-2 px-4 text-sm rounded-md"
              title="Set Reporting Date"
            >
              📅 Reporting Date
            </button>
            <button
              onClick={handleDebugPDF}
              className="bg-orange-100 hover:bg-orange-200 text-orange-800 py-2 px-4 text-sm rounded-md"
              title="Debug PDF Fields"
            >
              🔍 Debug PDF
            </button>
            <button
              onClick={openAddModal}
              className="btn-primary py-2 px-4 text-sm rounded-md"
              title="Add Student"
            >
              + Add Student
            </button>
            <button
              onClick={openCourseModal}
              className="bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 text-sm rounded-md"
              title="Add Course"
            >
              + Add Course
            </button>
            <button
              onClick={() => {
                const updatedStudents = students.map((s) => ({ ...s, status: 'Accepted' as Status }))
                setStudents(updatedStudents)
                // Update localStorage
                const savedApplications = JSON.parse(localStorage.getItem('studentApplications') || '[]')
                const updatedApplications = savedApplications.map((app: any) => ({ ...app, status: 'Accepted' }))
                localStorage.setItem('studentApplications', JSON.stringify(updatedApplications))
              }}
              className="bg-green-600 hover:bg-green-700 text-white py-2 px-4 text-sm rounded-md"
            >
              Approve All
            </button>
          </div>
        </div>
      </header>

      {/* Filters */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 md:hidden">Search Students</label>
              <input
                type="text"
                placeholder="Search by name, email, phone, course..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              />
            </div>
            <div className="flex items-center gap-3">
              <label className="block text-sm font-medium text-gray-700 md:hidden">Filter by Status:</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value as Status | 'All')}
                className="flex-1 md:flex-none px-3 py-3 md:py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
              >
                <option value="All">📋 All Statuses ({filtered.length})</option>
                <option value="Pending">⏳ Pending ({students.filter(s => s.status === 'Pending').length})</option>
                <option value="Accepted">✓ Accepted ({students.filter(s => s.status === 'Accepted').length})</option>
                <option value="Rejected">✗ Rejected ({students.filter(s => s.status === 'Rejected').length})</option>
              </select>
            </div>
          </div>
        </div>
      </section>

      {/* Reporting Date Settings */}
      {showDateSettings && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-4">
          <div className="bg-indigo-50 border border-indigo-200 rounded-xl shadow-sm p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <h3 className="text-sm font-medium text-indigo-800 mb-2">Reporting Date Settings</h3>
                <p className="text-sm text-indigo-700 mb-4">
                  Set a custom reporting date to appear in PDF documents. If not set, current date will be used.
                </p>
                
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="flex items-center gap-2">
                    <label htmlFor="reportingDate" className="text-sm font-medium text-indigo-800">
                      Reporting Date:
                    </label>
                    <input
                      type="date"
                      id="reportingDate"
                      value={reportingDate}
                      onChange={(e) => handleReportingDateChange(e.target.value)}
                      className="px-3 py-2 border border-indigo-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                  </div>
                  
                  {reportingDate && (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-indigo-600">
                        Current: {new Date(reportingDate).toLocaleDateString('en-GB')}
                      </span>
                      <button
                        onClick={clearReportingDate}
                        className="text-xs bg-red-100 hover:bg-red-200 text-red-700 px-2 py-1 rounded"
                      >
                        Clear
                      </button>
                    </div>
                  )}
                  
                  {!reportingDate && (
                    <span className="text-sm text-gray-500">
                      Using current date: {new Date().toLocaleDateString('en-GB')}
                    </span>
                  )}
                </div>
              </div>
              
              <button
                onClick={() => setShowDateSettings(false)}
                className="flex-shrink-0 text-indigo-400 hover:text-indigo-600 ml-4"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      )}

      {/* Students Table/Card Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 pb-20">
        {/* Table for desktop */}
        <div className="hidden md:block overflow-x-auto bg-white border border-gray-200 rounded-lg shadow-sm">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Full Name</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Adm No.</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Course</th>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    <div className="flex items-center gap-2">
                      {s.fullName}
                      {(s as any).source === 'online_application' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800" title="Applied online">
                          Online
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{s.admissionNumber}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{s.email}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{s.phone}</td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">{s.course}</td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                      s.status === 'Accepted'
                        ? 'bg-green-100 text-green-800'
                        : s.status === 'Rejected'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {s.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-right text-sm">
                    <div className="flex items-center justify-end gap-2">
                      <button onClick={() => setStatus(s.id, 'Accepted')} className="bg-green-600 hover:bg-green-700 text-white px-2.5 py-1.5 rounded text-xs">Approve</button>
                      <button onClick={() => setStatus(s.id, 'Rejected')} className="bg-red-600 hover:bg-red-700 text-white px-2.5 py-1.5 rounded text-xs">Reject</button>
                      <button 
                        onClick={() => handleViewPDF(s)} 
                        disabled={pdfGenerating === s.id}
                        className="bg-purple-100 hover:bg-purple-200 text-purple-800 px-2.5 py-1.5 rounded text-xs disabled:opacity-50"
                      >
                        {pdfGenerating === s.id ? 'Loading...' : 'View PDF'}
                      </button>
                      <button 
                        onClick={() => handleDownloadPDF(s)} 
                        disabled={pdfGenerating === s.id}
                        className="bg-indigo-100 hover:bg-indigo-200 text-indigo-800 px-2.5 py-1.5 rounded text-xs disabled:opacity-50"
                      >
                        {pdfGenerating === s.id ? 'Loading...' : 'Download'}
                      </button>
                      <button onClick={() => call(s.phone)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1.5 rounded text-xs">Call</button>
                      <button onClick={() => sms(s.phone)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1.5 rounded text-xs">SMS</button>
                      <button onClick={() => whatsapp(s.phone)} className="bg-green-100 hover:bg-green-200 text-green-800 px-2.5 py-1.5 rounded text-xs">WhatsApp</button>
                      <button onClick={() => share(s)} className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-2.5 py-1.5 rounded text-xs">Share</button>
                      <button onClick={() => openEditModal(s)} className="bg-yellow-100 hover:bg-yellow-200 text-yellow-800 px-2.5 py-1.5 rounded text-xs">Edit</button>
                      <button onClick={() => removeStudent(s.id)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 px-2.5 py-1.5 rounded text-xs">Delete</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Cards for mobile */}
        <div className="md:hidden space-y-4">
          {filtered.map((s) => (
            <div key={s.id} className="bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden">
              {/* Header Section */}
              <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="text-lg font-semibold text-gray-900">{s.fullName}</h3>
                      {(s as any).source === 'online_application' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          🌐 Online
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 font-medium">{s.admissionNumber}</p>
                  </div>
                  <div className="ml-3">
                    <span className={`px-3 py-1.5 rounded-full text-sm font-medium ${
                      s.status === 'Accepted'
                        ? 'bg-green-100 text-green-800 border border-green-200'
                        : s.status === 'Rejected'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                    }`}>
                      {s.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Student Info Section */}
              <div className="p-4">
                <div className="grid grid-cols-1 gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Email</p>
                      <p className="text-sm font-medium text-gray-900">{s.email}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-sm font-medium text-gray-900">{s.phone}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-sm text-gray-500">Course</p>
                      <p className="text-sm font-medium text-gray-900">{s.course}</p>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-3">Quick Actions</p>
                  <div className="flex gap-2 mb-3">
                    <button 
                      onClick={() => setStatus(s.id, 'Accepted')} 
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2.5 px-3 rounded-lg text-sm font-medium transition-colors"
                    >
                      ✓ Approve
                    </button>
                    <button 
                      onClick={() => setStatus(s.id, 'Rejected')} 
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2.5 px-3 rounded-lg text-sm font-medium transition-colors"
                    >
                      ✗ Reject
                    </button>
                  </div>
                  
                  {/* PDF Actions */}
                  <div className="flex gap-2 mb-3">
                    <button 
                      onClick={() => handleViewPDF(s)} 
                      disabled={pdfGenerating === s.id}
                      className="flex-1 bg-purple-600 hover:bg-purple-700 text-white py-2.5 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      {pdfGenerating === s.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          📄 View PDF
                        </>
                      )}
                    </button>
                    <button 
                      onClick={() => handleDownloadPDF(s)} 
                      disabled={pdfGenerating === s.id}
                      className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 px-3 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-1"
                    >
                      {pdfGenerating === s.id ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          <span>Loading...</span>
                        </>
                      ) : (
                        <>
                          ⬇️ Download
                        </>
                      )}
                    </button>
                  </div>
                  
                  {/* Communication Actions */}
                  <div className="grid grid-cols-3 gap-2 mb-3">
                    <button 
                      onClick={() => call(s.phone)} 
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium border border-blue-200 transition-colors flex items-center justify-center gap-1"
                    >
                      📞 Call
                    </button>
                    <button 
                      onClick={() => sms(s.phone)} 
                      className="bg-orange-50 hover:bg-orange-100 text-orange-700 py-2 px-3 rounded-lg text-sm font-medium border border-orange-200 transition-colors flex items-center justify-center gap-1"
                    >
                      💬 SMS
                    </button>
                    <button 
                      onClick={() => whatsapp(s.phone)} 
                      className="bg-green-50 hover:bg-green-100 text-green-700 py-2 px-3 rounded-lg text-sm font-medium border border-green-200 transition-colors flex items-center justify-center gap-1"
                    >
                      💚 WhatsApp
                    </button>
                  </div>

                  {/* Other Actions */}
                  <div className="grid grid-cols-3 gap-2">
                    <button 
                      onClick={() => openEditModal(s)} 
                      className="bg-yellow-50 hover:bg-yellow-100 text-yellow-700 py-2 px-3 rounded-lg text-sm font-medium border border-yellow-200 transition-colors"
                    >
                      ✏️ Edit
                    </button>
                    <button 
                      onClick={() => share(s)} 
                      className="bg-blue-50 hover:bg-blue-100 text-blue-700 py-2 px-3 rounded-lg text-sm font-medium border border-blue-200 transition-colors"
                    >
                      📤 Share
                    </button>
                    <button 
                      onClick={() => removeStudent(s.id)} 
                      className="bg-gray-50 hover:bg-gray-100 text-gray-700 py-2 px-3 rounded-lg text-sm font-medium border border-gray-200 transition-colors"
                    >
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {/* Student Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">{editingStudent ? 'Edit Student' : 'Add Student'}</h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Admission Number 
                  {!editingStudent && (
                    <span className="text-xs text-gray-500">(Auto-generated if left empty)</span>
                  )}
                </label>
                <input 
                  value={form.admissionNumber} 
                  onChange={(e) => setForm({ ...form, admissionNumber: e.target.value })} 
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" 
                  placeholder={!editingStudent ? `Auto: ${generateAdmissionNumber()}` : ""}
                />
                {!editingStudent && !form.admissionNumber && (
                  <p className="text-xs text-gray-500 mt-1">
                    Will be auto-generated as: <span className="font-mono text-blue-600">{generateAdmissionNumber()}</span>
                  </p>
                )}
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500" />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Course</label>
                  <select value={form.course} onChange={(e) => setForm({ ...form, course: e.target.value })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="">Select a course</option>
                    {courses.map((course) => (
                      <option key={course.id} value={course.name}>{course.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value as Status })} className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary-500">
                    <option value="Pending">Pending</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md">Cancel</button>
              <button onClick={saveStudent} className="btn-primary py-2 px-4 rounded-md">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Course Modal */}
      {courseModalOpen && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white w-full max-w-lg rounded-xl shadow-xl border border-gray-200">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Add New Course</h3>
              <button onClick={() => setCourseModalOpen(false)} className="text-gray-500 hover:text-gray-700">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Course Name *</label>
                <input 
                  type="text"
                  name="name"
                  value={courseForm.name} 
                  onChange={handleCourseInputChange} 
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                  placeholder="e.g., Software Engineering"
                />
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fee Balance *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 text-sm">UGX</span>
                    <input 
                      type="number"
                      name="feeBalance"
                      value={courseForm.feeBalance} 
                      onChange={handleCourseInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                      placeholder="500000"
                      min="0"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Minimum balance required</p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Fee Per Year *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 text-sm">UGX</span>
                    <input 
                      type="number"
                      name="feePerYear"
                      value={courseForm.feePerYear} 
                      onChange={handleCourseInputChange}
                      className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent" 
                      placeholder="1200000"
                      min="0"
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">Total annual tuition fee</p>
                </div>
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-blue-800">Course Information</h3>
                    <div className="mt-1 text-sm text-blue-700">
                      <p>Fee Balance: Minimum amount students must maintain</p>
                      <p>Fee Per Year: Total annual tuition cost</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-end gap-3">
              <button 
                onClick={() => setCourseModalOpen(false)} 
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 px-4 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={saveCourse} 
                disabled={!courseForm.name || !courseForm.feeBalance || !courseForm.feePerYear}
                className="bg-purple-600 hover:bg-purple-700 disabled:bg-gray-300 disabled:cursor-not-allowed text-white py-2 px-4 rounded-md transition-colors"
              >
                Add Course
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
