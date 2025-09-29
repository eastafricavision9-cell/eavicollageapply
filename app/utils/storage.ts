// Storage utility with performance optimizations and error handling

class StorageManager {
  private cache: Map<string, any> = new Map()
  private batchQueue: Map<string, any> = new Map()
  private batchTimer: NodeJS.Timeout | null = null
  private readonly BATCH_DELAY = 100 // ms

  // Get item from localStorage with caching
  get<T>(key: string, defaultValue: T): T {
    // Return from cache if available
    if (this.cache.has(key)) {
      return this.cache.get(key)
    }

    try {
      const item = localStorage.getItem(key)
      if (item === null) {
        this.cache.set(key, defaultValue)
        return defaultValue
      }

      const parsed = JSON.parse(item)
      this.cache.set(key, parsed)
      return parsed
    } catch (error) {
      console.error(`Error reading from localStorage key "${key}":`, error)
      this.cache.set(key, defaultValue)
      return defaultValue
    }
  }

  // Set item to localStorage with batching
  set<T>(key: string, value: T): void {
    // Update cache immediately for instant access
    this.cache.set(key, value)
    
    // Queue for batched localStorage write
    this.batchQueue.set(key, value)
    
    // Clear existing timer and set new one
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
    }

    this.batchTimer = setTimeout(() => {
      this.flush()
    }, this.BATCH_DELAY)
  }

  // Force immediate write of batched items
  flush(): void {
    if (this.batchQueue.size === 0) return

    try {
      this.batchQueue.forEach((value, key) => {
        localStorage.setItem(key, JSON.stringify(value))
      })
    } catch (error) {
      console.error('Error writing to localStorage:', error)
      
      // Try to clear some space and retry once
      if (error.name === 'QuotaExceededError') {
        this.cleanup()
        try {
          this.batchQueue.forEach((value, key) => {
            localStorage.setItem(key, JSON.stringify(value))
          })
        } catch (retryError) {
          console.error('Retry failed:', retryError)
        }
      }
    } finally {
      this.batchQueue.clear()
      if (this.batchTimer) {
        clearTimeout(this.batchTimer)
        this.batchTimer = null
      }
    }
  }

  // Remove item from localStorage and cache
  remove(key: string): void {
    this.cache.delete(key)
    try {
      localStorage.removeItem(key)
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }

  // Clear all cached data and localStorage
  clear(): void {
    this.cache.clear()
    this.batchQueue.clear()
    if (this.batchTimer) {
      clearTimeout(this.batchTimer)
      this.batchTimer = null
    }
    try {
      localStorage.clear()
    } catch (error) {
      console.error('Error clearing localStorage:', error)
    }
  }

  // Clean up old/unused items to free space
  private cleanup(): void {
    const keysToRemove = [
      // Add patterns for temporary or old data
      'temp_',
      'cache_',
      'old_'
    ]

    keysToRemove.forEach(pattern => {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(pattern)) {
          try {
            localStorage.removeItem(key)
          } catch (error) {
            console.error(`Error removing key ${key}:`, error)
          }
        }
      })
    })
  }

  // Get storage usage info
  getStorageInfo(): { used: number; available: number; percentage: number } {
    let used = 0
    try {
      for (let key in localStorage) {
        if (localStorage.hasOwnProperty(key)) {
          used += localStorage.getItem(key)?.length || 0
        }
      }
    } catch (error) {
      console.error('Error calculating storage usage:', error)
    }

    const available = 5 * 1024 * 1024 // Typical 5MB limit
    const percentage = Math.round((used / available) * 100)

    return { used, available, percentage }
  }
}

// Create singleton instance
export const storage = new StorageManager()

// Convenience functions for common operations
export const getStudents = () => storage.get('studentApplications', [])
export const setStudents = (students: any[]) => storage.set('studentApplications', students)

export const getCourses = () => storage.get('instituteCourses', [])
export const setCourses = (courses: any[]) => storage.set('instituteCourses', courses)

export const getReportingDate = () => storage.get('adminReportingDate', '')
export const setReportingDate = (date: string) => storage.set('adminReportingDate', date)

// Hook for React components
import { useState, useEffect } from 'react'

export function useStorage<T>(key: string, defaultValue: T) {
  const [value, setValue] = useState<T>(() => storage.get(key, defaultValue))

  const setStoredValue = (newValue: T) => {
    setValue(newValue)
    storage.set(key, newValue)
  }

  useEffect(() => {
    // Listen for storage changes from other tabs
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === key && e.newValue) {
        try {
          setValue(JSON.parse(e.newValue))
        } catch (error) {
          console.error('Error parsing storage change:', error)
        }
      }
    }

    window.addEventListener('storage', handleStorageChange)
    return () => window.removeEventListener('storage', handleStorageChange)
  }, [key])

  return [value, setStoredValue] as const
}