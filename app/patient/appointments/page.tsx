'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { format } from 'date-fns'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { formatTime } from '@/lib/utils'
import { Calendar, Clock, MapPin, Star, User, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'

interface Appointment {
  id: string
  appointment_date: string
  patient_name: string
  age: number
  time_slot: string
  status: string
  queue_position: number
  notes: string
  doctors: {
    users: { name: string }
    specialization: string
    city: string
    consultation_fee: number
  }
}

export default function PatientAppointments() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'upcoming' | 'history'>('upcoming')
  const [cancelModal, setCancelModal] = useState<string | null>(null)
  const [reviewModal, setReviewModal] = useState<Appointment | null>(null)
  const [rating, setRating] = useState(5)
  const [comment, setComment] = useState('')
  const [submittingReview, setSubmittingReview] = useState(false)

  useEffect(() => {
    if (status === 'loading') return
    
    if (!session) {
      router.push('/auth/signin')
      return
    }

    if (session.user.role !== 'patient') {
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
      }
    } catch (error) {
      console.error('Error fetching appointments:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCancelAppointment = async (appointmentId: string) => {
    try {
      const response = await fetch(`/api/appointments/${appointmentId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: 'cancelled' }),
      })

      if (response.ok) {
        setAppointments(prev =>
          prev.map(apt =>
            apt.id === appointmentId ? { ...apt, status: 'cancelled' } : apt
          )
        )
        setCancelModal(null)
      }
    } catch (error) {
      console.error('Error cancelling appointment:', error)
    }
  }

  const handleSubmitReview = async () => {
    if (!reviewModal) return

    setSubmittingReview(true)
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          appointmentId: reviewModal.id,
          rating,
          comment,
        }),
      })

      if (response.ok) {
        setReviewModal(null)
        setRating(5)
        setComment('')
        alert('Review submitted successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to submit review')
      }
    } catch (error) {
      console.error('Error submitting review:', error)
      alert('Failed to submit review')
    } finally {
      setSubmittingReview(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session || session.user.role !== 'patient') {
    return null
  }

  const now = new Date()
  const upcomingAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date)
    return apt.status === 'scheduled' && aptDate >= now
  })

  const pastAppointments = appointments.filter(apt => {
    const aptDate = new Date(apt.appointment_date)
    return apt.status !== 'scheduled' || aptDate < now
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      case 'no_show':
        return 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200'
      default:
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
    }
  }

  const renderStars = (currentRating: number, interactive = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-5 h-5 ${
          i < currentRating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300 dark:text-gray-600'
        } ${interactive ? 'cursor-pointer hover:text-yellow-400' : ''}`}
        onClick={interactive ? () => setRating(i + 1) : undefined}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pt-16 sm:pt-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            My Appointments
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your upcoming and past appointments
          </p>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('upcoming')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'upcoming'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                Upcoming ({upcomingAppointments.length})
              </button>
              <button
                onClick={() => setActiveTab('history')}
                className={`py-2 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'history'
                    ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
                }`}
              >
                History ({pastAppointments.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Appointments List */}
        <div className="space-y-4">
          {activeTab === 'upcoming' ? (
            upcomingAppointments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    No upcoming appointments
                  </p>
                  <Link href="/patient/dashboard">
                    <Button variant="primary" className="mt-4">
                      Book an Appointment
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              upcomingAppointments.map(appointment => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                          {appointment.doctors.users.name}
                        </h3>
                        <p className="text-primary-600 dark:text-primary-400 font-medium">
                          {appointment.doctors.specialization}
                        </p>
                      </div>
                      <div className="text-right">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                          {appointment.status.toUpperCase()}
                        </span>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                          Queue #{appointment.queue_position}
                        </p>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(appointment.appointment_date), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(appointment.time_slot)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4" />
                        <span>{appointment.doctors.city}</span>
                      </div>
                    </div>

                    {appointment.notes && (
                      <div className="mb-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          <strong>Notes:</strong> {appointment.notes}
                        </p>
                      </div>
                    )}

                    <div className="flex justify-between items-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        ₹{appointment.doctors.consultation_fee}
                      </p>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => setCancelModal(appointment.id)}
                      >
                        Cancel Appointment
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )
          ) : (
            pastAppointments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-12">
                  <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500 dark:text-gray-400 text-lg">
                    No appointment history
                  </p>
                </CardContent>
              </Card>
            ) : (
              pastAppointments.map(appointment => (
                <Card key={appointment.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                          {appointment.doctors.users.name}
                        </h3>
                        <p className="text-primary-600 dark:text-primary-400 font-medium">
                          {appointment.doctors.specialization}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(appointment.status)}`}>
                        {appointment.status.replace('_', ' ').toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                        <Calendar className="w-4 h-4" />
                        <span>{format(new Date(appointment.appointment_date), 'MMM d, yyyy')}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                        <Clock className="w-4 h-4" />
                        <span>{formatTime(appointment.time_slot)}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-gray-600 dark:text-gray-300">
                        <MapPin className="w-4 h-4" />
                        <span>{appointment.doctors.city}</span>
                      </div>
                    </div>

                    <div className="flex justify-between items-center">
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">
                        ₹{appointment.doctors.consultation_fee}
                      </p>
                      {appointment.status === 'completed' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setReviewModal(appointment)}
                        >
                          <Star className="w-4 h-4 mr-2" />
                          Rate Doctor
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            )
          )}
        </div>
      </main>

      {/* Cancel Confirmation Modal */}
      <Modal
        isOpen={!!cancelModal}
        onClose={() => setCancelModal(null)}
        title="Cancel Appointment"
        footer={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setCancelModal(null)}
            >
              Keep Appointment
            </Button>
            <Button
              variant="danger"
              onClick={() => cancelModal && handleCancelAppointment(cancelModal)}
            >
              Cancel Appointment
            </Button>
          </div>
        }
      >
        <p className="text-gray-600 dark:text-gray-300">
          Are you sure you want to cancel this appointment? This action cannot be undone.
        </p>
      </Modal>

      {/* Review Modal */}
      <Modal
        isOpen={!!reviewModal}
        onClose={() => {
          setReviewModal(null)
          setRating(5)
          setComment('')
        }}
        title="Rate Your Experience"
        footer={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => {
                setReviewModal(null)
                setRating(5)
                setComment('')
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleSubmitReview}
              loading={submittingReview}
            >
              Submit Review
            </Button>
          </div>
        }
      >
        {reviewModal && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                How was your experience with {reviewModal.doctors.users.name}?
              </h4>
              <div className="flex items-center space-x-1">
                {renderStars(rating, true)}
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Comments (Optional)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                placeholder="Share your experience..."
              />
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}