'use client'

import { useEffect } from 'react'

export default function AdminPage() {
  useEffect(() => {
    // Redirect to login page
    window.location.href = '/admin/login'
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
        <p className="mt-4 text-gray-600">Redirecting to admin login...</p>
      </div>
    </div>
  )
}