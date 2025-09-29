'use client'

import { ReactNode, useState } from 'react'

interface EnhancedButtonProps {
  children: ReactNode
  onClick?: () => void | Promise<void>
  disabled?: boolean
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  size?: 'sm' | 'md' | 'lg'
  className?: string
  type?: 'button' | 'submit' | 'reset'
  loading?: boolean
  loadingText?: string
}

export function EnhancedButton({
  children,
  onClick,
  disabled = false,
  variant = 'primary',
  size = 'md',
  className = '',
  type = 'button',
  loading: externalLoading = false,
  loadingText = 'Loading...'
}: EnhancedButtonProps) {
  const [internalLoading, setInternalLoading] = useState(false)
  const [clicked, setClicked] = useState(false)

  const isLoading = externalLoading || internalLoading
  const isDisabled = disabled || isLoading

  const handleClick = async () => {
    if (isDisabled || !onClick) return

    // Visual click feedback
    setClicked(true)
    setTimeout(() => setClicked(false), 150)

    try {
      setInternalLoading(true)
      await onClick()
    } catch (error) {
      console.error('Button click error:', error)
    } finally {
      setInternalLoading(false)
    }
  }

  // Base classes
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed'

  // Variant classes
  const variantClasses = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white focus:ring-blue-500 active:bg-blue-800',
    secondary: 'bg-gray-100 hover:bg-gray-200 text-gray-800 focus:ring-gray-500 active:bg-gray-300',
    danger: 'bg-red-600 hover:bg-red-700 text-white focus:ring-red-500 active:bg-red-800',
    success: 'bg-green-600 hover:bg-green-700 text-white focus:ring-green-500 active:bg-green-800',
    warning: 'bg-orange-600 hover:bg-orange-700 text-white focus:ring-orange-500 active:bg-orange-800'
  }

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-2 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  }

  // Click animation
  const clickClasses = clicked ? 'scale-95' : 'hover:scale-105'

  const combinedClasses = `${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${clickClasses} ${className}`

  return (
    <button
      type={type}
      onClick={handleClick}
      disabled={isDisabled}
      className={combinedClasses}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {isLoading ? loadingText : children}
    </button>
  )
}

// Quick action button for common use cases
export function QuickActionButton({ 
  icon, 
  label, 
  onClick, 
  variant = 'secondary', 
  disabled = false,
  className = '' 
}: {
  icon: string
  label: string
  onClick?: () => void | Promise<void>
  variant?: 'primary' | 'secondary' | 'danger' | 'success' | 'warning'
  disabled?: boolean
  className?: string
}) {
  return (
    <EnhancedButton
      variant={variant}
      size="sm"
      onClick={onClick}
      disabled={disabled}
      className={`space-x-1 ${className}`}
    >
      <span>{icon}</span>
      <span>{label}</span>
    </EnhancedButton>
  )
}