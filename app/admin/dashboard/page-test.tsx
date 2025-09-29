'use client'

export default function AdminDashboard() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">EAVI Admin Dashboard - Test Version</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">Dashboard Status</h3>
            <div className="space-y-4">
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
                ✅ Dashboard is loading successfully
              </div>
              <div className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded">
                📊 This is a minimal test version to verify the dashboard works
              </div>
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded">
                🔧 If you can see this, the issue is with data loading, not the dashboard itself
              </div>
              
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 mb-2">Next Steps:</h4>
                <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                  <li>Check browser console for JavaScript errors</li>
                  <li>Verify Supabase connection is working</li>
                  <li>Test data loading functions</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}