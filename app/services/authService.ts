import { supabase } from '../lib/supabase'
import { logger } from '../utils/logger'

export interface AuthUser {
  id: string
  email: string
  full_name: string
  role: string
  last_login?: string
}

// Fixed admin accounts
const FIXED_ADMINS = {
  'admin@eavi.edu': { password: 'admin123', full_name: 'System Administrator', role: 'super_admin' },
  'admissions@eavi.edu': { password: 'admin123', full_name: 'Admissions Officer', role: 'admin' },
  'registrar@eavi.edu': { password: 'admin123', full_name: 'Registrar', role: 'admin' },
  'director@eavi.edu': { password: 'admin123', full_name: 'Academic Director', role: 'admin' }
}

export class AuthService {
  // Sign in with fixed admin accounts
  static async signIn(email: string, password: string): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      logger.info('Attempting admin sign in', { email }, 'AuthService.signIn')
      
      const trimmedEmail = email.trim().toLowerCase()
      const adminAccount = FIXED_ADMINS[trimmedEmail as keyof typeof FIXED_ADMINS]
      
      if (!adminAccount) {
        logger.error('Invalid admin email', { email: trimmedEmail }, 'AuthService.signIn')
        return { user: null, error: 'Invalid admin credentials' }
      }
      
      if (adminAccount.password !== password) {
        logger.error('Invalid password', { email: trimmedEmail }, 'AuthService.signIn')
        return { user: null, error: 'Invalid admin credentials' }
      }
      
      // Update last login time in database
      try {
        await supabase
          .from('admin_users')
          .update({ last_login: new Date().toISOString() })
          .eq('email', trimmedEmail)
      } catch (dbError) {
        console.warn('Could not update last login time:', dbError)
      }
      
      const authUser: AuthUser = {
        id: `admin_${trimmedEmail.replace('@', '_').replace('.', '_')}`,
        email: trimmedEmail,
        full_name: adminAccount.full_name,
        role: adminAccount.role,
        last_login: new Date().toISOString()
      }
      
      // Store in localStorage for session management
      if (typeof window !== 'undefined') {
        localStorage.setItem('eavi_admin_user', JSON.stringify(authUser))
        localStorage.setItem('eavi_admin_session', new Date().getTime().toString())
      }

      logger.info('Admin sign in successful', { email: authUser.email, role: authUser.role }, 'AuthService.signIn')
      return { user: authUser, error: null }

    } catch (error) {
      logger.error('Unexpected authentication error', error, 'AuthService.signIn')
      return { user: null, error: 'An unexpected error occurred during sign in' }
    }
  }

  // Sign out
  static async signOut(): Promise<{ error: string | null }> {
    try {
      logger.info('Attempting admin sign out', {}, 'AuthService.signOut')
      
      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('eavi_admin_user')
        localStorage.removeItem('eavi_admin_session')
      }

      logger.info('Admin sign out successful', {}, 'AuthService.signOut')
      return { error: null }

    } catch (error) {
      logger.error('Unexpected sign out error', error, 'AuthService.signOut')
      return { error: 'An unexpected error occurred during sign out' }
    }
  }

  // Get current user from localStorage
  static async getCurrentUser(): Promise<{ user: AuthUser | null; error: string | null }> {
    try {
      if (typeof window === 'undefined') {
        return { user: null, error: null }
      }
      
      const storedUser = localStorage.getItem('eavi_admin_user')
      const storedSession = localStorage.getItem('eavi_admin_session')
      
      if (!storedUser || !storedSession) {
        return { user: null, error: null }
      }
      
      // Check session timeout (24 hours)
      const sessionTime = parseInt(storedSession)
      const now = new Date().getTime()
      const twentyFourHours = 24 * 60 * 60 * 1000
      
      if (now - sessionTime > twentyFourHours) {
        // Session expired
        localStorage.removeItem('eavi_admin_user')
        localStorage.removeItem('eavi_admin_session')
        return { user: null, error: 'Session expired' }
      }
      
      const authUser: AuthUser = JSON.parse(storedUser)
      return { user: authUser, error: null }

    } catch (error) {
      logger.error('Unexpected error getting current user', error, 'AuthService.getCurrentUser')
      return { user: null, error: 'An unexpected error occurred' }
    }
  }

  // Check if session is valid
  static async hasValidSession(): Promise<boolean> {
    try {
      const { user } = await this.getCurrentUser()
      return !!user
    } catch (error) {
      return false
    }
  }

  // Check if user is authenticated
  static async isAuthenticated(): Promise<boolean> {
    try {
      return await this.hasValidSession()
    } catch (error) {
      logger.error('Error checking authentication status', error, 'AuthService.isAuthenticated')
      return false
    }
  }

  // Get list of available admin accounts (for display)
  static getAvailableAdmins(): Array<{email: string, name: string, role: string}> {
    return Object.entries(FIXED_ADMINS).map(([email, data]) => ({
      email,
      name: data.full_name,
      role: data.role
    }))
  }
}