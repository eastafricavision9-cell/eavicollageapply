'use client'

import Image from 'next/image'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthService } from '../../services/authService'

export default function AdminLoginPage() {
  const router = useRouter()
  const [logoError, setLogoError] = useState(false)
  const [currentLogo, setCurrentLogo] = useState('/eavi-logo.png')
  const [isLoading, setIsLoading] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [loginError, setLoginError] = useState('')
  const [showAdminList, setShowAdminList] = useState(false)

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      const isAuthenticated = await AuthService.isAuthenticated()
      if (isAuthenticated) {
        router.push('/admin/dashboard')
        return
      }
      setIsCheckingAuth(false)
    }
    
    checkAuth()
  }, [router])

  // Show loading spinner while checking authentication
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setLoginError('')
    
    try {
      const { user, error } = await AuthService.signIn(formData.email, formData.password)
      
      if (error) {
        setLoginError(error)
        setIsLoading(false)
        return
      }
      
      if (user) {
        console.log('Login successful:', user.email)
        router.push('/admin/dashboard')
      } else {
        setLoginError('Login failed - please try again')
        setIsLoading(false)
      }
    } catch (error) {
      console.error('Login error:', error)
      setLoginError('An unexpected error occurred. Please try again.')
      setIsLoading(false)
    }
  }

  const selectAdminEmail = (email: string) => {
    setFormData({
      email: email,
      password: ''
    })
    setLoginError('')
    setShowAdminList(false)
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
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
                Admin Login
              </h1>
            </Link>
            
            {/* Back to Home Link */}
            <Link 
              href="/" 
              className="text-blue-600 hover:text-blue-700 font-medium text-sm sm:text-base flex items-center space-x-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              <span>Back to Home</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8">
          {/* Login Form Card */}
          <div className="bg-white rounded-xl shadow-lg p-8 border border-gray-200">
            <div className="text-center mb-8">
              {/* Logo */}
              <div className="mx-auto w-20 h-20 mb-6 bg-white rounded-lg shadow-md p-1">
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
                Administrator Login
              </h2>
              <p className="text-gray-600 mb-4">
                Enter your credentials to access the admin dashboard
              </p>
              
              {/* Fixed Admin Accounts Info */}
              {!showAdminList ? (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m0 0v6a2 2 0 01-2 2H7a2 2 0 01-2-2V9a2 2 0 012-2m8 0V7a2 2 0 00-2-2H9a2 2 0 00-2 2v2m8 0h2a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2h2" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">Admin Access</h3>
                      <div className="mt-1 text-sm text-blue-700">
                        <p>Select from the 4 authorized admin accounts</p>
                        <p>You&apos;ll need to enter your password after selection</p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAdminList(true)}
                        className="mt-2 text-xs bg-blue-100 hover:bg-blue-200 text-blue-800 px-2 py-1 rounded"
                      >
                        Show Admin Accounts
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <div className="flex items-start">
                    <div className="flex-shrink-0">
                      <svg className="h-5 w-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-green-800">Authorized Admin Accounts</h3>
                      <div className="mt-2 space-y-2">
                        {AuthService.getAvailableAdmins().map((admin) => (
                          <div key={admin.email} className="flex items-center justify-between bg-white p-2 rounded border">
                            <div>
                              <div className="text-sm font-medium text-gray-900">{admin.name}</div>
                              <div className="text-xs text-gray-600">{admin.email}</div>
                              <div className="text-xs text-blue-600">{admin.role}</div>
                            </div>
                            <button
                              type="button"
                              onClick={() => selectAdminEmail(admin.email)}
                              className="text-xs bg-green-100 hover:bg-green-200 text-green-800 px-2 py-1 rounded"
                            >
                              Select
                            </button>
                          </div>
                        ))}
                      </div>
                      <button
                        type="button"
                        onClick={() => setShowAdminList(false)}
                        className="mt-2 text-xs bg-gray-100 hover:bg-gray-200 text-gray-800 px-2 py-1 rounded"
                      >
                        Hide Admin List
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Error Message */}
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                <div className="flex items-start">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">Login Failed</h3>
                    <p className="text-sm text-red-700 mt-1">{loginError}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Login Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
                    </svg>
                  </div>
                  {AuthService.getAvailableAdmins().some(admin => admin.email === formData.email) && (
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <svg className="h-5 w-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                    </div>
                  )}
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className={`w-full pl-10 py-3 border rounded-lg focus:outline-none transition-colors text-gray-900 ${
                      AuthService.getAvailableAdmins().some(admin => admin.email === formData.email)
                        ? 'pr-10 border-green-500 focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-green-50'
                        : 'pr-4 border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent'
                    }`}
                    placeholder="Select admin email from list above or enter manually"
                  />
                </div>
              </div>

              {/* Password Field */}
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                  Password *
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </div>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors text-gray-900"
                    placeholder="Enter your password"
                  />
                </div>
              </div>

              {/* Login Button */}
              <div className="pt-4">
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg py-4 px-6 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2 transition-colors duration-200"
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                      <span>Signing In...</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                      </svg>
                      <span>Login</span>
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Additional Links */}
            <div className="mt-6 text-center">
              <p className="text-gray-500 text-sm mb-2">
                Need help accessing your account?
              </p>
              <a 
                href="mailto:Info.eavi.college.it.depertment@gmail.com" 
                className="text-blue-600 hover:text-blue-700 text-sm font-medium"
              >
                Contact IT Support
              </a>
            </div>
          </div>

          {/* Security Notice */}
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.315 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Secure Access
                </h3>
                <div className="mt-1 text-sm text-yellow-700">
                  <p>This is a secure area. Only authorized administrators should access this page.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center text-gray-600 text-sm">
            <p>&copy; 2025 East Africa Vision Institute. All rights reserved.</p>
            <p className="mt-1">Administrator Access Portal</p>
          </div>
        </div>
      </footer>
    </div>
  )
}