'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { CheckIcon } from '../components/Icons'
import { countiesByRegion, regionNames } from '../data/kenyan-counties'
import { EmailService } from '../services/emailService'
import { SupabaseService } from '../services/supabaseService'
import { AutoApprovalService } from '../services/autoApprovalService'

export default function ApplyPage() {
  const [logoError, setLogoError] = useState(false)
  const [currentLogo, setCurrentLogo] = useState('/eavi-logo.png')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [availableCourses, setAvailableCourses] = useState<string[]>([])
  const [emailSending, setEmailSending] = useState(false)
  const [emailError, setEmailError] = useState('')
  const [isCheckingEmail, setIsCheckingEmail] = useState(false)
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    course: '',
    kcseGrade: '',
    location: ''
  })

  // Load available courses from Supabase
  useEffect(() => {
    const loadCourses = async () => {
      try {
        const courses = await SupabaseService.getCourses()
        if (courses.length > 0) {
          const courseNames = courses.map(course => course.name)
          setAvailableCourses(courseNames)
        } else {
          // Fallback to default courses if none found
          setAvailableCourses([
            'Business Administration',
            'Computer Science',
            'Information Technology',
            'Public Health',
            'Education',
            'Engineering',
            'Other'
          ])
        }
      } catch (error) {
        console.error('Error loading courses from Supabase:', error)
        // Fallback courses
        setAvailableCourses([
          'Business Administration',
          'Computer Science',
          'Information Technology',
          'Public Health',
          'Education',
          'Engineering',
          'Other'
        ])
      }
    }
    
    loadCourses()
  }, [])

  const tryAlternateLogo = () => {
    console.log('Logo failed to load:', currentLogo)
    const alternates = ['/logo.png', '/eavi.png', '/logo.jpg', '/logo.jpeg']
    const nextLogo = alternates.find(alt => alt !== currentLogo)
    if (nextLogo) {
      console.log('Trying alternate logo:', nextLogo)
      setCurrentLogo(nextLogo)
      setLogoError(false)
    } else {
      console.log('All logo options failed, showing fallback')
      setLogoError(true)
    }
  }

  // Function to check if email already exists
  const checkEmailExists = async (email: string): Promise<boolean> => {
    try {
      return await SupabaseService.checkEmailExists(email)
    } catch (error) {
      console.error('Error checking email:', error)
      return false
    }
  }

  // Handle email validation on blur
  const handleEmailBlur = async () => {
    const email = formData.email.trim()
    if (!email) {
      setEmailError('')
      return
    }

    setIsCheckingEmail(true)
    
    // Simulate API delay for better UX
    await new Promise(resolve => setTimeout(resolve, 500))
    
    const emailExists = await checkEmailExists(email)
    if (emailExists) {
      setEmailError('This email address has already been used for an application. Please use a different email or contact admissions if this is your email.')
    } else {
      setEmailError('')
    }
    
    setIsCheckingEmail(false)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))

    // Clear email error when user starts typing in email field
    if (name === 'email' && emailError) {
      setEmailError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Final email validation before submission
    const emailExists = await checkEmailExists(formData.email.trim())
    if (emailExists) {
      setEmailError('This email address has already been used for an application. Please use a different email.')
      return
    }
    
    setIsSubmitting(true)
    
    try {
      // Save application to Supabase
      const appliedAt = new Date().toISOString()
      const admissionNumber = await SupabaseService.generateAdmissionNumber()
      
      const newStudent = await SupabaseService.createStudent({
        full_name: formData.fullName,
        admission_number: admissionNumber,
        email: formData.email || undefined,
        phone: formData.phone,
        course: formData.course,
        kcse_grade: formData.kcseGrade || undefined,
        location: formData.location || undefined,
        status: 'Pending',
        source: 'online_application',
        applied_at: appliedAt
      })
      
      console.log('Application saved to Supabase:', newStudent)
      
      // Check if auto-approval is enabled and schedule if needed
      const isAutoApprovalEnabled = await AutoApprovalService.isAutoApprovalEnabled()
      if (isAutoApprovalEnabled) {
        const delayMinutes = await AutoApprovalService.getAutoApprovalDelay()
        AutoApprovalService.scheduleAutoApproval(newStudent.id, delayMinutes)
        console.log(`🕐 Auto-approval scheduled for ${formData.fullName} in ${delayMinutes} minutes`)
      }
      
      // Send confirmation email to student
      setEmailSending(true)
      const emailSent = await EmailService.sendApplicationConfirmation({
        fullName: formData.fullName,
        email: formData.email,
        course: formData.course,
        appliedAt
      })
      
      setEmailSending(false)
      setIsSubmitting(false)
      setShowSuccess(true)
      
      if (emailSent) {
        console.log('✅ Confirmation email sent successfully')
      } else {
        console.log('⚠️ Failed to send confirmation email, but application was saved')
      }
      
      // Hide success message after 5 seconds and reset form
      setTimeout(() => {
        setShowSuccess(false)
        setFormData({
          fullName: '',
          email: '',
          phone: '',
          course: '',
          kcseGrade: '',
          location: ''
        })
      }, 5000)
      
    } catch (error) {
      console.error('Error submitting application:', error)
      setIsSubmitting(false)
      setEmailSending(false)
      alert('Failed to submit application. Please try again.')
    }
  }

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <Link href="/" className="flex items-center space-x-4 hover:opacity-80 transition-opacity">
              {/* EAVI Logo */}
              <div className="w-12 h-12">
                {!logoError ? (
                  <Image
                    src={currentLogo}
                    alt="East Africa Vision Institute Logo"
                    width={48}
                    height={48}
                    className="w-full h-full object-contain"
                    priority
                    onError={() => tryAlternateLogo()}
                  />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center shadow-md">
                    <div className="text-center">
                      <div className="w-6 h-6 mx-auto mb-1 bg-white rounded-full flex items-center justify-center">
                        <div className="w-4 h-4 bg-green-600 rounded-full relative">
                          <div className="absolute inset-1 bg-blue-800 rounded-full"></div>
                        </div>
                      </div>
                      <div className="text-white text-xs font-bold">EAVI</div>
                    </div>
                  </div>
                )}
              </div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-gray-900">
                Application Form
              </h1>
            </Link>
            
            {/* Back to Dashboard Link */}
            <Link 
              href="/" 
              className="text-primary-600 hover:text-primary-700 font-medium text-sm sm:text-base flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Dashboard</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-2xl mx-auto">
          {!showSuccess ? (
            <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200">
              <div className="text-center mb-8">
                <div className="mx-auto w-20 h-20 mb-4 bg-white rounded-lg shadow-md p-1">
                  {!logoError ? (
                    <Image
                      src={currentLogo}
                      alt="East Africa Vision Institute Logo"
                      width={76}
                      height={76}
                      className="w-full h-full object-contain"
                      priority
                      onError={() => tryAlternateLogo()}
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg flex items-center justify-center">
                      <div className="text-center">
                        <div className="w-12 h-12 mx-auto mb-1 bg-white rounded-full flex items-center justify-center">
                          <div className="w-8 h-8 bg-green-600 rounded-full relative flex items-center justify-center">
                            <div className="w-5 h-5 bg-blue-800 rounded-full flex items-center justify-center">
                              <div className="w-2 h-3 bg-green-400 rounded-sm transform rotate-12"></div>
                            </div>
                          </div>
                        </div>
                        <div className="text-white text-xs font-bold">EAVI</div>
                      </div>
                    </div>
                  )}
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  Apply to East Africa Vision Institute
                </h2>
                <p className="text-gray-600">
                  Please fill out all fields to submit your application. We&apos;ll review your information and get back to you soon.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div>
                  <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-gray-900"
                    placeholder="Enter your full name"
                  />
                </div>

                {/* Phone Number */}
                <div>
                  <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-gray-900"
                    placeholder="Enter your phone number"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      id="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      onBlur={handleEmailBlur}
                      required
                      className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent transition-colors text-gray-900 ${
                        emailError 
                          ? 'border-red-300 focus:ring-red-500 bg-red-50' 
                          : 'border-gray-300 focus:ring-primary-500'
                      }`}
                      placeholder="Enter your email address"
                    />
                    {isCheckingEmail && (
                      <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600"></div>
                      </div>
                    )}
                  </div>
                  {emailError && (
                    <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-md">
                      <div className="flex items-start space-x-2">
                        <svg className="w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-sm text-red-700">
                          <p className="font-medium">Email Already Used</p>
                          <p>{emailError}</p>
                          <div className="mt-2 space-y-1">
                            <p>If this is your email address:</p>
                            <ul className="list-disc list-inside ml-2 space-y-1">
                              <li>Contact our admissions team at <strong>0726022044</strong> or <strong>0748022044</strong></li>
                              <li>Email us at <strong>Info.eavi.college.it.depertment@gmail.com</strong></li>
                              <li>Visit our Town Office at Skymart Building, Room F45</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Course */}
                <div>
                  <label htmlFor="course" className="block text-sm font-medium text-gray-700 mb-2">
                    Course of Interest *
                  </label>
                  <select
                    id="course"
                    name="course"
                    value={formData.course}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-gray-900"
                  >
                    <option value="">Select a course</option>
                    {availableCourses.map(course => (
                      <option key={course} value={course}>{course}</option>
                    ))}
                  </select>
                </div>

                {/* Location */}
                <div>
                  <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
                    County/Location *
                  </label>
                  <select
                    id="location"
                    name="location"
                    value={formData.location}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-gray-900"
                  >
                    <option value="">Select your county</option>
                    {regionNames.map(regionName => (
                      <optgroup key={regionName} label={regionName} className="font-semibold">
                        {countiesByRegion[regionName].map(county => (
                          <option key={county.value} value={county.value}>
                            {county.label}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                    <option value="Other">Other (Outside Kenya)</option>
                  </select>
                </div>

                {/* KCSE Grade */}
                <div>
                  <label htmlFor="kcseGrade" className="block text-sm font-medium text-gray-700 mb-2">
                    KCSE Grade
                  </label>
                  <select
                    id="kcseGrade"
                    name="kcseGrade"
                    value={formData.kcseGrade}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors text-gray-900"
                  >
                    <option value="">Select your KCSE Grade</option>
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

                {/* Submit Button */}
                <div className="pt-4">
                  <button
                    type="submit"
                    disabled={isSubmitting || emailSending || !!emailError || isCheckingEmail}
                    className="w-full btn-primary text-lg py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
                  >
                    {isSubmitting || emailSending ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <span>
                          {emailSending ? 'Sending Confirmation Email...' : 'Submitting Application...'}
                        </span>
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        <span>Submit Application</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            // Success Message
            <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckIcon className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Application Submitted Successfully!
              </h3>
              <p className="text-gray-600 mb-4 text-lg">
                Thank you for your application to East Africa Vision Institute. We have received your information and will review it carefully.
              </p>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <div className="flex items-center space-x-2 text-blue-800">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 7.89a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  <span className="font-medium">Confirmation email sent!</span>
                </div>
                <p className="text-blue-700 text-sm mt-2">
                  We&apos;ve sent a confirmation email to <strong>{formData.email}</strong> with your application details. Please check your inbox (and spam folder).
                </p>
              </div>
              <p className="text-gray-500 mb-8">
                You should expect to hear from our admissions team within 3-5 business days. If approved, you&apos;ll receive your admission letter via email.
              </p>
              <Link 
                href="/" 
                className="btn-primary text-lg py-3 px-8 rounded-lg inline-flex items-center space-x-2"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span>Return to Dashboard</span>
              </Link>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600 text-sm">
            <p>&copy; 2025 East Africa Vision Institute. All rights reserved.</p>
            <p className="mt-1">Leading the leaders. Nurturing quality and affordable education.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}