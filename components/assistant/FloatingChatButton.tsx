'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/Button'
import { MessageSquare, X, MessageCircle } from 'lucide-react'
import dynamic from 'next/dynamic'

const AppointmentAssistantChatbot = dynamic(
  () => import('./AppointmentAssistantChatbot'),
  {
    ssr: false,
    loading: () => (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-cyan-500"></div>
      </div>
    ),
  }
)

export default function FloatingChatButton() {
  const [isOpen, setIsOpen] = useState(false)
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (isOpen && !target.closest('.chat-container')) {
        setIsOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  if (!isMounted) return null

  return (
    <div className="fixed bottom-4 right-4 z-50 chat-container">
      {isOpen ? (
        <div className="w-[90vw] max-w-sm h-[80vh] sm:h-[600px] bg-white dark:bg-gray-800 rounded-xl shadow-2xl border border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden transition-all duration-300 transform origin-bottom-right">
          <div className="bg-cyan-600 dark:bg-cyan-700 text-white p-4 rounded-t-xl flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <MessageCircle className="h-5 w-5" />
              <h3 className="font-semibold text-base sm:text-lg">Appointment Assistant</h3>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="h-8 w-8 rounded-full hover:bg-cyan-500/20 hover:text-white"
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close chat</span>
            </Button>
          </div>
          <div className="flex-1 overflow-hidden">
            <AppointmentAssistantChatbot />
          </div>
        </div>
      ) : (
        <Button
          onClick={() => setIsOpen(true)}
          variant="primary"
          className="rounded-full w-20 h-20 sm:w-14 sm:h-14 p-0 flex items-center justify-center shadow-lg hover:shadow-xl transition-all hover:scale-105"
          aria-label="Open chat"
        >
          <MessageSquare className="w-10 h-10 sm:w-6 sm:h-6" />
        </Button>
      )}
    </div>
  )
}
