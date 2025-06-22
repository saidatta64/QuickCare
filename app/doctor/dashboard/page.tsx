'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Header } from '@/components/layout/Header'
import { CalendarHeatmap } from '@/components/calendar/CalendarHeatmap'
import { AppointmentsList } from '@/components/doctor/AppointmentsList'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { getDailyQuote } from '@/lib/utils'
import { Quote } from 'lucide-react'

interface Appointment {
  id: string
  patient_id: string
  patient_name: string
  patient_age: number
  patient_gender: string
  patient_phone: string
  appointment_date: string
  time_slot: string
  status: string
  queue_position: number
  notes: string
}

export default function DoctorDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [appointmentData, setAppointmentData] = useState<{ [key: string]: number }>({})

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'doctor') {
      router.push('/auth/signin')
      return
    }

    fetchAppointments()
  }, [session, status, router])

  const fetchAppointments = async () => {
    try {
      const response = await fetch('/api/appointments')
      if (response.ok) {
        const data = await response.json()
        setAppointments(data)
        
        // Process data for heatmap
        const dateCount: { [key: string]: number } = {}
        data.forEach((apt: Appointment) => {
          const dateKey = format(new Date(apt.appointment_date), 'yyyy-MM-dd')
          dateCount[dateKey] = (dateCount[dateKey] || 0) + 1
        })
        setAppointmentData(dateCount)
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (appointmentId: string, status: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      })

      if (response.ok) {
        // Update local state
        setAppointments(prev =>
          prev.map(apt =>
            apt.id === appointmentId ? { ...apt, status } : apt
          )
        )
      }
    } catch (error) {
      console.error('Error updating appointment:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session || session.user.role !== 'doctor') {
    return null
  }

  const dailyQuote = getDailyQuote()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Info Bar */}
        <div className="mb-8 bg-gradient-to-r from-primary-600 to-secondary-600 rounded-lg p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold mb-2">
                Welcome, Dr. {session.user.name}
              </h2>
              <p className="text-primary-100">
                {format(new Date(), 'EEEE, MMMM do, yyyy')}
              </p>
            </div>
            <Quote className="w-8 h-8 text-primary-200" />
          </div>
          <div className="mt-4 p-4 bg-white/10 rounded-lg">
            <p className="text-sm italic">"{dailyQuote}"</p>
          </div>
        </div>

        {/* Dashboard Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Calendar Heatmap */}
          <div>
            <CalendarHeatmap
              appointmentData={appointmentData}
              onDateClick={setSelectedDate}
              selectedDate={selectedDate}
            />
          </div>

          {/* Appointments List */}
          <div>
            <AppointmentsList
              appointments={appointments}
              selectedDate={selectedDate}
              onStatusUpdate={handleStatusUpdate}
            />
          </div>
        </div>

        {/* Statistics */}
        <div className="mt-8 grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Appointments</h3>
            <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
              {appointments.length}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</h3>
            <p className="text-3xl font-bold text-success-600 dark:text-success-400 mt-2">
              {appointments.filter(apt => apt.status === 'completed').length}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Scheduled</h3>
            <p className="text-3xl font-bold text-primary-600 dark:text-primary-400 mt-2">
              {appointments.filter(apt => apt.status === 'scheduled').length}
            </p>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">No Shows</h3>
            <p className="text-3xl font-bold text-error-600 dark:text-error-400 mt-2">
              {appointments.filter(apt => apt.status === 'no_show').length}
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}