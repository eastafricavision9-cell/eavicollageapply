'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ModernAdminLogin() {
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError('')
    
    // Simulate login process
    setTimeout(() => {
      if (credentials.username === 'admin' && credentials.password === 'admin123') {
        localStorage.setItem('adminAuthenticated', 'true')
        router.push('/admin/dashboard')
      } else {
        setError('Invalid credentials. Please try again.')
        setIsLoading(false)
      }
    }, 1000)
  }

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmZmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMyI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMzAiLz48L2c+PC9nPjwvc3ZnPg==')] opacity-20"></div>
      </div>
      
      {/* Floating 3D Elements */}
      <div className="absolute top-20 left-20 w-32 h-32 bg-gradient-to-r from-blue-400 to-purple-500 rounded-full opacity-20 animate-float blur-xl"></div>
      <div className="absolute top-40 right-32 w-24 h-24 bg-gradient-to-r from-pink-400 to-red-500 rounded-full opacity-30 animate-float-delayed blur-lg"></div>
      <div className="absolute bottom-32 left-1/4 w-40 h-40 bg-gradient-to-r from-green-400 to-blue-500 rounded-full opacity-15 animate-float-slow blur-2xl"></div>
      <div className="absolute bottom-20 right-20 w-28 h-28 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full opacity-25 animate-bounce blur-lg"></div>

      {/* Main Content */}
      <div className="relative z-10 flex items-center justify-center min-h-screen p-6">
        <div className="w-full max-w-md">
          {/* Logo/Header Section */}
          <div className="text-center mb-8 animate-fade-in-down">
            <div className="relative">
              <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full blur-lg opacity-30 animate-pulse"></div>
              <div className="relative bg-glass backdrop-blur-xl rounded-full p-6 border border-white/20 shadow-2xl">
                <div className="text-6xl mb-2 animate-bounce">🎓</div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mt-6 mb-2 tracking-wide">
              EAVI Admin
            </h1>
            <p className="text-blue-200 text-lg font-light">
              East Africa Vision Institute
            </p>
            <div className="mt-2 h-1 w-24 mx-auto bg-gradient-to-r from-blue-400 to-purple-500 rounded-full"></div>
          </div>

          {/* Glass Login Card */}
          <div className="glass-card backdrop-blur-xl bg-white/10 rounded-3xl p-8 border border-white/20 shadow-2xl transform hover:scale-105 transition-all duration-300 animate-fade-in-up">
            {/* Card Header */}
            <div className="text-center mb-8">
              <h2 className="text-2xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-blue-200">Sign in to your admin dashboard</p>
            </div>

            {/* Login Form */}
            <form onSubmit={handleLogin} className="space-y-6">
              {error && (
                <div className="glass-error backdrop-blur-sm bg-red-500/20 border border-red-400/30 text-red-100 px-4 py-3 rounded-2xl text-center animate-shake">
                  <div className="flex items-center justify-center">
                    <span className="text-xl mr-2">⚠️</span>
                    {error}
                  </div>
                </div>
              )}

              {/* Username Field */}
              <div className="space-y-2">
                <label className="text-white font-medium flex items-center">
                  <span className="mr-2">👤</span>
                  Username
                </label>
                <div className="relative group">
                  <input
                    type="text"
                    value={credentials.username}
                    onChange={(e) => setCredentials({ ...credentials, username: e.target.value })}
                    className="w-full px-4 py-4 bg-glass backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 focus:outline-none transition-all duration-300 group-hover:border-white/40"
                    placeholder="Enter your username"
                    required
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-600/10 to-purple-600/10 -z-10 blur group-focus-within:blur-md transition-all duration-300"></div>
                </div>
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <label className="text-white font-medium flex items-center">
                  <span className="mr-2">🔒</span>
                  Password
                </label>
                <div className="relative group">
                  <input
                    type="password"
                    value={credentials.password}
                    onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                    className="w-full px-4 py-4 bg-glass backdrop-blur-sm border border-white/30 rounded-2xl text-white placeholder-blue-200 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/50 focus:outline-none transition-all duration-300 group-hover:border-white/40"
                    placeholder="Enter your password"
                    required
                  />
                  <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-purple-600/10 to-pink-600/10 -z-10 blur group-focus-within:blur-md transition-all duration-300"></div>
                </div>
              </div>

              {/* Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full relative group"
              >
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-2xl blur opacity-60 group-hover:opacity-80 transition-opacity duration-300"></div>
                <div className="relative px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl text-white font-bold text-lg transform group-hover:scale-105 transition-all duration-300 group-active:scale-95">
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white mr-3"></div>
                      Signing In...
                    </div>
                  ) : (
                    <div className="flex items-center justify-center">
                      <span className="mr-2">🚀</span>
                      Sign In to Dashboard
                    </div>
                  )}
                </div>
              </button>
            </form>

            {/* Footer Links */}
            <div className="mt-8 text-center space-y-4">
              <div className="h-px bg-gradient-to-r from-transparent via-white/30 to-transparent"></div>
              <Link
                href="/"
                className="inline-flex items-center text-blue-200 hover:text-white transition-colors duration-300 group"
              >
                <span className="mr-2 group-hover:animate-bounce">🌐</span>
                Back to Application Form
              </Link>
            </div>
          </div>

          {/* Demo Credentials */}
          <div className="mt-6 text-center animate-fade-in">
            <div className="glass-info backdrop-blur-sm bg-blue-500/20 border border-blue-400/30 text-blue-100 px-4 py-3 rounded-2xl">
              <div className="flex items-center justify-center mb-2">
                <span className="text-lg mr-2">💡</span>
                <span className="font-semibold">Demo Credentials</span>
              </div>
              <div className="text-sm space-y-1">
                <div><strong>Username:</strong> admin</div>
                <div><strong>Password:</strong> admin123</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .glass-card {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }
        
        .bg-glass {
          background: rgba(255, 255, 255, 0.1);
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
        }
        
        .glass-error {
          animation: shake 0.5s ease-in-out;
        }
        
        .glass-info {
          backdrop-filter: blur(10px);
          -webkit-backdrop-filter: blur(10px);
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
        
        @keyframes fade-in-down {
          0% { opacity: 0; transform: translateY(-30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in-up {
          0% { opacity: 0; transform: translateY(30px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        
        @keyframes fade-in {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }
        
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-5px); }
          75% { transform: translateX(5px); }
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
        
        .animate-fade-in-down {
          animation: fade-in-down 0.8s ease-out;
        }
        
        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out 0.2s both;
        }
        
        .animate-fade-in {
          animation: fade-in 0.8s ease-out 0.4s both;
        }
        
        .animate-shake {
          animation: shake 0.5s ease-in-out;
        }
      `}</style>
    </div>
  )
}