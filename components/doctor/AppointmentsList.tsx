'use client'

import { useState } from 'react'
import { format } from 'date-fns'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { Clock, User, Phone, FileText } from 'lucide-react'
import { formatTime } from '@/lib/utils'

interface Appointment {
  id: string
  patient_name: string  // This comes directly from appointments table
  patient_age: number
  patient_gender: string
  patient_phone: string
  patient_id: string
  appointment_date: string
  time_slot: string
  status: string
  queue_position: number
  notes: string
}

interface AppointmentsListProps {
  appointments: Appointment[]
  selectedDate: Date | null
  onStatusUpdate: (appointmentId: string, status: string) => void
}

export function AppointmentsList({
  appointments,
  selectedDate,
  onStatusUpdate
}: AppointmentsListProps) {
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [pendingAction, setPendingAction] = useState<{ id: string; status: string } | null>(null)

  // Defensive: Ensure appointments is always an array
  const safeAppointments = Array.isArray(appointments) ? appointments : []

  const filteredAppointments = selectedDate
    ? safeAppointments.filter(apt => 
        apt &&
        apt.appointment_date &&
        format(new Date(apt.appointment_date), 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd')
      )
    : safeAppointments

  const handleStatusChange = (appointmentId: string, status: string) => {
    setPendingAction({ id: appointmentId, status })
    setShowConfirmModal(true)
  }

  const confirmStatusChange = () => {
    if (pendingAction) {
      onStatusUpdate(pendingAction.id, pendingAction.status)
      setPendingAction(null)
    }
    setShowConfirmModal(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success-100 text-success-800 dark:bg-success-900 dark:text-success-200'
      case 'no_show':
        return 'bg-error-100 text-error-800 dark:bg-error-900 dark:text-error-200'
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
      default:
        return 'bg-primary-100 text-primary-800 dark:bg-primary-900 dark:text-primary-200'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {selectedDate 
            ? `Appointments for ${format(selectedDate, 'MMM d, yyyy')}`
            : 'All Appointments'
          }
        </h3>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {filteredAppointments.length} appointments
        </span>
      </div>

      <div className="space-y-3 max-h-96 overflow-y-auto">
        {filteredAppointments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <p className="text-gray-500 dark:text-gray-400">
                No appointments {selectedDate ? 'for this date' : 'found'}
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredAppointments.map((appointment) => (
            <Card key={appointment?.id || Math.random()} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium text-gray-900 dark:text-white">
                        {appointment?.patient_name || 'Unknown'}
                      </span>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(appointment?.status || '')}`}>
                      {(appointment?.status || '').replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    Queue #{appointment?.queue_position ?? '-'}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4" />
                    <span>{appointment?.time_slot ? formatTime(appointment.time_slot) : '-'}</span>
                  </div>
                  <div className="flex items-center space-x-20 ">
                    <span className='capitalize'>
                      Age: {appointment?.patient_age ?? '-'}, {appointment?.patient_gender ?? '-'}
                    </span>
                    <span className='text-gray-600 dark:text-gray-300'>
                      {appointment?.appointment_date
                        ? format(new Date(appointment.appointment_date), 'MMM d, yyyy')
                        : '-'}
                    </span>
                  </div>
                  {appointment?.patient_phone && (
                    <div className="flex items-center space-x-2">
                      <Phone className="w-4 h-4" />
                      <span>{appointment.patient_phone}</span>
                    </div>
                  )}
                </div>

                {appointment?.notes && (
                  <div className="mb-3">
                    <div className="flex items-start space-x-2 text-sm">
                      <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                      <span className="text-gray-600 dark:text-gray-300">{appointment.notes}</span>
                    </div>
                  </div>
                )}

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => handleStatusChange(appointment.id, 'completed')}
                    disabled={appointment.status !== 'scheduled'}
                  >
                    Complete
                  </Button>
                  <Button
                    size="sm"
                    variant="danger"
                    onClick={() => handleStatusChange(appointment.id, 'no_show')}
                    disabled={appointment.status !== 'scheduled'}
                  >
                    No Show
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleStatusChange(appointment.id, 'scheduled')}
                    disabled={appointment.status === 'scheduled'}
                  >
                    Reset
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setSelectedAppointment(appointment)}
                  >
                    Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Appointment Details Modal */}
      <Modal
        isOpen={!!selectedAppointment}
        onClose={() => setSelectedAppointment(null)}
        title="Appointment Details"
      >
        {selectedAppointment && (
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Patient Information</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Name:</span> {selectedAppointment.patient_name}</p>
                <p><span className="font-medium">Age:</span> {selectedAppointment.patient_age}</p>
                <p><span className="font-medium">Gender:</span> {selectedAppointment.patient_gender}</p>
                {selectedAppointment.patient_phone && (
                  <p><span className="font-medium">Phone:</span> {selectedAppointment.patient_phone}</p>
                )}
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Appointment Details</h4>
              <div className="space-y-2 text-sm">
                <p><span className="font-medium">Date:</span> {format(new Date(selectedAppointment.appointment_date), 'MMM d, yyyy')}</p>
                <p><span className="font-medium">Time:</span> {formatTime(selectedAppointment.time_slot)}</p>
                <p><span className="font-medium">Status:</span> {selectedAppointment.status.replace('_', ' ').toUpperCase()}</p>
                <p><span className="font-medium">Queue Position:</span> #{selectedAppointment.queue_position}</p>
              </div>
            </div>

            {selectedAppointment.notes && (
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Notes</h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">{selectedAppointment.notes}</p>
              </div>
            )}
          </div>
        )}
      </Modal>

      {/* Confirmation Modal */}
      <Modal
        isOpen={showConfirmModal}
        onClose={() => setShowConfirmModal(false)}
        title="Confirm Action"
        footer={
          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={() => setShowConfirmModal(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={confirmStatusChange}
            >
              Confirm
            </Button>
          </div>
        }
      >
        <p className="text-gray-600 dark:text-gray-300">
          Are you sure you want to change the appointment status to{' '}
          <span className="font-medium">
            {pendingAction?.status.replace('_', ' ').toUpperCase()}
          </span>
          ?
        </p>
      </Modal>
    </div>
  )
}