'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { SupabaseService } from '../../services/supabaseService'
import { AuthService } from '../../services/authService'
import { PDFService } from '../../services/pdfService'
import { EmailService } from '../../services/emailService'
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
  admissionStartingNumber: number
}

export default function CompleteFunctionalDashboard() {
  const router = useRouter()
  const [students, setStudents] = useState<Student[]>([])
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [settings, setSettings] = useState<Settings>({
    reportingDate: '',
    approvalMode: 'manual',
    autoApprovalDelay: 5,
    admissionStartingNumber: 1000
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
  const [showPrintReport, setShowPrintReport] = useState(false)
  const [showSMSModal, setShowSMSModal] = useState(false)
  
  // Mobile menu state
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  
  // Device detection
  const [isMobileDevice, setIsMobileDevice] = useState(false)
  
  useEffect(() => {
    const checkMobileDevice = () => {
      const userAgent = navigator.userAgent.toLowerCase()
      const mobileKeywords = ['mobile', 'android', 'iphone', 'ipad', 'ipod', 'blackberry', 'windows phone']
      const isMobile = mobileKeywords.some(keyword => userAgent.includes(keyword)) || 
                      window.innerWidth <= 768 || 
                      ('ontouchstart' in window)
      setIsMobileDevice(isMobile)
    }
    
    checkMobileDevice()
    window.addEventListener('resize', checkMobileDevice)
    return () => window.removeEventListener('resize', checkMobileDevice)
  }, [])

  // Selected items
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null)
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null)
  const [deleteTarget, setDeleteTarget] = useState<{type: 'student' | 'course', id: string, name: string} | null>(null)

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<Status | 'All'>('All')
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(9)

  // PDF viewer state
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null)
  const [pdfUrl, setPdfUrl] = useState<string | null>(null)

  // Form states
  const [studentForm, setStudentForm] = useState({
    fullName: '', email: '', phone: '', course: '', location: '', kcseGrade: ''
  })
  const [courseForm, setCourseForm] = useState({
    name: '', feeBalance: 0, feePerYear: 0
  })
  const [printFilters, setPrintFilters] = useState({
    day: '',
    month: '',
    year: new Date().getFullYear().toString(),
    status: 'All'
  })
  
  // SMS form state
  const [smsForm, setSmsForm] = useState({
    message: '',
    template: 'custom'
  })

  // Check authentication first
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await AuthService.isAuthenticated()
      if (!isAuthenticated) {
        router.push('/admin/login')
        return
      }
      setIsCheckingAuth(false)
    }
    
    checkAuth()
  }, [router])
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showMobileMenu) {
        const target = event.target as Element
        if (!target.closest('header')) {
          setShowMobileMenu(false)
        }
      }
    }
    
    if (showMobileMenu) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [showMobileMenu])

  // Load data from Supabase
  useEffect(() => {
    if (isCheckingAuth) return // Don't load data until auth is checked
    
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
        
        // Load settings from database
        try {
          const reportingDateSetting = await SupabaseService.getSetting('reportingDate')
          const approvalModeSetting = await SupabaseService.getSetting('approvalMode')
          const autoApprovalDelaySetting = await SupabaseService.getSetting('autoApprovalDelay')
          const admissionStartingNumberSetting = await SupabaseService.getSetting('admissionStartingNumber')
          
          const loadedSettings = {
            reportingDate: reportingDateSetting?.value || '',
            approvalMode: (approvalModeSetting?.value as 'manual' | 'automatic') || 'manual',
            autoApprovalDelay: autoApprovalDelaySetting?.value ? Number(autoApprovalDelaySetting.value) : 5,
            admissionStartingNumber: admissionStartingNumberSetting?.value ? Number(admissionStartingNumberSetting.value) || 1000 : 1000
          }
          
          setSettings(loadedSettings)
          
          // Auto-approve existing pending students if auto-approval mode is enabled
          if (loadedSettings.approvalMode === 'automatic') {
            const pendingStudents = formattedStudents.filter(student => student.status === 'Pending')
            if (pendingStudents.length > 0) {
              console.log(`🔄 Auto-approval mode detected. Found ${pendingStudents.length} pending students to auto-approve in ${loadedSettings.autoApprovalDelay} minutes.`)
              
              // Schedule auto-approval for each pending student
              pendingStudents.forEach((student, index) => {
                const delay = loadedSettings.autoApprovalDelay * 60 * 1000 + (index * 5000) // Stagger by 5 seconds to avoid overwhelming
                
                setTimeout(async () => {
                  try {
                    console.log(`⚙️ Auto-approving existing pending student: ${student.fullName}`)
                    await SupabaseService.updateStudent(student.id, { status: 'Accepted' })
                    
                    // Update local state
                    setStudents(prev => prev.map(s => s.id === student.id ? { ...s, status: 'Accepted' } : s))
                    
                    // Trigger the approval workflow (PDF, email, WhatsApp) using local settings
                    const updatedStudent = { ...student, status: 'Accepted' as Status }
                    try {
                      console.log('🎓 Triggering approval workflow for:', updatedStudent.fullName)
                      
                      // Generate PDF admission letter with reporting date from loaded settings
                      const pdfBlob = await PDFService.generateAdmissionLetter(updatedStudent, loadedSettings.reportingDate)
                      const pdfArrayBuffer = await pdfBlob.arrayBuffer()
                      const pdfBytes = new Uint8Array(pdfArrayBuffer)
                      
                      // Send admission letter via email
                      const emailSent = await EmailService.sendAdmissionPDF({
                        fullName: updatedStudent.fullName,
                        email: updatedStudent.email,
                        course: updatedStudent.course,
                        admissionNumber: updatedStudent.admissionNumber,
                        pdfBytes: pdfBytes
                      })
                      
                      if (emailSent) {
                        console.log('✅ Admission letter sent successfully to:', updatedStudent.email)
                        console.log('✅ Full approval workflow completed for:', updatedStudent.fullName)
                      } else {
                        console.log('⚠️ Email failed but workflow continued for:', updatedStudent.fullName)
                      }
                      
                    } catch (workflowError) {
                      console.error('❌ Error in approval workflow for', updatedStudent.fullName, ':', workflowError)
                    }
                    
                    console.log(`✅ Auto-approval completed for existing student: ${student.fullName}`)
                  } catch (error) {
                    console.error(`❌ Auto-approval failed for existing student ${student.fullName}:`, error)
                  }
                }, delay)
              })
            }
          }
        } catch (error) {
          console.error('Error loading settings:', error)
          // Keep default settings if loading fails
        }
        
      } catch (error) {
        console.error('Error loading data:', error)
        setError('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    
    loadData()
  }, [isCheckingAuth])

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

  // Function to trigger the full approval workflow (PDF, email, WhatsApp)
  const triggerApprovalWorkflow = async (student: Student) => {
    try {
      console.log('🎓 Triggering approval workflow for:', student.fullName)
      
      // Generate PDF admission letter with reporting date from settings
      const pdfBlob = await PDFService.generateAdmissionLetter(student, settings.reportingDate)
      const pdfArrayBuffer = await pdfBlob.arrayBuffer()
      const pdfBytes = new Uint8Array(pdfArrayBuffer)
      
      // Send admission letter via email
      const emailSent = await EmailService.sendAdmissionPDF({
        fullName: student.fullName,
        email: student.email,
        course: student.course,
        admissionNumber: student.admissionNumber,
        pdfBytes: pdfBytes
      })
      
      if (emailSent) {
        console.log('✅ Admission letter sent successfully to:', student.email)
        
        // Auto-download PDF and prepare WhatsApp notification
        await handleAutoWhatsAppNotification(student, pdfBlob)
        
        console.log('✅ Full approval workflow completed for:', student.fullName)
      } else {
        console.log('⚠️ Email failed but workflow continued for:', student.fullName)
      }
      
    } catch (error) {
      console.error('❌ Error in approval workflow for', student.fullName, ':', error)
    }
  }

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

      const formattedNewStudent = {
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
      }
      
      setStudents(prev => [...prev, formattedNewStudent])

      setShowAddStudent(false)
      setStudentForm({ fullName: '', email: '', phone: '', course: '', location: '', kcseGrade: '' })
      
      // Check for automatic approval
      if (settings.approvalMode === 'automatic') {
        console.log(`🔄 Auto-approval mode enabled. Scheduling approval for ${formattedNewStudent.fullName} in ${settings.autoApprovalDelay} minutes...`)
        
        setTimeout(async () => {
          try {
            console.log(`⚙️ Auto-approving student: ${formattedNewStudent.fullName}`)
            await handleStatusChange(formattedNewStudent.id, 'Accepted')
            console.log(`✅ Auto-approval completed for: ${formattedNewStudent.fullName}`)
          } catch (error) {
            console.error(`❌ Auto-approval failed for ${formattedNewStudent.fullName}:`, error)
            alert(`Auto-approval failed for ${formattedNewStudent.fullName}. Please approve manually.`)
          }
        }, settings.autoApprovalDelay * 60 * 1000) // Convert minutes to milliseconds
        
        alert(`🎉 Student ${formattedNewStudent.fullName} added successfully!\n\n⚙️ Auto-approval is enabled. Student will be automatically approved in ${settings.autoApprovalDelay} minutes.`)
      } else {
        alert(`🎉 Student ${formattedNewStudent.fullName} added successfully!`)
      }
    } catch (error) {
      console.error('Error adding student:', error)
      alert('Failed to add student')
    }
  }

  // Logout handler
  const handleLogout = async () => {
    const { error } = await AuthService.signOut()
    if (error) {
      console.error('Logout error:', error)
      alert('Failed to log out. Please try again.')
      return
    }
    
    console.log('Logged out successfully')
    router.push('/admin/login')
  }

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
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
      console.log(`📝 Updating student status to: ${newStatus}`, studentId)
      
      // Update status in database
      await SupabaseService.updateStudent(studentId, { status: newStatus })
      
      // Find the student for email notification
      const student = students.find(s => s.id === studentId)
      if (!student) {
        throw new Error('Student not found')
      }
      
      // Update local state
      setStudents(prev => prev.map(s => s.id === studentId ? { ...s, status: newStatus } : s))
      
      // Send admission letter if approved
      if (newStatus === 'Accepted' && student) {
        console.log('🎓 Student approved! Generating and sending admission letter...')
        
        try {
          // Generate PDF admission letter with reporting date from settings
          const pdfBlob = await PDFService.generateAdmissionLetter(student, settings.reportingDate)
          const pdfArrayBuffer = await pdfBlob.arrayBuffer()
          const pdfBytes = new Uint8Array(pdfArrayBuffer)
          
          // Send admission letter via email
          const emailSent = await EmailService.sendAdmissionPDF({
            fullName: student.fullName,
            email: student.email,
            course: student.course,
            admissionNumber: student.admissionNumber,
            pdfBytes: pdfBytes
          })
          
          if (emailSent) {
            console.log('✅ Admission letter sent successfully to:', student.email)
            
            // Auto-download PDF and prepare WhatsApp notification
            await handleAutoWhatsAppNotification(student, pdfBlob)
            
            alert(`🎉 ${student.fullName} has been approved!\n\n✅ Email sent to: ${student.email}\n📱 WhatsApp message prepared with PDF download\n\nPlease attach the downloaded PDF to the WhatsApp conversation.`)
          } else {
            console.log('⚠️ Status updated but failed to send admission letter')
            alert(`Status updated to Accepted, but failed to send admission letter to ${student.email}. Please try sending manually.`)
          }
          
        } catch (pdfError) {
          console.error('❌ Error generating/sending admission letter:', pdfError)
          const errorMessage = pdfError instanceof Error ? pdfError.message : 'Unknown error'
          alert(`Status updated to Accepted, but failed to generate/send admission letter: ${errorMessage}`)
        }
      } else if (newStatus === 'Rejected') {
        console.log('❌ Student rejected:', student.fullName)
        alert(`${student.fullName} has been rejected.`)
      }
      
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

  // PDF operations using the real template
  const handleViewPDF = async (student: Student) => {
    try {
      console.log('🎓 Generating official admission letter for:', student.fullName)
      
      // Generate PDF using the actual template with form fields and reporting date from settings
      const pdfBlob = await PDFService.generateAdmissionLetter(student, settings.reportingDate)
      
      // Create object URL for viewing
      const url = URL.createObjectURL(pdfBlob)
      
      // Set state for modal
      setPdfBlob(pdfBlob)
      setPdfUrl(url)
      setSelectedStudent(student)
      setShowPDFViewer(true)
      
      console.log('✅ Official admission letter generated successfully!')
    } catch (error) {
      console.error('❌ Error generating admission letter:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to generate admission letter: ${errorMessage}`)
    }
  }

  const handleDownloadPDF = () => {
    if (pdfBlob && selectedStudent) {
      console.log('📥 Downloading PDF for:', selectedStudent.fullName)
      
      const fileName = `${selectedStudent.fullName.replace(/\s+/g, '_')}_Admission_Letter.pdf`
      
      if (isMobileDevice) {
        // Mobile-friendly approach
        try {
          const url = URL.createObjectURL(pdfBlob)
          
          // For mobile, open in new tab instead of direct download
          const newWindow = window.open(url, '_blank')
          if (newWindow) {
            // Add a fallback message
            setTimeout(() => {
              if (!newWindow.closed) {
                // If window is still open, provide instructions
                console.log('📱 Mobile PDF opened in new tab')
              }
            }, 1000)
          } else {
            // Fallback: show download instructions
            alert(`PDF ready! Your browser may have blocked the popup. Please allow popups and try again to download: ${fileName}`)
          }
          
          // Clean up after delay to allow mobile browsers to process
          setTimeout(() => {
            URL.revokeObjectURL(url)
          }, 5000)
          
        } catch (error) {
          console.error('❌ Mobile PDF download error:', error)
          alert('Unable to open PDF. Please try viewing from a desktop browser or contact support.')
        }
      } else {
        // Desktop approach (existing method)
        const url = URL.createObjectURL(pdfBlob)
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        
        // Clean up
        URL.revokeObjectURL(url)
        
        console.log('✅ Desktop download initiated')
      }
    } else {
      console.error('❌ No PDF available for download')
      alert('No PDF available for download')
    }
  }

  // Communication functions
  const handleCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self')
  }

  const handleSMS = (student: Student) => {
    setSelectedStudent(student)
    setShowSMSModal(true)
    setSmsForm({ message: '', template: 'custom' })
  }

  const handleWhatsApp = (student: Student) => {
    setSelectedStudent(student)
    setShowWhatsAppShare(true)
  }

  // Function to resend admission letter via email
  const handleResendAdmissionEmail = async (student: Student) => {
    try {
      console.log('🔄 Resending admission letter email to:', student.fullName, student.email)
      
      // Generate PDF admission letter with reporting date from settings
      const pdfBlob = await PDFService.generateAdmissionLetter(student, settings.reportingDate)
      const pdfArrayBuffer = await pdfBlob.arrayBuffer()
      const pdfBytes = new Uint8Array(pdfArrayBuffer)
      
      // Send admission letter via email
      const emailSent = await EmailService.sendAdmissionPDF({
        fullName: student.fullName,
        email: student.email,
        course: student.course,
        admissionNumber: student.admissionNumber,
        pdfBytes: pdfBytes
      })
      
      if (emailSent) {
        console.log('✅ Admission letter resent successfully to:', student.email)
        alert(`📧 Admission letter has been resent to ${student.email}!`)
      } else {
        console.log('⚠️ Failed to resend admission letter')
        alert(`Failed to resend admission letter to ${student.email}. Please try again.`)
      }
      
    } catch (error) {
      console.error('❌ Error resending admission letter:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Error resending admission letter: ${errorMessage}`)
    }
  }
  
  // Function to share PDF via WhatsApp with downloadable link
  const handleSharePDFViaWhatsApp = async () => {
    if (selectedStudent) {
      try {
        console.log('📄 Sharing PDF via WhatsApp to:', selectedStudent.fullName)
        
        // Generate downloadable PDF link
        const currentUrl = window.location.origin
        const pdfDownloadUrl = `${currentUrl}/api/download-pdf/${selectedStudent.id}`
        
        console.log('🔗 PDF download link generated:', pdfDownloadUrl)
        
        // Create a shorter, more user-friendly message with the download link
        const whatsappMessage = `📄 *EAVI - Official Admission Letter*\n\nDear ${selectedStudent.fullName},\n\n🎉 Congratulations! Your admission letter for *${selectedStudent.course}* is ready!\n\n🎓 *Admission Details:*\n• Course: ${selectedStudent.course}\n• Admission #: ${selectedStudent.admissionNumber}\n• Status: APPROVED ✅\n\n📥 *Download your admission letter:*\n${pdfDownloadUrl}\n\n📋 *Important:* Save this document for registration, fee payment, and first day of classes.\n\n📍 *Next Steps:*\n1. Visit our office with documents\n2. Complete fee payment\n3. Attend orientation\n\n📞 *Contact:* 0726022044 / 0748022044\n🏢 *Main Campus:* Skymart Building, Room F45\n🏢 *West Campus:* [Location]\n\n🏆 Welcome to EAVI Family!`
        
        // Send WhatsApp message with download link
        sendWhatsAppMessage(whatsappMessage)
        
        console.log('✅ WhatsApp message with PDF download link ready')
        
      } catch (error) {
        console.error('❌ Error sharing PDF link via WhatsApp:', error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        alert(`Error preparing PDF link for sharing: ${errorMessage}`)
      }
    }
  }
  
  // SMS Templates and Messaging (All under 160 characters for true SMS)
  const smsTemplates = {
    admission_approved: `🎉 {name}, EAVI admission APPROVED! Course: {course}. #: {admissionNumber}. Check email. Main: Skymart F45. Tel: 0726022044/0748022044`,
    
    document_ready: `📋 {name}, documents ready. Course: {course}. Main Campus: Skymart F45. 8AM-5PM. Tel: 0726022044/0748022044`,
    
    fee_reminder: `💰 {name}, fee reminder. Course: {course}. Main Campus: Skymart F45. Tel: 0726022044/0748022044`,
    
    interview_schedule: `📅 {name}, interview set. Course: {course}. Update time. Main: Skymart F45. Tel: 0726022044/0748022044`,
    
    orientation_reminder: `🎓 {name}, orientation. Course: {course}. Bring certs, ID, photos. Main: Skymart F45. Tel: 0726022044`,
    
    general_info: `EAVI: Hi {name}. Course: {course}. #: {admissionNumber}. Main: Skymart F45 | West Campus. Tel: 0726022044/0748022044`
  }
  
  const handleSendSMS = () => {
    if (!selectedStudent || !smsForm.message.trim()) {
      alert('Please enter a message to send')
      return
    }
    
    console.log('📱 Sending SMS to:', selectedStudent.fullName, selectedStudent.phone)
    
    // Replace placeholders in the message
    let finalMessage = smsForm.message
      .replace(/{name}/g, selectedStudent.fullName)
      .replace(/{course}/g, selectedStudent.course)
      .replace(/{admissionNumber}/g, selectedStudent.admissionNumber)
      .replace(/{phone}/g, selectedStudent.phone)
      .replace(/{email}/g, selectedStudent.email)
    
    // Clean and validate phone number (reuse existing logic from WhatsApp)
    let cleanPhone = selectedStudent.phone.replace(/[^\d+]/g, '')
    cleanPhone = cleanPhone.replace(/^\+/, '')
    
    if (cleanPhone.startsWith('254')) {
      cleanPhone = cleanPhone
    } else if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
      cleanPhone = cleanPhone.substring(1)
    } else if ((cleanPhone.startsWith('7') || cleanPhone.startsWith('1') || cleanPhone.startsWith('2')) && cleanPhone.length === 9) {
      // Keep as is
    } else if (!cleanPhone.startsWith('254') && cleanPhone.length >= 9) {
      cleanPhone = cleanPhone.replace(/^0/, '')
    }
    
    // For SMS, we don't need the full international format
    const phoneRegex = /^([017]\d{8}|254[127]\d{8})$/
    if (!phoneRegex.test(cleanPhone)) {
      alert(`Invalid phone number format: ${selectedStudent.phone}\n\nSupported formats:\n• 0712345678\n• 254712345678\n• 712345678\n\nPlease update the student's phone number.`)
      return
    }
    
    // Use the original phone format for SMS (works better with local numbers)
    const smsPhone = selectedStudent.phone.replace(/[^\d+]/g, '').replace(/^254/, '0')
    const encodedMessage = encodeURIComponent(finalMessage)
    
    console.log('SMS Phone:', smsPhone)
    console.log('SMS Message:', finalMessage)
    
    // Open SMS app with the message
    window.open(`sms:${smsPhone}?body=${encodedMessage}`, '_self')
    
    // Close modal and reset form
    setShowSMSModal(false)
    setSmsForm({ message: '', template: 'custom' })
    setSelectedStudent(null)
  }
  
  const handleTemplateSelect = (templateKey: string) => {
    if (templateKey === 'custom') {
      setSmsForm({ ...smsForm, template: templateKey, message: '' })
    } else {
      const template = smsTemplates[templateKey as keyof typeof smsTemplates]
      setSmsForm({ ...smsForm, template: templateKey, message: template })
    }
  }
  
  // Course CRUD operations handlers
  const handleEditCourse = async () => {
    if (!selectedCourse) return
    
    try {
      await SupabaseService.updateCourse(selectedCourse.id, {
        name: courseForm.name,
        fee_balance: courseForm.feeBalance,
        fee_per_year: courseForm.feePerYear
      })

      setCourses(prev => prev.map(c => c.id === selectedCourse.id ? {
        ...c,
        name: courseForm.name,
        feeBalance: courseForm.feeBalance,
        feePerYear: courseForm.feePerYear
      } : c))

      setShowEditCourse(false)
      setSelectedCourse(null)
      setCourseForm({ name: '', feeBalance: 0, feePerYear: 0 })
    } catch (error) {
      console.error('Error updating course:', error)
      alert('Failed to update course')
    }
  }
  
  const handleDeleteCourse = async (id: string) => {
    try {
      await SupabaseService.deleteCourse(id)
      setCourses(prev => prev.filter(c => c.id !== id))
      setShowDeleteConfirm(false)
      setDeleteTarget(null)
    } catch (error) {
      console.error('Error deleting course:', error)
      alert('Failed to delete course')
    }
  }
  
  // Modal handlers for courses
  const openEditCourse = (course: Course) => {
    setSelectedCourse(course)
    setCourseForm({
      name: course.name,
      feeBalance: course.feeBalance,
      feePerYear: course.feePerYear
    })
    setShowEditCourse(true)
  }

  const sendWhatsAppMessage = (message: string) => {
    if (selectedStudent) {
      console.log('Sending WhatsApp message to:', selectedStudent.fullName, selectedStudent.phone)
      
      // Clean phone number - remove all non-digit characters first
      let cleanPhone = selectedStudent.phone.replace(/[^\d+]/g, '')
      
      // Remove any leading + signs for processing
      cleanPhone = cleanPhone.replace(/^\+/, '')
      
      // Handle different Kenyan phone number formats
      if (cleanPhone.startsWith('254')) {
        // Already has country code: 254712345678 - keep as is
        cleanPhone = cleanPhone
      } else if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
        // Format: 0712345678 -> 254712345678
        cleanPhone = '254' + cleanPhone.substring(1)
      } else if ((cleanPhone.startsWith('7') || cleanPhone.startsWith('1') || cleanPhone.startsWith('2')) && cleanPhone.length === 9) {
        // Format: 712345678 or 112345678 or 242345678 -> add 254 prefix
        cleanPhone = '254' + cleanPhone
      } else if (!cleanPhone.startsWith('254') && cleanPhone.length >= 9) {
        // Default: assume it's a local number missing country code, remove any leading 0
        cleanPhone = '254' + cleanPhone.replace(/^0/, '')
      }
      
      // Validate the final phone number - Kenya mobile numbers start with 254 followed by 9 digits
      // Common Kenyan mobile prefixes: 7xx, 1xx, 2xx (after 254)
      const phoneRegex = /^254[127]\d{8}$/
      if (!phoneRegex.test(cleanPhone)) {
        console.error('Invalid phone number format:', cleanPhone, 'Original:', selectedStudent.phone)
        alert(`Invalid phone number format: ${selectedStudent.phone}\n\nSupported formats:\n• 0712345678\n• +254712345678\n• 254712345678\n• 712345678\n\nPlease update the student's phone number to a valid Kenyan mobile format.`)
        return
      }
      
      console.log('Clean phone number:', cleanPhone)
      console.log('Message:', message)
      
      const encodedMessage = encodeURIComponent(message)
      const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`
      
      console.log('WhatsApp URL:', whatsappUrl)
      
      window.open(whatsappUrl, '_blank')
      setShowWhatsAppShare(false)
    } else {
      console.error('No student selected for WhatsApp')
      alert('No student selected')
    }
  }

  // Auto WhatsApp notification with PDF download on approval
  const handleAutoWhatsAppNotification = async (student: Student, pdfBlob: Blob) => {
    try {
      console.log('📱 Auto-preparing WhatsApp notification for:', student.fullName)
      
      // Auto-download the PDF
      const fileName = `${student.fullName.replace(/\s+/g, '_')}_Admission_Letter.pdf`
      const url = URL.createObjectURL(pdfBlob)
      
      if (isMobileDevice) {
        // Mobile: Open PDF in new tab for user to save
        const newWindow = window.open(url, '_blank')
        if (!newWindow) {
          alert('Please allow popups to download the PDF for WhatsApp sharing.')
          return
        }
        
        // Wait a moment for PDF to load, then send WhatsApp message
        setTimeout(() => {
          sendWhatsAppNotificationMessage(student, true)
          URL.revokeObjectURL(url)
        }, 2000)
        
      } else {
        // Desktop: Auto-download the PDF
        const a = document.createElement('a')
        a.href = url
        a.download = fileName
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        
        // Clean up and send WhatsApp message
        setTimeout(() => {
          URL.revokeObjectURL(url)
          sendWhatsAppNotificationMessage(student, false)
        }, 1000)
      }
      
    } catch (error) {
      console.error('❌ Error in auto WhatsApp notification:', error)
      alert('Failed to prepare WhatsApp notification. You can manually share using the WhatsApp button.')
    }
  }

  // Send WhatsApp notification message (different from the manual share)
  const sendWhatsAppNotificationMessage = (student: Student, isMobile: boolean) => {
    console.log('Sending WhatsApp approval notification to:', student.fullName, student.phone)
    
    // Clean and validate phone number (reuse existing logic)
    let cleanPhone = student.phone.replace(/[^\d+]/g, '')
    cleanPhone = cleanPhone.replace(/^\+/, '')
    
    if (cleanPhone.startsWith('254')) {
      cleanPhone = cleanPhone
    } else if (cleanPhone.startsWith('0') && cleanPhone.length === 10) {
      cleanPhone = '254' + cleanPhone.substring(1)
    } else if ((cleanPhone.startsWith('7') || cleanPhone.startsWith('1') || cleanPhone.startsWith('2')) && cleanPhone.length === 9) {
      cleanPhone = '254' + cleanPhone
    } else if (!cleanPhone.startsWith('254') && cleanPhone.length >= 9) {
      cleanPhone = '254' + cleanPhone.replace(/^0/, '')
    }
    
    const phoneRegex = /^254[127]\d{8}$/
    if (!phoneRegex.test(cleanPhone)) {
      console.error('Invalid phone number for auto WhatsApp:', cleanPhone)
      return
    }
    
    // Create approval notification message
    const message = isMobile 
      ? `🎉 *CONGRATULATIONS!* 🎉\n\nDear ${student.fullName},\n\n✅ *YOUR ADMISSION HAS BEEN APPROVED!*\n\n🎓 *Admission Details:*\n• Course: ${student.course}\n• Admission Number: ${student.admissionNumber}\n• Academic Year: 2025/2026\n• Status: APPROVED ✅\n\n📱 *IMPORTANT - PDF ATTACHMENT:*\nI've opened your admission letter PDF in a new tab. Please:\n1. Save the PDF to your device\n2. Come back to this WhatsApp chat\n3. Attach the PDF file using the 📎 attachment button\n\n📎 *Next Steps:*\n1. Save your admission letter safely\n2. Visit our office with required documents\n3. Complete fee payment process\n4. Attend orientation program\n\n📞 Contact: 0726022044 / 0748022044\n📧 Email: Info.eavi.college.it.depertment@gmail.com\n📏 Office: Skymart Building, Room F45\n\n🏆 Welcome to EAVI Family!\nLeading the Leaders • Nurturing Quality Education`
      : `🎉 *CONGRATULATIONS!* 🎉\n\nDear ${student.fullName},\n\n✅ *YOUR ADMISSION HAS BEEN APPROVED!*\n\n🎓 *Admission Details:*\n• Course: ${student.course}\n• Admission Number: ${student.admissionNumber}\n• Academic Year: 2025/2026\n• Status: APPROVED ✅\n\n💾 *PDF DOWNLOADED:*\nYour admission letter has been downloaded to your computer. Please:\n1. Check your Downloads folder\n2. Find: ${student.fullName.replace(/\s+/g, '_')}_Admission_Letter.pdf\n3. Attach it to this WhatsApp conversation using the 📎 button\n\n📎 *Next Steps:*\n1. Save your admission letter safely\n2. Visit our office with required documents\n3. Complete fee payment process\n4. Attend orientation program\n\n📞 Contact: 0726022044 / 0748022044\n📧 Email: Info.eavi.college.it.depertment@gmail.com\n📏 Office: Skymart Building, Room F45\n\n🏆 Welcome to EAVI Family!\nLeading the Leaders • Nurturing Quality Education`
    
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${cleanPhone}?text=${encodedMessage}`
    
    console.log('Opening WhatsApp with approval notification')
    window.open(whatsappUrl, '_blank')
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

  const handlePrintReport = () => {
    const { day, month, year, status } = printFilters
    
    // Filter students based on selected date and status
    let filteredForPrint = students.filter(student => {
      const appliedDate = new Date(student.appliedAt || new Date())
      const studentYear = appliedDate.getFullYear().toString()
      const studentMonth = (appliedDate.getMonth() + 1).toString().padStart(2, '0')
      const studentDay = appliedDate.getDate().toString().padStart(2, '0')
      
      // Date filtering
      let matchesDate = true
      if (year) matchesDate = matchesDate && studentYear === year
      if (month) matchesDate = matchesDate && studentMonth === month.padStart(2, '0')
      if (day) matchesDate = matchesDate && studentDay === day.padStart(2, '0')
      
      // Status filtering
      const matchesStatus = status === 'All' || student.status === status
      
      return matchesDate && matchesStatus
    })
    
    // Generate HTML for printing
    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>EAVI Applicants Report</title>
        <style>
          body { font-family: Arial, sans-serif; margin: 20px; }
          .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #1e40af; padding-bottom: 15px; }
          .institute-name { font-size: 24px; font-weight: bold; color: #1e40af; }
          .report-title { font-size: 18px; margin: 10px 0; color: #374151; }
          .filters { background: #f8fafc; padding: 10px; border-radius: 8px; margin-bottom: 20px; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; }
          th, td { border: 1px solid #d1d5db; padding: 8px; text-align: left; }
          th { background-color: #f3f4f6; font-weight: bold; }
          .status-accepted { color: #059669; font-weight: bold; }
          .status-rejected { color: #dc2626; font-weight: bold; }
          .status-pending { color: #d97706; font-weight: bold; }
          .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #6b7280; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="institute-name">EAST AFRICA VISION INSTITUTE</div>
          <div class="report-title">Applicants Report</div>
        </div>
        
        <div class="filters">
          <strong>Report Filters:</strong>
          ${year ? `Year: ${year}` : 'All Years'}
          ${month ? ` | Month: ${new Date(2024, parseInt(month) - 1, 1).toLocaleDateString('en-US', { month: 'long' })}` : ''}
          ${day ? ` | Day: ${day}` : ''}
          | Status: ${status}
          | Total Records: ${filteredForPrint.length}
        </div>
        
        <table>
          <thead>
            <tr>
              <th>#</th>
              <th>Full Name</th>
              <th>Admission No</th>
              <th>Course</th>
              <th>Phone</th>
              <th>Email</th>
              <th>Status</th>
              <th>Applied Date</th>
            </tr>
          </thead>
          <tbody>
            ${filteredForPrint.map((student, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${student.fullName}</td>
                <td>${student.admissionNumber}</td>
                <td>${student.course}</td>
                <td>${student.phone}</td>
                <td>${student.email}</td>
                <td class="status-${student.status.toLowerCase()}">${student.status}</td>
                <td>${new Date(student.appliedAt || new Date()).toLocaleDateString()}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <p>Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}</p>
          <p>EAVI Administration System</p>
        </div>
      </body>
      </html>
    `
    
    // Open print window
    const printWindow = window.open('', '_blank')
    if (printWindow) {
      printWindow.document.write(printContent)
      printWindow.document.close()
      printWindow.focus()
      printWindow.print()
    }
    
    setShowPrintReport(false)
  }

  if (loading) {
    return (
      <div className="dashboard-bg flex items-center justify-center">
        <div className="clean-card p-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-800 text-lg font-medium">Loading your dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="dashboard-bg flex items-center justify-center">
        <div className="clean-card p-8 max-w-md text-center">
          <div className="text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Dashboard Error</h2>
          <p className="text-gray-600 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="btn-danger"
          >
            Refresh Dashboard
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="dashboard-bg">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 sm:py-6">
            <div className="flex items-center">
              <div className="text-3xl sm:text-4xl mr-2 sm:mr-4">🎓</div>
              <div>
                <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900 tracking-wide">EAVI Dashboard</h1>
                <p className="text-gray-600 text-sm sm:text-base hidden sm:block">Complete Admin Portal</p>
              </div>
            </div>
            
            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-3">
              <button
                onClick={() => setShowSettings(true)}
                className="btn-secondary flex items-center"
              >
                <SettingsIcon className="w-4 h-4 mr-2" />
                Settings
              </button>
              <Link
                href="/"
                className="btn-secondary flex items-center"
                title="View the student application form"
              >
                <span className="mr-2">🌐</span>
                View Form
              </Link>
              <button
                onClick={handleLogout}
                className="btn-danger flex items-center"
              >
                <span className="mr-2">🚪</span>
                Logout
              </button>
            </div>
            
            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {showMobileMenu ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
          
          {/* Mobile Menu Dropdown */}
          {showMobileMenu && (
            <div className="md:hidden border-t border-gray-200 py-4 animate-fade-in">
              <div className="flex flex-col space-y-3">
                <button
                  onClick={() => {
                    setShowSettings(true)
                    setShowMobileMenu(false)
                  }}
                  className="btn-secondary flex items-center justify-start w-full text-sm"
                >
                  <SettingsIcon className="w-4 h-4 mr-3" />
                  Settings
                </button>
                <Link
                  href="/"
                  className="btn-secondary flex items-center justify-start w-full text-sm"
                  title="View the student application form"
                  onClick={() => setShowMobileMenu(false)}
                >
                  <span className="mr-3">🌐</span>
                  View Application Form
                </Link>
                <button
                  onClick={() => {
                    handleLogout()
                    setShowMobileMenu(false)
                  }}
                  className="btn-danger flex items-center justify-start w-full text-sm"
                >
                  <span className="mr-3">🚪</span>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          {/* Total Students Card */}
          <div className="stat-card fade-in">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">{students.length}</div>
                <div className="text-blue-600 font-medium">Total Students</div>
                <div className="text-gray-500 text-sm">All applications</div>
              </div>
              <div className="text-4xl text-blue-500">👥</div>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full" style={{width: '100%'}}></div>
            </div>
          </div>

          {/* Pending Students Card */}
          <div className="stat-card fade-in" style={{animationDelay: '0.1s'}}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {students.filter(s => s.status === 'Pending').length}
                </div>
                <div className="text-orange-600 font-medium">Pending</div>
                <div className="text-gray-500 text-sm">Awaiting review</div>
              </div>
              <div className="text-4xl text-orange-500">⏳</div>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-orange-500 to-orange-600 rounded-full" 
                   style={{width: `${students.length > 0 ? (students.filter(s => s.status === 'Pending').length / students.length) * 100 : 0}%`}}></div>
            </div>
          </div>

          {/* Accepted Students Card */}
          <div className="stat-card fade-in" style={{animationDelay: '0.2s'}}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {students.filter(s => s.status === 'Accepted').length}
                </div>
                <div className="text-green-600 font-medium">Accepted</div>
                <div className="text-gray-500 text-sm">Approved</div>
              </div>
              <div className="text-4xl text-green-500">✅</div>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-green-500 to-green-600 rounded-full"
                   style={{width: `${students.length > 0 ? (students.filter(s => s.status === 'Accepted').length / students.length) * 100 : 0}%`}}></div>
            </div>
          </div>

          {/* Rejected Students Card */}
          <div className="stat-card fade-in" style={{animationDelay: '0.3s'}}>
            <div className="flex items-center justify-between">
              <div>
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  {students.filter(s => s.status === 'Rejected').length}
                </div>
                <div className="text-red-600 font-medium">Rejected</div>
                <div className="text-gray-500 text-sm">Declined</div>
              </div>
              <div className="text-4xl text-red-500">❌</div>
            </div>
            <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-red-500 to-red-600 rounded-full"
                   style={{width: `${students.length > 0 ? (students.filter(s => s.status === 'Rejected').length / students.length) * 100 : 0}%`}}></div>
            </div>
          </div>
          </div>

        {/* Search and Filter Controls */}
        <div className="content-section slide-up mb-8">
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
                  className="form-input pl-10"
                />
              </div>

              {/* Status Filter */}
              <div className="relative">
                <FilterIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value as Status | 'All')}
                  className="form-select pl-10"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <button 
                onClick={() => setShowAddStudent(true)}
                className="btn-primary flex items-center text-sm sm:text-base py-2 px-3 sm:py-3 sm:px-6"
              >
                <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline sm:inline">Add </span>Student
              </button>
              <button 
                onClick={() => setShowAddCourse(true)}
                className="btn-secondary flex items-center text-sm sm:text-base py-2 px-3 sm:py-3 sm:px-6"
              >
                <PlusIcon className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                <span className="hidden xs:inline sm:inline">Add </span>Course
              </button>
              <button 
                onClick={() => setShowPrintReport(true)}
                className="btn-success flex items-center text-sm sm:text-base py-2 px-3 sm:py-3 sm:px-6"
              >
                <span className="text-base sm:text-lg mr-1 sm:mr-2">🖨️</span>
                <span className="hidden xs:inline sm:inline">Print </span>Report
              </button>
            </div>
          </div>
        </div>

        {/* Students Section */}
        <div className="content-section slide-up mb-8" style={{animationDelay: '0.2s'}}>
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <div className="text-3xl mr-3">👥</div>
              <h3 className="text-2xl font-bold text-gray-900">Students ({filteredStudents.length})</h3>
            </div>
            
            {/* Pagination Info */}
            {totalPages > 1 && (
              <div className="text-gray-600 text-sm">
                Page {currentPage} of {totalPages}
              </div>
            )}
          </div>
            
          {filteredStudents.length === 0 ? (
            <div className="text-center py-16">
              <div className="text-8xl mb-6 opacity-30">👨‍🎓</div>
              <h4 className="text-2xl font-medium text-gray-800 mb-4">No students found</h4>
              <p className="text-gray-600 mb-6">
                {students.length === 0 
                  ? "Students will appear here when they submit applications"
                  : "Try adjusting your search or filter criteria"
                }
              </p>
              {students.length === 0 && (
                <Link 
                  href="/" 
                  className="btn-primary inline-flex items-center"
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
                       className="clean-card p-6 fade-in"
                       style={{animationDelay: `${index * 0.05}s`}}>
                    
                    {/* Student Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h4 className="font-bold text-gray-900 text-lg flex items-center">
                          <span className="mr-2">👤</span>
                          {student.fullName}
                        </h4>
                        <p className="text-gray-600 text-sm">{student.admissionNumber}</p>
                      </div>
                      <div className="flex space-x-1">
                        <button 
                          onClick={() => openEditStudent(student)}
                          className="btn-icon text-blue-600 hover:bg-blue-50 p-1.5 sm:p-2 rounded-md"
                        >
                          <EditIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                        </button>
                        <button 
                          onClick={() => openDeleteConfirm('student', student.id, student.fullName)}
                          className="btn-icon text-red-600 hover:bg-red-50 p-1.5 sm:p-2 rounded-md"
                        >
                          <DeleteIcon className="w-3 h-3 sm:w-4 sm:h-4" />
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
                      {student.location && (
                        <div className="flex items-center text-sm text-gray-700">
                          <Image src="/location.webp" alt="Location" width={16} height={16} className="mr-2 w-4 h-4" />
                          {student.location}
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <div className="mb-4">
                      <span className={`${
                        student.status === 'Accepted' ? 'status-accepted' :
                        student.status === 'Rejected' ? 'status-rejected' :
                        'status-pending'
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
                              className="btn-success flex-1 text-xs"
                            >
                              ✅ Accept
                            </button>
                            <button 
                              onClick={() => handleStatusChange(student.id, 'Rejected')}
                              className="btn-danger flex-1 text-xs"
                            >
                              ❌ Reject
                            </button>
                          </>
                        )}
                        {student.status === 'Accepted' && (
                          <>
                            <button 
                              onClick={() => handleViewPDF(student)}
                              className="btn-primary flex-1 text-xs flex items-center justify-center"
                            >
                              <ViewIcon className="w-3 h-3 mr-1" />
                              View PDF
                            </button>
                            <button 
                              onClick={() => handleResendAdmissionEmail(student)}
                              className="btn-warning flex-1 text-xs flex items-center justify-center"
                              title="Resend admission letter via email"
                            >
                              <span className="mr-1">📧</span>
                              Resend Email
                            </button>
                          </>
                        )}
                      </div>

                      {/* Communication Actions */}
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => handleCall(student.phone)}
                          className="btn-secondary flex-1 text-xs flex items-center justify-center"
                        >
                          <PhoneIcon className="w-3 h-3 mr-1" />
                          Call
                        </button>
                        <button 
                          onClick={() => handleSMS(student)}
                          className="btn-secondary flex-1 text-xs flex items-center justify-center"
                        >
                          <SMSIcon className="w-3 h-3 mr-1" />
                          SMS
                        </button>
                        <button 
                          onClick={() => handleWhatsApp(student)}
                          className="btn-success flex-1 text-xs flex items-center justify-center"
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
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Previous
                  </button>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-4 py-2 border rounded-md transition-all duration-200 ${
                        page === currentPage
                          ? 'bg-blue-600 border-blue-600 text-white'
                          : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                    disabled={currentPage === totalPages}
                    className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                  </button>
                </div>
              )}
              </>
            )}
          </div>

        {/* Courses Section */}
        <div className="content-section slide-up">
          <div className="flex items-center mb-6">
            <div className="text-3xl mr-3">📚</div>
            <h3 className="text-2xl font-bold text-gray-900">Courses ({courses.length})</h3>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course, index) => (
              <div key={course.id} 
                   className="clean-card p-6 fade-in"
                   style={{animationDelay: `${index * 0.1}s`}}>
                <div className="flex justify-between items-start mb-4">
                  <h4 className="font-bold text-gray-900 text-lg">{course.name}</h4>
                  <div className="flex space-x-1">
                    <button 
                      onClick={() => openEditCourse(course)}
                      className="btn-icon text-blue-600 hover:bg-blue-50 p-1.5 sm:p-2 rounded-md"
                    >
                      <EditIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                    <button 
                      onClick={() => openDeleteConfirm('course', course.id, course.name)}
                      className="btn-icon text-red-600 hover:bg-red-50 p-1.5 sm:p-2 rounded-md"
                    >
                      <DeleteIcon className="w-3 h-3 sm:w-4 sm:h-4" />
                    </button>
                  </div>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center text-gray-700">
                    <span className="mr-2">💰</span>
                    <span className="font-medium">Fee Balance:</span>
                    <span className="ml-auto font-bold text-blue-600">KES {course.feeBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center text-gray-700">
                    <span className="mr-2">📅</span>
                    <span className="font-medium">Fee Per Year:</span>
                    <span className="ml-auto font-bold text-green-600">KES {course.feePerYear.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {courses.length === 0 && (
            <div className="text-center py-12">
              <div className="text-6xl mb-4 opacity-50">📚</div>
              <h4 className="text-xl font-medium text-gray-800 mb-2">No courses found</h4>
              <p className="text-gray-600">Courses will appear here once added to the database</p>
            </div>
          )}
        </div>
      </div>

      {/* Add Student Modal */}
      {showAddStudent && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3 className="text-2xl font-bold text-gray-900">Add New Student</h3>
            </div>
            <div className="modal-body">
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Full Name"
                  value={studentForm.fullName}
                  onChange={(e) => setStudentForm({...studentForm, fullName: e.target.value})}
                  className="form-input"
                />
                <input
                  type="email"
                  placeholder="Email"
                  value={studentForm.email}
                  onChange={(e) => setStudentForm({...studentForm, email: e.target.value})}
                  className="form-input"
                />
                <input
                  type="tel"
                  placeholder="Phone"
                  value={studentForm.phone}
                  onChange={(e) => setStudentForm({...studentForm, phone: e.target.value})}
                  className="form-input"
                />
                <select
                  value={studentForm.course}
                  onChange={(e) => setStudentForm({...studentForm, course: e.target.value})}
                  className="form-select"
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
                  className="form-input"
                />
                <select
                  value={studentForm.kcseGrade}
                  onChange={(e) => setStudentForm({...studentForm, kcseGrade: e.target.value})}
                  className="form-select"
                >
                  <option value="">Select KCSE Grade</option>
                  <option value="A">A</option>
                  <option value="A-">A-</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="B-">B-</option>
                  <option value="C+">C+</option>
                  <option value="C">C</option>
                  <option value="C-">C-</option>
                  <option value="D+">D+</option>
                  <option value="D">D</option>
                  <option value="D-">D-</option>
                  <option value="E">E</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                onClick={() => setShowAddStudent(false)}
                className="btn-secondary"
              >
                Cancel
              </button>
              <button
                onClick={handleAddStudent}
                className="btn-primary"
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
          <div className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-4 sm:p-8 shadow-2xl w-full max-w-[95vw] sm:max-w-md animate-scale-in">
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
              <select
                value={studentForm.kcseGrade}
                onChange={(e) => setStudentForm({...studentForm, kcseGrade: e.target.value})}
                className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white"
              >
                <option value="">Select KCSE Grade</option>
                <option value="A">A</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B">B</option>
                <option value="B-">B-</option>
                <option value="C+">C+</option>
                <option value="C">C</option>
                <option value="C-">C-</option>
                <option value="D+">D+</option>
                <option value="D">D</option>
                <option value="D-">D-</option>
                <option value="E">E</option>
              </select>
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
          <div className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-4 sm:p-8 shadow-2xl w-full max-w-[95vw] sm:max-w-md animate-scale-in">
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

      {/* Edit Course Modal */}
      {showEditCourse && selectedCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-4 sm:p-8 shadow-2xl w-full max-w-[95vw] sm:max-w-md animate-scale-in">
            <h3 className="text-2xl font-bold text-white mb-6">Edit Course</h3>
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
                onClick={() => {
                  setShowEditCourse(false)
                  setSelectedCourse(null)
                  setCourseForm({ name: '', feeBalance: 0, feePerYear: 0 })
                }}
                className="flex-1 px-6 py-3 glass-button backdrop-blur-sm bg-gray-500/20 border border-gray-400/30 text-white rounded-2xl hover:bg-gray-500/30 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleEditCourse}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-2xl hover:from-blue-700 hover:to-purple-700 transition-all duration-300"
              >
                Update Course
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-4 sm:p-8 shadow-2xl w-full max-w-[95vw] sm:max-w-md animate-scale-in">
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
                    } else if (deleteTarget.type === 'course') {
                      handleDeleteCourse(deleteTarget.id)
                    }
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-sm">
          <div className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl shadow-2xl w-full max-w-[98vw] sm:max-w-4xl h-[95vh] sm:h-5/6 flex flex-col animate-scale-in">
            <div className="flex items-center justify-between p-3 sm:p-6 border-b border-white/20">
              <h3 className="text-lg sm:text-2xl font-bold text-white flex items-center">
                <span className="text-2xl sm:text-3xl mr-2 sm:mr-3">📄</span>
                <span className="hidden sm:inline">Official Admission Letter - </span>
                <span className="sm:hidden">Letter - </span>
                <span className="truncate">{selectedStudent.fullName}</span>
              </h3>
              <div className="flex space-x-1 sm:space-x-2">
                <button
                  onClick={() => {
                    setShowPDFViewer(false)
                    setPdfUrl(null)
                    setPdfBlob(null)
                    if (pdfUrl) {
                      URL.revokeObjectURL(pdfUrl)
                    }
                  }}
                  className="px-3 sm:px-4 py-2 glass-button backdrop-blur-sm bg-red-500/20 border border-red-400/30 text-white rounded-xl hover:bg-red-500/30 transition-all duration-300 text-xs sm:text-sm flex items-center"
                >
                  <span className="mr-1 sm:mr-2">✕</span>
                  Close
                </button>
              </div>
            </div>
            <div className="flex-1 p-2 sm:p-6">
              {isMobileDevice ? (
                // Mobile: Show message with menu bar of actions
                <div className="flex flex-col items-center justify-center h-full bg-white rounded-2xl border border-white/20 shadow-inner p-6">
                  <div className="text-center">
                    <div className="text-6xl mb-4">📄</div>
                    <h4 className="text-xl font-bold text-gray-800 mb-4">PDF Document Ready</h4>
                    <p className="text-gray-600 mb-6 text-sm leading-relaxed">
                      Your admission letter is ready to view. Click below to access your PDF document.
                    </p>
                    
                    {/* Mobile Menu Bar */}
                    <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                      <button
                        onClick={() => {
                          if (pdfUrl) {
                            window.open(pdfUrl, '_blank')
                          }
                        }}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center"
                      >
                        <span className="mr-2">👁️</span>
                        Open PDF
                      </button>
                      
                      <button
                        onClick={() => handleResendAdmissionEmail(selectedStudent)}
                        className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center"
                      >
                        <span className="mr-2">📧</span>
                        Email PDF
                      </button>
                      
                      <button
                        onClick={handleDownloadPDF}
                        className="bg-green-600 hover:bg-green-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors duration-200 flex items-center"
                      >
                        <span className="mr-2">📥</span>
                        Download
                      </button>
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-4">
                      Official admission letter for {selectedStudent?.fullName}
                    </p>
                  </div>
                </div>
              ) : (
                // Desktop: iframe with action buttons
                <div className="h-full flex flex-col">
                  <iframe
                    src={pdfUrl}
                    className="flex-1 w-full rounded-2xl border border-white/20 bg-white shadow-inner mb-4"
                    title="Official Admission Letter PDF"
                  />
                  {/* Desktop Action Buttons */}
                  <div className="flex gap-3 justify-center">
                    <button
                      onClick={handleDownloadPDF}
                      className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
                    >
                      <DownloadIcon className="w-4 h-4 mr-2" />
                      Download PDF
                    </button>
                    <button
                      onClick={() => handleResendAdmissionEmail(selectedStudent)}
                      className="bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 flex items-center"
                    >
                      <span className="mr-2">📧</span>
                      Email PDF
                    </button>
                  </div>
                </div>
              )}
            </div>
            <div className="px-6 pb-4">
              <div className="flex items-center text-green-200 text-sm">
                <span className="mr-2">✅</span>
                This is the official EAVI admission letter with filled student details
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WhatsApp Share Modal */}
      {showWhatsAppShare && selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-4 sm:p-8 shadow-2xl w-full max-w-[95vw] sm:max-w-md animate-scale-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <WhatsAppIcon className="w-8 h-8 mr-3 text-green-400" />
              Send WhatsApp Message
            </h3>
            
            {/* Contact Info Display */}
            <div className="bg-green-500/20 border border-green-400/30 rounded-2xl p-4 mb-6">
              <div className="flex items-center mb-2">
                <span className="text-2xl mr-3">👤</span>
                <div>
                  <div className="text-white font-bold">{selectedStudent.fullName}</div>
                  <div className="text-green-200 text-sm">{selectedStudent.phone}</div>
                  <div className="text-green-300 text-xs">{selectedStudent.course} • {selectedStudent.status}</div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              {/* Application Received Message */}
              <button
                onClick={() => sendWhatsAppMessage(`🎓 *EAVI - Application Update*\n\nHello ${selectedStudent.fullName},\n\nYour application to East Africa Vision Institute has been *RECEIVED* and is currently being reviewed by our admissions team.\n\n📋 *Application Details:*\n• Course: ${selectedStudent.course}\n• Admission No: ${selectedStudent.admissionNumber}\n• Status: Under Review\n\nWe'll notify you once the review is complete. Thank you for your patience!\n\n📞 *Contact:* 0726022044 / 0748022044\n🏢 *Main Campus:* Skymart Building, Room F45\n🏢 *West Campus:* [Location]\n\n🎓 EAVI Admissions Team`)}
                className="w-full p-4 glass-button backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 text-blue-200 hover:text-white hover:bg-blue-500/30 rounded-2xl transition-all duration-300 text-left"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📝</span>
                  <div>
                    <div className="font-medium">Application Received</div>
                    <div className="text-xs opacity-75">Notify about application status</div>
                  </div>
                </div>
              </button>

              {/* Approval Notification */}
              <button
                onClick={() => sendWhatsAppMessage(`🎉 *CONGRATULATIONS!*\n\nDear ${selectedStudent.fullName},\n\nWe are *DELIGHTED* to inform you that your application to East Africa Vision Institute has been *APPROVED*! ✅\n\n🎓 *Admission Details:*\n• Course: ${selectedStudent.course}\n• Admission No: ${selectedStudent.admissionNumber}\n• Academic Year: 2025/2026\n\n📄 Your official admission letter is ready for collection or will be emailed to you shortly.\n\n📋 *Next Steps:*\n1. Visit our office with required documents\n2. Complete fee payment process\n3. Attend orientation program\n\n📞 *Contact:* 0726022044 / 0748022044\n🏢 *Main Campus:* Skymart Building, Room F45\n🏢 *West Campus:* [Location]\n\nWelcome to EAVI family! We look forward to seeing you soon.\n\n🏆 *Leading the Leaders • Nurturing Quality Education*`)}
                className="w-full p-4 glass-button backdrop-blur-sm bg-green-500/20 border border-green-400/30 text-green-200 hover:text-white hover:bg-green-500/30 rounded-2xl transition-all duration-300 text-left"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">✅</span>
                  <div>
                    <div className="font-medium">Approval Notification</div>
                    <div className="text-xs opacity-75">Congratulatory admission message</div>
                  </div>
                </div>
              </button>

              {/* Request Information */}
              <button
                onClick={() => sendWhatsAppMessage(`📋 *EAVI - Additional Information Required*\n\nHello ${selectedStudent.fullName},\n\nThank you for your interest in East Africa Vision Institute. We are currently reviewing your application for *${selectedStudent.course}*.\n\nTo complete your application process, we need some additional information or documents from you.\n\n📞 *Please contact our admissions office:*\n• Phone: 0726022044 / 0748022044\n• Email: Info.eavi.college.it.depertment@gmail.com\n\n🏢 *Campuses:*\n• Main Campus: Skymart Building, Room F45\n• West Campus: [Location]\n\n⏰ *Office Hours:*\nMonday - Friday: 8:00 AM - 5:00 PM\nSaturday: 9:00 AM - 1:00 PM\n\nWe look forward to hearing from you soon!\n\n🎓 EAVI Admissions Team`)}
                className="w-full p-4 glass-button backdrop-blur-sm bg-orange-500/20 border border-orange-400/30 text-orange-200 hover:text-white hover:bg-orange-500/30 rounded-2xl transition-all duration-300 text-left"
              >
                <div className="flex items-center">
                  <span className="text-2xl mr-3">📞</span>
                  <div>
                    <div className="font-medium">Request More Info</div>
                    <div className="text-xs opacity-75">Ask student to contact office</div>
                  </div>
                </div>
              </button>

              {/* Admission Letter Ready */}
              {selectedStudent.status === 'Accepted' && (
                <>
                  <button
                    onClick={() => sendWhatsAppMessage(`📄 *Your Admission Letter is Ready!*\n\nDear ${selectedStudent.fullName},\n\nGreat news! Your official admission letter for *${selectedStudent.course}* at East Africa Vision Institute is now ready for collection.\n\n🎓 *Admission Details:*\n• Student: ${selectedStudent.fullName}\n• Course: ${selectedStudent.course}\n• Admission No: ${selectedStudent.admissionNumber}\n• Status: APPROVED ✅\n\n📍 *Collection Options:*\n1. Visit our office for physical copy\n2. We can email you a digital copy\n\n📞 Contact: 0726022044 / 0748022044\n📧 Email: Info.eavi.college.it.depertment@gmail.com\n\n🏢 *Campuses:*\n• Main Campus: Skymart Building, Room F45\n• West Campus: [Location]\n\n⏰ Office Hours: Mon-Fri 8AM-5PM, Sat 9AM-1PM\n\nCongratulations once again! 🎉\n\n🏆 EAVI - Leading the Leaders`)}
                    className="w-full p-4 glass-button backdrop-blur-sm bg-purple-500/20 border border-purple-400/30 text-purple-200 hover:text-white hover:bg-purple-500/30 rounded-2xl transition-all duration-300 text-left"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📄</span>
                      <div>
                        <div className="font-medium">Admission Letter Ready</div>
                        <div className="text-xs opacity-75">Letter collection notification</div>
                      </div>
                    </div>
                  </button>
                  
                  {/* Share PDF via WhatsApp */}
                  <button
                    onClick={() => {
                      handleSharePDFViaWhatsApp()
                    }}
                    className="w-full p-4 glass-button backdrop-blur-sm bg-indigo-500/20 border border-indigo-400/30 text-indigo-200 hover:text-white hover:bg-indigo-500/30 rounded-2xl transition-all duration-300 text-left"
                  >
                    <div className="flex items-center">
                      <span className="text-2xl mr-3">📎</span>
                      <div>
                        <div className="font-medium">Share PDF Document</div>
                        <div className="text-xs opacity-75">Download PDF and send via WhatsApp</div>
                      </div>
                    </div>
                  </button>
                </>
              )}
            </div>
            
            <button
              onClick={() => setShowWhatsAppShare(false)}
              className="w-full mt-6 px-6 py-3 glass-button backdrop-blur-sm bg-gray-500/20 border border-gray-400/30 text-white rounded-2xl hover:bg-gray-500/30 transition-all duration-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-4 sm:p-8 shadow-2xl w-full max-w-[95vw] sm:max-w-md animate-scale-in">
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
              <div>
                <label className="block text-white font-medium mb-2">Admission Starting Number</label>
                <input
                  type="number"
                  min="1"
                  value={settings.admissionStartingNumber || 1000}
                  onChange={(e) => setSettings({...settings, admissionStartingNumber: Number(e.target.value) || 1000})}
                  className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white"
                  placeholder="1000"
                />
                <p className="text-white/60 text-xs mt-1">⚠️ WARNING: Changing this will reset the admission counter and may cause duplicates!</p>
                <p className="text-white/60 text-xs mt-1">Current counter will be preserved unless you click &quot;Reset Counter&quot; below.</p>
              </div>
            </div>
            <div className="space-y-4 mt-6">
              {/* Reset Counter Button (Optional) */}
              <button
                onClick={async () => {
                  const confirmed = confirm(
                    `⚠️ DANGEROUS ACTION ⚠️\n\n` +
                    `This will RESET the admission counter to ${settings.admissionStartingNumber}.\n\n` +
                    `This may cause DUPLICATE admission numbers if students already exist with higher numbers!\n\n` +
                    `Are you absolutely sure you want to reset the counter?`
                  )
                  
                  if (!confirmed) return
                  
                  try {
                    const counterResult = await SupabaseService.initializeAdmissionCounterSafe(settings.admissionStartingNumber, 'EAVI')
                    
                    if (counterResult.success) {
                      alert(`Counter reset successfully! ✅\nNext number: ${counterResult.nextNumber}`)
                    } else {
                      alert(`Counter adjusted for safety! ⚠️\n${counterResult.message}\nNext number: ${counterResult.nextNumber}`)
                    }
                  } catch (error) {
                    console.error('Error resetting counter:', error)
                    alert('Failed to reset counter. Check console for details.')
                  }
                }}
                className="w-full px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 text-white text-sm rounded-xl hover:from-red-700 hover:to-red-800 transition-all duration-300"
              >
                🔄 Reset Admission Counter (DANGEROUS)
              </button>
              
              <div className="flex space-x-4">
                <button
                  onClick={() => setShowSettings(false)}
                  className="flex-1 px-6 py-3 glass-button backdrop-blur-sm bg-gray-500/20 border border-gray-400/30 text-white rounded-2xl hover:bg-gray-500/30 transition-all duration-300"
                >
                  Cancel
                </button>
                <button
                  onClick={async () => {
                    try {
                      // Save settings to database (without resetting counter)
                      await Promise.all([
                        SupabaseService.setSetting('reportingDate', settings.reportingDate, 'Admin dashboard reporting date setting'),
                        SupabaseService.setSetting('approvalMode', settings.approvalMode, 'Student approval mode (manual/automatic)'),
                        SupabaseService.setSetting('autoApprovalDelay', settings.autoApprovalDelay.toString(), 'Auto-approval delay in minutes'),
                        SupabaseService.setSetting('admissionStartingNumber', settings.admissionStartingNumber.toString(), 'Starting number for auto-generated admission numbers (reference only)')
                      ])
                      
                      alert('Settings saved successfully! ✅\n\nNote: Admission counter was NOT reset to preserve existing numbers.\nUse "Reset Counter" button above only if needed.')
                      setShowSettings(false)
                    } catch (error) {
                      console.error('Error saving settings:', error)
                      alert('Failed to save settings. Please try again.')
                    }
                  }}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl hover:from-purple-700 hover:to-pink-700 transition-all duration-300"
                >
                  Save Settings
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Print Report Modal */}
      {showPrintReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="glass-card backdrop-blur-xl bg-white/10 border border-white/20 rounded-3xl p-4 sm:p-8 shadow-2xl w-full max-w-[95vw] sm:max-w-lg animate-scale-in max-h-[90vh] overflow-y-auto">
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center">
              <span className="text-3xl mr-3">🖨️</span>
              Print Applicants Report
            </h3>
            
            <div className="space-y-4">
              {/* Year Filter */}
              <div>
                <label className="block text-white font-medium mb-2">Year</label>
                <input
                  type="number"
                  placeholder="2024"
                  value={printFilters.year}
                  onChange={(e) => setPrintFilters({...printFilters, year: e.target.value})}
                  className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60"
                />
              </div>
              
              {/* Month Filter */}
              <div>
                <label className="block text-white font-medium mb-2">Month (Optional)</label>
                <select
                  value={printFilters.month}
                  onChange={(e) => setPrintFilters({...printFilters, month: e.target.value})}
                  className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white"
                >
                  <option value="">All Months</option>
                  <option value="1">January</option>
                  <option value="2">February</option>
                  <option value="3">March</option>
                  <option value="4">April</option>
                  <option value="5">May</option>
                  <option value="6">June</option>
                  <option value="7">July</option>
                  <option value="8">August</option>
                  <option value="9">September</option>
                  <option value="10">October</option>
                  <option value="11">November</option>
                  <option value="12">December</option>
                </select>
              </div>
              
              {/* Day Filter */}
              <div>
                <label className="block text-white font-medium mb-2">Day (Optional)</label>
                <input
                  type="number"
                  min="1"
                  max="31"
                  placeholder="Day"
                  value={printFilters.day}
                  onChange={(e) => setPrintFilters({...printFilters, day: e.target.value})}
                  className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60"
                />
              </div>
              
              {/* Status Filter */}
              <div>
                <label className="block text-white font-medium mb-2">Status</label>
                <select
                  value={printFilters.status}
                  onChange={(e) => setPrintFilters({...printFilters, status: e.target.value})}
                  className="w-full p-3 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white"
                >
                  <option value="All">All Status</option>
                  <option value="Pending">Pending</option>
                  <option value="Accepted">Accepted</option>
                  <option value="Rejected">Rejected</option>
                </select>
              </div>
              
              {/* Preview Info */}
              <div className="bg-blue-500/20 border border-blue-400/30 rounded-2xl p-4">
                <div className="text-blue-200 text-sm">
                  <div className="flex items-center mb-2">
                    <span className="mr-2">📊</span>
                    <span className="font-medium">Report Preview</span>
                  </div>
                  <div>Filters: {printFilters.year}{printFilters.month ? ` / ${new Date(2024, parseInt(printFilters.month) - 1, 1).toLocaleDateString('en-US', { month: 'long' })}` : ''}{printFilters.day ? ` / ${printFilters.day}` : ''} | {printFilters.status}</div>
                  <div>This will generate a printable report of applicants matching your criteria.</div>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-4 mt-6">
              <button
                onClick={() => setShowPrintReport(false)}
                className="flex-1 px-6 py-3 glass-button backdrop-blur-sm bg-gray-500/20 border border-gray-400/30 text-white rounded-2xl hover:bg-gray-500/30 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handlePrintReport}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-2xl hover:from-green-700 hover:to-emerald-700 transition-all duration-300 flex items-center justify-center"
              >
                <span className="mr-2">🖨️</span>
                Generate Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced SMS Modal */}
      {showSMSModal && selectedStudent && (
        <div className="fixed inset-0 modal-backdrop bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="glass-card backdrop-blur-lg bg-gradient-to-br from-purple-500/20 to-blue-500/20 border border-white/30 rounded-3xl p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-scale-in">
            <div className="text-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <SMSIcon className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-white mb-2">
                Send SMS Message
              </h2>
              <div className="text-gray-200 text-sm">
                <div className="mb-1">📱 To: <span className="font-medium">{selectedStudent.fullName}</span></div>
                <div className="mb-1">📞 Phone: <span className="font-medium">{selectedStudent.phone}</span></div>
                <div>📚 Course: <span className="font-medium">{selectedStudent.course}</span></div>
              </div>
            </div>
            
            <div className="space-y-6">
              {/* Template Selection */}
              <div>
                <label className="block text-white font-medium mb-3">Message Template</label>
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <button
                    type="button"
                    onClick={() => handleTemplateSelect('custom')}
                    className={`p-3 rounded-2xl border transition-all duration-300 ${
                      smsForm.template === 'custom'
                        ? 'bg-purple-500/30 border-purple-400/50 text-white'
                        : 'bg-white/10 border-white/20 text-gray-200 hover:bg-white/20'
                    }`}
                  >
                    ✏️ Custom Message
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTemplateSelect('admission_approved')}
                    className={`p-3 rounded-2xl border transition-all duration-300 ${
                      smsForm.template === 'admission_approved'
                        ? 'bg-green-500/30 border-green-400/50 text-white'
                        : 'bg-white/10 border-white/20 text-gray-200 hover:bg-white/20'
                    }`}
                  >
                    🎉 Admission Approved
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTemplateSelect('document_ready')}
                    className={`p-3 rounded-2xl border transition-all duration-300 ${
                      smsForm.template === 'document_ready'
                        ? 'bg-blue-500/30 border-blue-400/50 text-white'
                        : 'bg-white/10 border-white/20 text-gray-200 hover:bg-white/20'
                    }`}
                  >
                    📋 Document Ready
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTemplateSelect('fee_reminder')}
                    className={`p-3 rounded-2xl border transition-all duration-300 ${
                      smsForm.template === 'fee_reminder'
                        ? 'bg-yellow-500/30 border-yellow-400/50 text-white'
                        : 'bg-white/10 border-white/20 text-gray-200 hover:bg-white/20'
                    }`}
                  >
                    💰 Fee Reminder
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTemplateSelect('interview_schedule')}
                    className={`p-3 rounded-2xl border transition-all duration-300 ${
                      smsForm.template === 'interview_schedule'
                        ? 'bg-indigo-500/30 border-indigo-400/50 text-white'
                        : 'bg-white/10 border-white/20 text-gray-200 hover:bg-white/20'
                    }`}
                  >
                    📅 Interview Schedule
                  </button>
                  <button
                    type="button"
                    onClick={() => handleTemplateSelect('orientation_reminder')}
                    className={`p-3 rounded-2xl border transition-all duration-300 ${
                      smsForm.template === 'orientation_reminder'
                        ? 'bg-teal-500/30 border-teal-400/50 text-white'
                        : 'bg-white/10 border-white/20 text-gray-200 hover:bg-white/20'
                    }`}
                  >
                    🎓 Orientation Reminder
                  </button>
                </div>
              </div>
              
              {/* Message Text Area */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-white font-medium">Message Content</label>
                  <div className={`text-sm ${
                    smsForm.message.length <= 160 
                      ? 'text-green-300' 
                      : smsForm.message.length <= 480 
                        ? 'text-yellow-300' 
                        : 'text-red-300'
                  }`}>
                    {smsForm.message.length}/160 characters
                    {smsForm.message.length <= 160 ? ' (SMS)' : ' (MMS)'}
                  </div>
                </div>
                <textarea
                  value={smsForm.message}
                  onChange={(e) => setSmsForm({ ...smsForm, message: e.target.value })}
                  placeholder="Enter your SMS message here..."
                  rows={6}
                  maxLength={1000}
                  className="w-full p-4 glass-input backdrop-blur-sm bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 resize-none focus:border-purple-400/50 focus:outline-none transition-all duration-300"
                />
                
                {/* Placeholder Help */}
                <div className="mt-3 p-3 bg-blue-500/20 border border-blue-400/30 rounded-xl">
                  <div className="text-blue-200 text-sm">
                    <div className="font-medium mb-2">💡 Available Placeholders:</div>
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div>• {'{name}'} - Student Name</div>
                      <div>• {'{course}'} - Course Name</div>
                      <div>• {'{admissionNumber}'} - Admission #</div>
                      <div>• {'{phone}'} - Phone Number</div>
                      <div>• {'{email}'} - Email Address</div>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Message Preview */}
              {smsForm.message.trim() && (
                <div>
                  <label className="block text-white font-medium mb-3">Message Preview</label>
                  <div className="p-4 bg-gray-800/50 border border-gray-600/50 rounded-2xl">
                    <div className="text-gray-300 text-sm whitespace-pre-wrap">
                      {smsForm.message
                        .replace(/{name}/g, selectedStudent.fullName)
                        .replace(/{course}/g, selectedStudent.course)
                        .replace(/{admissionNumber}/g, selectedStudent.admissionNumber)
                        .replace(/{phone}/g, selectedStudent.phone)
                        .replace(/{email}/g, selectedStudent.email)
                      }
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex space-x-4 mt-8">
              <button
                onClick={() => {
                  setShowSMSModal(false)
                  setSmsForm({ message: '', template: 'custom' })
                  setSelectedStudent(null)
                }}
                className="flex-1 px-6 py-3 glass-button backdrop-blur-sm bg-gray-500/20 border border-gray-400/30 text-white rounded-2xl hover:bg-gray-500/30 transition-all duration-300"
              >
                Cancel
              </button>
              <button
                onClick={handleSendSMS}
                disabled={!smsForm.message.trim()}
                className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-2xl hover:from-purple-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center"
              >
                <span className="mr-2">📱</span>
                Send SMS
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.25);
        }
        
        .glass-card-3d {
          background: rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          transform-style: preserve-3d;
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        .glass-header {
          background: rgba(255, 255, 255, 0.12);
          backdrop-filter: blur(24px);
          -webkit-backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(255, 255, 255, 0.2);
        }
        
        .glass-button {
          background: rgba(255, 255, 255, 0.15);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.25);
        }
        
        .glass-button-3d {
          background: rgba(255, 255, 255, 0.18);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          transform-style: preserve-3d;
          border: 1px solid rgba(255, 255, 255, 0.25);
        }

        .glass-input {
          background: rgba(255, 255, 255, 0.2);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.3);
        }
        
        /* Fix dropdown option visibility */
        .glass-input select option {
          background: white !important;
          color: black !important;
        }
        
        .glass-input select option:hover {
          background: #f0f0f0 !important;
          color: black !important;
        }
        
        /* Improve text readability */
        .glass-card h1, .glass-card h2, .glass-card h3, .glass-card h4 {
          text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .glass-card p, .glass-card div, .glass-card span {
          text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
        }
        
        /* Better backgrounds for content sections */
        .content-section {
          background: rgba(255, 255, 255, 0.25) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
        }
        
        /* Enhanced modal backgrounds */
        .modal-backdrop {
          background: rgba(0, 0, 0, 0.6) !important;
        }
        
        /* Better visibility for stats cards */
        .stat-card {
          background: rgba(255, 255, 255, 0.22) !important;
          border: 1px solid rgba(255, 255, 255, 0.35) !important;
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