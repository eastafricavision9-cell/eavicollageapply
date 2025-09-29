'use client'

import React, { memo } from 'react'
import { PhoneIcon, SMSIcon, WhatsAppIcon, CheckIcon, XIcon, ViewIcon, DownloadIcon } from './Icons'

interface Student {
  id: string
  fullName: string
  admissionNumber: string
  email: string
  phone: string
  course: string
  status: 'Accepted' | 'Rejected' | 'Pending'
  kcseGrade?: string
}

interface StudentCardProps {
  student: Student
  onSetStatus: (id: string, status: 'Accepted' | 'Rejected' | 'Pending') => void
  onViewPDF: (student: Student) => void
  onDownloadPDF: (student: Student) => void
  onSendPDFToWhatsApp: (student: Student) => void
  onCall: (phone: string) => void
  onOpenSMS: (student: Student) => void
  onWhatsApp: (phone: string) => void
  pdfGenerating: string | null
}

const StudentCardComponent = ({
  student,
  onSetStatus,
  onViewPDF,
  onDownloadPDF,
  onSendPDFToWhatsApp,
  onCall,
  onOpenSMS,
  onWhatsApp,
  pdfGenerating
}: StudentCardProps) => {
  const isPDFGenerating = pdfGenerating === student.id

  const statusColorClass = 
    student.status === 'Accepted' ? 'bg-green-100 text-green-800' :
    student.status === 'Rejected' ? 'bg-red-100 text-red-800' :
    'bg-yellow-100 text-yellow-800'

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 truncate">{student.fullName}</h3>
          <p className="text-sm text-gray-500">{student.admissionNumber}</p>
          <p className="text-sm text-gray-600 mt-1">{student.course}</p>
          {student.kcseGrade && (
            <p className="text-sm text-purple-600 mt-1 font-medium">KCSE: {student.kcseGrade}</p>
          )}
        </div>
        <span className={`px-3 py-1 text-sm font-medium rounded-full ${statusColorClass}`}>
          {student.status}
        </span>
      </div>

      {/* Actions */}
      <div className="space-y-3">
        {/* Status Actions */}
        <div className="flex gap-2">
          <button
            onClick={() => onSetStatus(student.id, 'Accepted')}
            className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1"
          >
            <CheckIcon className="w-4 h-4" />
            <span>Approve</span>
          </button>
          <button
            onClick={() => onSetStatus(student.id, 'Rejected')}
            className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center space-x-1"
          >
            <XIcon className="w-4 h-4" />
            <span>Reject</span>
          </button>
        </div>

        {/* PDF Actions */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onViewPDF(student)}
            disabled={isPDFGenerating}
            className="bg-purple-600 hover:bg-purple-700 text-white px-2 py-2 rounded-md text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-1"
          >
            {isPDFGenerating ? (
              <span>...</span>
            ) : (
              <>
                <ViewIcon className="w-3 h-3" />
                <span>View</span>
              </>
            )}
          </button>
          <button
            onClick={() => onDownloadPDF(student)}
            disabled={isPDFGenerating}
            className="bg-indigo-600 hover:bg-indigo-700 text-white px-2 py-2 rounded-md text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-1"
          >
            {isPDFGenerating ? (
              <span>...</span>
            ) : (
              <>
                <DownloadIcon className="w-3 h-3" />
                <span>Download</span>
              </>
            )}
          </button>
          <button
            onClick={() => onSendPDFToWhatsApp(student)}
            disabled={isPDFGenerating}
            className="bg-green-600 hover:bg-green-700 text-white px-2 py-2 rounded-md text-xs font-medium disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center space-x-1"
            title="Send PDF to WhatsApp"
          >
            {isPDFGenerating ? (
              <span>...</span>
            ) : (
              <div className="flex items-center space-x-0.5">
                <ViewIcon className="w-3 h-3" />
                <WhatsAppIcon className="w-3 h-3" />
              </div>
            )}
          </button>
        </div>

        {/* Communication Actions */}
        <div className="grid grid-cols-3 gap-2">
          <button
            onClick={() => onCall(student.phone)}
            className="bg-blue-100 hover:bg-blue-200 text-blue-800 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
            title="Call Student"
          >
            <PhoneIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onOpenSMS(student)}
            className="bg-orange-100 hover:bg-orange-200 text-orange-800 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
            title="Send SMS"
          >
            <SMSIcon className="w-4 h-4" />
          </button>
          <button
            onClick={() => onWhatsApp(student.phone)}
            className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-2 rounded-md text-sm font-medium transition-colors flex items-center justify-center"
            title="WhatsApp"
          >
            <WhatsAppIcon className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}

// Memoize the component to prevent unnecessary re-renders
export const StudentCard = memo(StudentCardComponent, (prevProps, nextProps) => {
  // Only re-render if these specific props change
  return (
    prevProps.student.id === nextProps.student.id &&
    prevProps.student.status === nextProps.student.status &&
    prevProps.student.fullName === nextProps.student.fullName &&
    prevProps.student.kcseGrade === nextProps.student.kcseGrade &&
    prevProps.pdfGenerating === nextProps.pdfGenerating
  )
})