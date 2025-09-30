'use client'

import { useState } from 'react'

export default function EmailTestPage() {
  const [testResults, setTestResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const addResult = (test: string, result: any) => {
    setTestResults(prev => [...prev, { test, result, timestamp: new Date().toLocaleTimeString() }])
  }

  const testBasicEmail = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/basic-email-test')
      const result = await response.json()
      addResult('Basic Email Test', result)
    } catch (error) {
      addResult('Basic Email Test', { error: error.message })
    }
    setLoading(false)
  }

  const testAdmissionEmail = async () => {
    setLoading(true)
    try {
      const testStudent = {
        fullName: 'Test Student',
        email: 'eaviafrica@gmail.com', // Send to our own email for testing
        course: 'Computer Science',
        admissionNumber: 'TEST001'
      }

      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          type: 'admission_pdf',
          studentData: testStudent,
          pdfBytes: 'JVBERi0xLjMKJcTl8uXrp/Og0MTGCjQgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL091dGxpbmVzIDIgMCBSCi9QYWdlcyAzIDAgUgo+PgplbmRvYmoK' // Simple PDF base64
        })
      })
      const result = await response.json()
      addResult('Admission Email with PDF', result)
    } catch (error) {
      addResult('Admission Email with PDF', { error: error.message })
    }
    setLoading(false)
  }

  const testEnvironmentVars = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/debug-email')
      const result = await response.json()
      addResult('Environment Variables Check', result)
    } catch (error) {
      addResult('Environment Variables Check', { error: error.message })
    }
    setLoading(false)
  }

  const clearResults = () => {
    setTestResults([])
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          🧪 Email System Local Testing
        </h1>
        
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test Controls</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={testEnvironmentVars}
              disabled={loading}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              📊 Check Environment Variables
            </button>
            
            <button
              onClick={testBasicEmail}
              disabled={loading}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              📧 Test Basic Email
            </button>
            
            <button
              onClick={testAdmissionEmail}
              disabled={loading}
              className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              🎓 Test Admission Email + PDF
            </button>
            
            <button
              onClick={clearResults}
              disabled={loading}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded disabled:opacity-50"
            >
              🗑️ Clear Results
            </button>
          </div>
          
          {loading && (
            <div className="mt-4 text-center">
              <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
              <span className="ml-2">Testing...</span>
            </div>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Test Results</h2>
          
          {testResults.length === 0 ? (
            <p className="text-gray-500 italic">No tests run yet. Click the buttons above to start testing.</p>
          ) : (
            <div className="space-y-4">
              {testResults.map((result, index) => (
                <div
                  key={index}
                  className={`border rounded-lg p-4 ${
                    result.result.success ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                  }`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold">{result.test}</h3>
                    <span className="text-sm text-gray-500">{result.timestamp}</span>
                  </div>
                  
                  <div className="mb-2">
                    Status: {result.result.success ? (
                      <span className="text-green-600 font-semibold">✅ SUCCESS</span>
                    ) : (
                      <span className="text-red-600 font-semibold">❌ FAILED</span>
                    )}
                  </div>
                  
                  <pre className="bg-gray-100 p-3 rounded text-xs overflow-auto max-h-40">
                    {JSON.stringify(result.result, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-900 mb-2">Testing Instructions:</h3>
          <ol className="text-blue-800 text-sm list-decimal list-inside space-y-1">
            <li>First, check environment variables to ensure they're loaded correctly</li>
            <li>Test basic email sending (simple text email)</li>
            <li>Test admission email with PDF attachment (full functionality)</li>
            <li>Check your email inbox (eaviafrica@gmail.com) for received test emails</li>
            <li>If all tests pass, the system is ready for deployment!</li>
          </ol>
        </div>
      </div>
    </div>
  )
}