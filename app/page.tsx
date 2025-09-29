'use client'

import Image from 'next/image'
import { useState } from 'react'
import { LocationIcon, PhoneIcon, EmailIcon, SchoolIcon, OfficeIcon, CampusIcon } from './components/Icons'

export default function Dashboard() {
  const [isLoading, setIsLoading] = useState(false)
  const [logoError, setLogoError] = useState(false)
  const [currentLogo, setCurrentLogo] = useState('/eavi-logo.png')
  const [showAdminAccess, setShowAdminAccess] = useState(false)
  const [longPressTimer, setLongPressTimer] = useState<NodeJS.Timeout | null>(null)

  const tryAlternateLogo = () => {
    // Logo fallback handled silently
    const alternates = ['/logo.png', '/eavi.png', '/logo.jpg', '/logo.jpeg']
    // Try the first alternate that hasn't been tried
    const nextLogo = alternates.find(alt => alt !== currentLogo)
    if (nextLogo) {
      // Trying alternate logo
      setCurrentLogo(nextLogo)
      setLogoError(false)
    } else {
      // All logo options failed, showing fallback
      setLogoError(true)
    }
  }

  const handleAdminLogin = () => {
    setIsLoading(true)
    // Navigate to admin login page
    setTimeout(() => {
      window.location.href = '/admin'
    }, 500)
  }

  const handleApplyNow = () => {
    setIsLoading(true)
    // Navigate to apply page
    setTimeout(() => {
      window.location.href = '/apply'
    }, 500)
  }

  // Long press for admin access
  const handleLogoPress = () => {
    const timer = setTimeout(() => {
      setShowAdminAccess(true)
    }, 2000) // 2 second long press
    setLongPressTimer(timer)
  }

  const handleLogoRelease = () => {
    if (longPressTimer) {
      clearTimeout(longPressTimer)
      setLongPressTimer(null)
    }
  }

  // Phone call functions
  const callPhone = (number: string) => {
    window.open(`tel:${number}`)
  }

  // Campus locations data
  const campusLocations = [
    {
      name: 'Town Office',
      address: 'Skymart Building, 1st Floor, Room F45',
      location: 'next to Raiya Supermarket',
      phone: '0726022044',
      IconComponent: OfficeIcon
    },
    {
      name: 'Main Campus',
      address: 'City Plaza',
      location: 'next to Bandaptai Hotel',
      phone: '0726022044',
      IconComponent: SchoolIcon
    },
    {
      name: 'West Campus',
      address: 'Mailinne',
      location: 'next to Kapyemit Dispensary',
      phone: '0748022044',
      IconComponent: CampusIcon
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Hero Section */}
      <header className="relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-95"></div>
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: 'radial-gradient(circle at 25% 25%, white 1px, transparent 1px), radial-gradient(circle at 75% 75%, white 1px, transparent 1px)',
            backgroundSize: '50px 50px'
          }}></div>
        </div>
        
        {/* Admin Access - Hidden in top right corner */}
        {showAdminAccess && (
          <div className="absolute top-4 right-4 z-50">
            <button
              onClick={handleAdminLogin}
              className="bg-white/20 backdrop-blur-sm text-white p-2 rounded-full text-xs hover:bg-white/30 transition-colors"
              title="Admin Access"
            >
              ⚙️
            </button>
          </div>
        )}
        
        <div className="relative z-10 px-4 py-12 sm:py-20">
          <div className="max-w-4xl mx-auto text-center">
            {/* Interactive Logo with Long-press */}
            <div 
              className="mx-auto w-24 h-24 sm:w-32 sm:h-32 mb-8 cursor-pointer transform transition-transform hover:scale-105"
              onMouseDown={handleLogoPress}
              onMouseUp={handleLogoRelease}
              onMouseLeave={handleLogoRelease}
              onTouchStart={handleLogoPress}
              onTouchEnd={handleLogoRelease}
            >
              {!logoError ? (
                <div className="w-full h-full bg-white rounded-2xl shadow-2xl p-3 hover:shadow-3xl transition-shadow">
                  <Image
                    src={currentLogo}
                    alt="East Africa Vision Institute Logo"
                    width={120}
                    height={120}
                    className="w-full h-full object-contain transition-opacity duration-300"
                    priority
                    quality={90}
                    placeholder="blur"
                    blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTIwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDEyMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIxMjAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik02MCA0MEMxNSA1NSAxNSA4NSA2MCAxMDBDMTA1IDg1IDEwNSA1NSA2MCA0MFoiIGZpbGw9IiMzNTczREMiLz4KPC9zdmc+"
                    onError={() => tryAlternateLogo()}
                    onLoad={() => {/* Logo loaded successfully */}}
                    sizes="(max-width: 640px) 96px, 128px"
                  />
                </div>
              ) : (
                <div className="w-full h-full bg-white rounded-2xl shadow-2xl flex items-center justify-center">
                  <div className="text-center">
                    <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
                      <div className="text-white text-lg font-bold">EAVI</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
            
            {/* Hero Text */}
            <h1 className="text-3xl sm:text-4xl lg:text-6xl font-bold text-white mb-4">
              East Africa Vision Institute
            </h1>
            <p className="text-lg sm:text-xl text-blue-100 mb-2">
              Leading the leaders. Nurturing quality and affordable education.
            </p>
            <p className="text-blue-200 text-sm sm:text-base mb-8 flex items-center justify-center gap-2">
              <Image src="/location.webp" alt="Location" width={16} height={16} className="w-4 h-4" />
              Eldoret, Kenya - Your Gateway to Excellence
            </p>
            
            {/* Main CTA Button */}
            <button
              onClick={handleApplyNow}
              disabled={isLoading}
              className="bg-white text-blue-600 hover:bg-blue-50 text-lg sm:text-xl font-semibold py-4 px-8 rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 disabled:opacity-50 flex items-center justify-center mx-auto space-x-2 min-w-[200px]"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
              ) : (
                <>
                  <span>Apply Now</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Campus Locations Section */}
      <main className="px-4 py-12 sm:py-16">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <div className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-2">
              <Image src="/yxr.webp" alt="Education" width={24} height={24} className="w-6 h-6" />
              Our Campus Locations
            </h2>
            <p className="text-gray-600 text-lg">
              Visit us at any of our convenient locations in Eldoret
            </p>
          </div>
          
          {/* Interactive Campus Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            {campusLocations.map((campus, index) => (
              <div 
                key={index}
                className="bg-white rounded-2xl shadow-xl hover:shadow-2xl transform hover:scale-105 transition-all duration-300 overflow-hidden group"
              >
                {/* Campus Header */}
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white text-center">
                  <div className="flex justify-center mb-3">
                    <campus.IconComponent className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">{campus.name}</h3>
                  <p className="text-blue-100 text-sm">{campus.address}</p>
                </div>
                
                {/* Campus Details */}
                <div className="p-6">
                  <div className="space-y-4">
                    <div className="flex items-start space-x-3">
                      <LocationIcon className="w-5 h-5 text-gray-500 mt-0.5" />
                      <div>
                        <p className="text-gray-600 text-sm leading-relaxed">{campus.location}</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3">
                      <PhoneIcon className="w-5 h-5 text-gray-500" />
                      <div className="flex-1">
                        <a 
                          href={`tel:${campus.phone}`}
                          className="text-blue-600 hover:text-blue-700 font-semibold text-lg transition-colors"
                        >
                          {campus.phone}
                        </a>
                      </div>
                    </div>
                  </div>
                  
                  {/* Quick Call Button */}
                  <button
                    onClick={() => callPhone(campus.phone)}
                    className="w-full mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold py-3 px-4 rounded-xl transition-colors flex items-center justify-center space-x-2"
                  >
                    <PhoneIcon className="w-5 h-5" />
                    <span>Call Now</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
          
          {/* Quick Contact Section */}
          <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">
              🎆 Ready to Start Your Journey?
            </h3>
            <p className="text-gray-600 mb-6">
              Join thousands of students who have chosen EAVI for quality education
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleApplyNow}
                disabled={isLoading}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold py-4 px-8 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 flex items-center space-x-2 min-w-[200px] justify-center"
              >
                {isLoading ? (
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                ) : (
                  <>
                    <span>Apply Online</span>
                  </>
                )}
              </button>
              
              <a 
                href="mailto:Info.eavi.college.it.depertment@gmail.com"
                className="bg-gray-100 hover:bg-gray-200 text-gray-800 font-semibold py-4 px-8 rounded-2xl transition-colors flex items-center space-x-2 min-w-[200px] justify-center"
              >
                <EmailIcon className="w-5 h-5" />
                <span>Email Us</span>
              </a>
            </div>
            
            {/* Emergency Contact */}
            <div className="mt-8 pt-6 border-t border-gray-100">
              <p className="text-gray-500 text-sm mb-2">
                For urgent inquiries, call any of our campus numbers above
              </p>
              <p className="text-gray-600 font-medium">
                🕰️ Office Hours: Mon-Fri 8:00 AM - 6:00 PM
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-6xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Institution Info */}
            <div className="text-center md:text-left">
              <h3 className="text-xl font-bold mb-4 text-blue-300">
                East Africa Vision Institute
              </h3>
              <p className="text-gray-300 mb-2">
                Leading the leaders. Nurturing quality and affordable education.
              </p>
              <div className="flex items-center justify-center md:justify-start space-x-2 text-gray-400 text-sm">
                <LocationIcon className="w-4 h-4" />
                <span>Eldoret, Kenya</span>
              </div>
            </div>
            
            {/* Quick Links */}
            <div className="text-center">
              <h4 className="font-semibold mb-4 text-blue-300">Quick Contact</h4>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-center space-x-2 text-gray-300">
                  <PhoneIcon className="w-4 h-4" />
                  <span>0726022044</span>
                </div>
                <div className="flex items-center justify-center space-x-2 text-gray-300">
                  <PhoneIcon className="w-4 h-4" />
                  <span>0748022044</span>
                </div>
                <a href="mailto:Info.eavi.college.it.depertment@gmail.com" className="text-blue-400 hover:text-blue-300 transition-colors flex items-center justify-center space-x-2">
                  <EmailIcon className="w-4 h-4" />
                  <span>Info.eavi.college.it.depertment@gmail.com</span>
                </a>
              </div>
            </div>
            
            {/* Hours */}
            <div className="text-center md:text-right">
              <h4 className="font-semibold mb-4 text-blue-300">Office Hours</h4>
              <div className="text-sm text-gray-300">
                <p>Monday - Friday</p>
                <p className="font-semibold text-blue-200">8:00 AM - 6:00 PM</p>
              </div>
            </div>
          </div>
          
          {/* Copyright */}
          <div className="border-t border-gray-700 mt-8 pt-6 text-center">
            <p className="text-gray-400 text-sm">
              &copy; 2025 East Africa Vision Institute. All rights reserved.
            </p>
            <p className="text-gray-500 text-xs mt-2">
              Empowering minds, shaping futures in Eldoret and beyond.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}