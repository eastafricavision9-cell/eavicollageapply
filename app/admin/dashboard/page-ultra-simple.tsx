export default function AdminDashboard() {
  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f9fafb', 
      padding: '20px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ 
        backgroundColor: 'white', 
        padding: '20px', 
        borderRadius: '8px',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        <h1 style={{ color: '#111827', fontSize: '24px', marginBottom: '20px' }}>
          🎯 EAVI Admin Dashboard - Ultra Simple Version
        </h1>
        
        <div style={{ marginBottom: '20px' }}>
          <div style={{ 
            backgroundColor: '#10b981', 
            color: 'white', 
            padding: '10px 20px', 
            borderRadius: '6px',
            marginBottom: '10px'
          }}>
            ✅ This page is loading correctly
          </div>
          
          <div style={{ 
            backgroundColor: '#3b82f6', 
            color: 'white', 
            padding: '10px 20px', 
            borderRadius: '6px',
            marginBottom: '10px'
          }}>
            🔧 No React hooks, no imports, no complex logic
          </div>
          
          <div style={{ 
            backgroundColor: '#f59e0b', 
            color: 'white', 
            padding: '10px 20px', 
            borderRadius: '6px',
            marginBottom: '10px'
          }}>
            📝 If you see this, the routing works
          </div>
        </div>

        <div style={{ 
          backgroundColor: '#f3f4f6', 
          padding: '15px', 
          borderRadius: '6px',
          border: '1px solid #d1d5db'
        }}>
          <h3 style={{ margin: '0 0 10px 0', color: '#374151' }}>System Status:</h3>
          <ul style={{ margin: 0, paddingLeft: '20px', color: '#6b7280' }}>
            <li>✅ Next.js routing: Working</li>
            <li>✅ Page rendering: Working</li>
            <li>✅ CSS styling: Working</li>
            <li>❓ The issue is likely with React hooks or imports</li>
          </ul>
        </div>

        <div style={{ marginTop: '20px' }}>
          <a 
            href="/admin/login" 
            style={{
              display: 'inline-block',
              backgroundColor: '#dc2626',
              color: 'white',
              padding: '10px 20px',
              textDecoration: 'none',
              borderRadius: '6px',
              marginRight: '10px'
            }}
          >
            Logout
          </a>
          
          <a 
            href="/" 
            style={{
              display: 'inline-block',
              backgroundColor: '#6b7280',
              color: 'white',
              padding: '10px 20px',
              textDecoration: 'none',
              borderRadius: '6px'
            }}
          >
            View Application Form
          </a>
        </div>
      </div>
    </div>
  )
}