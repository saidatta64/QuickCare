'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { timeSlots, isSlotAvailable } from '@/lib/utils'
import { format, addDays } from 'date-fns'

interface BookingFormData {
  patientName: string
  age: number
  gender: string
  phone: string
  notes: string
  appointmentDate: string
  timeSlot: string
}

interface BookingModalProps {
  isOpen: boolean
  onClose: () => void
  doctor: {
    id: string
    name: string
    specialization: string
    consultation_fee: number
  } | null
  availableSlots: string[]
  onBook: (data: BookingFormData) => Promise<void>
  loading: boolean
}

export function BookingModal({
  isOpen,
  onClose,
  doctor,
  availableSlots,
  onBook,
  loading
}: BookingModalProps) {
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedSlot, setSelectedSlot] = useState('')
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<BookingFormData>()

  const handleClose = () => {
    reset()
    setSelectedDate('')
    setSelectedSlot('')
    onClose()
  }

  const onSubmit = async (data: BookingFormData) => {
    if (!selectedDate || !selectedSlot) {
      console.error('Missing required fields:', { selectedDate, selectedSlot });
      return;
    }

    try {
      await onBook({
        ...data,
        appointmentDate: selectedDate,
        timeSlot: selectedSlot
      });
      handleClose();
    } catch (error) {
      console.error('Error in onSubmit:', error);
      // You might want to show an error message to the user here
    }
  }

  // Generate next 7 days
  const availableDates = Array.from({ length: 7 }, (_, i) => {
    const date = addDays(new Date(), i + 1)
    return {
      value: format(date, 'yyyy-MM-dd'),
      label: format(date, 'MMM d, yyyy'),
      date
    }
  })

  const getAvailableSlots = () => {
    if (!selectedDate) return [];
    
    const date = new Date(selectedDate);
    const today = new Date();
    
    // For all dates, return all time slots that are in availableSlots
    // The actual availability will be checked on the server side
    return timeSlots.filter(slot => {
      // Only include slots that are in the availableSlots array
      const isAvailable = availableSlots.includes(slot.value);
      
      // If it's today, also check if the slot is in the future
      if (date.toDateString() === today.toDateString()) {
        return isAvailable && isSlotAvailable(date, slot.value);
      }
      
      return isAvailable;
    });
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={`Book Appointment with Dr. ${doctor?.name || ''}`}
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Full Name"
            {...register('patientName', { required: 'Name is required' })}
            error={errors.patientName?.message}
          />
          <Input
            label="Age"
            type="number"
            {...register('age', { 
              required: 'Age is required',
              min: { value: 1, message: 'Age must be at least 1' },
              max: { value: 120, message: 'Age must be less than 120' }
            })}
            error={errors.age?.message}
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Gender
            </label>
            <select
              {...register('gender', { required: 'Gender is required' })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
            {errors.gender && (
              <p className="text-sm text-error-600 dark:text-error-400 mt-1">
                {errors.gender.message}
              </p>
            )}
          </div>
          
          <Input
            label="Phone Number"
            type="tel"
            {...register('phone')}
            placeholder="Optional"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Appointment Date
          </label>
          <div className="grid grid-cols-2 gap-2">
            {availableDates.map((date) => (
              <button
                key={date.value}
                type="button"
                onClick={() => setSelectedDate(date.value)}
                className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                  selectedDate === date.value
                    ? 'bg-primary-600 text-white border-primary-600'
                    : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-primary-900'
                }`}
              >
                {date.label}
              </button>
            ))}
          </div>
        </div>

        {selectedDate && (
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Time Slot
            </label>
            <div className="grid grid-cols-2 gap-2">
              {getAvailableSlots().map((slot) => (
                <button
                  key={slot.value}
                  type="button"
                  onClick={() => setSelectedSlot(slot.value)}
                  className={`p-3 rounded-lg border text-sm font-medium transition-colors ${
                    selectedSlot === slot.value
                      ? 'bg-primary-600 text-white border-primary-600'
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-primary-50 dark:hover:bg-primary-900'
                  }`}
                >
                  {slot.label}
                </button>
              ))}
            </div>
            {getAvailableSlots().length === 0 && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                No available slots for this date
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Notes (Optional)
          </label>
          <textarea
            {...register('notes')}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
            placeholder="Any specific concerns or symptoms..."
          />
        </div>

        {doctor && (
          <div className="bg-primary-50 dark:bg-primary-900 p-4 rounded-lg">
            <div className="flex justify-between items-center">
              <div>
                <p className="font-medium text-primary-900 dark:text-primary-100">
                  Consultation Fee
                </p>
                <p className="text-sm text-primary-700 dark:text-primary-300">
                  {doctor.specialization}
                </p>
              </div>
              <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                ₹{doctor.consultation_fee}
              </p>
            </div>
          </div>
        )}

        <div className="flex space-x-3 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            className="flex-1"
            disabled={!selectedDate || !selectedSlot || loading}
            loading={loading}
          >
            Book Appointment
          </Button>
        </div>
      </form>
    </Modal>
  )
}