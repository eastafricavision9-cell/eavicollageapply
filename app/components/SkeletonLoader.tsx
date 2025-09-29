'use client'

interface SkeletonProps {
  className?: string
  width?: string
  height?: string
  rounded?: boolean
}

export function Skeleton({ className = "", width, height, rounded = false }: SkeletonProps) {
  const baseClasses = "animate-pulse bg-gray-200"
  const roundedClass = rounded ? "rounded-full" : "rounded"
  
  return (
    <div 
      className={`${baseClasses} ${roundedClass} ${className}`}
      style={{ width, height }}
    />
  )
}

export function StudentCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <Skeleton height="1.5rem" className="mb-2" width="70%" />
          <Skeleton height="1rem" className="mb-1" width="50%" />
          <Skeleton height="1rem" width="60%" />
        </div>
        <Skeleton height="1.5rem" width="4rem" rounded />
      </div>

      {/* Actions */}
      <div className="space-y-3">
        <div className="flex gap-2">
          <Skeleton height="2.5rem" className="flex-1" />
          <Skeleton height="2.5rem" className="flex-1" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Skeleton height="2.5rem" />
          <Skeleton height="2.5rem" />
          <Skeleton height="2.5rem" />
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Skeleton height="2.5rem" />
          <Skeleton height="2.5rem" />
          <Skeleton height="2.5rem" />
        </div>
      </div>
    </div>
  )
}

export function CourseCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4">
      <Skeleton height="1.25rem" className="mb-2" width="80%" />
      <div className="space-y-1">
        <Skeleton height="1rem" width="70%" />
        <Skeleton height="1rem" width="60%" />
      </div>
    </div>
  )
}

export function FormSkeleton() {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 border border-gray-200">
      <div className="text-center mb-8">
        <Skeleton height="5rem" width="5rem" rounded className="mx-auto mb-4" />
        <Skeleton height="2rem" width="70%" className="mx-auto mb-2" />
        <Skeleton height="1rem" width="50%" className="mx-auto" />
      </div>

      <div className="space-y-6">
        {Array.from({ length: 6 }, (_, i) => (
          <div key={i}>
            <Skeleton height="1rem" width="30%" className="mb-2" />
            <Skeleton height="3rem" />
          </div>
        ))}
        <Skeleton height="3.5rem" className="mt-8" />
      </div>
    </div>
  )
}