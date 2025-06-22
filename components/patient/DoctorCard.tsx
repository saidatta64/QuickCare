'use client'

import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Star, MapPin, Phone, Clock, Calendar, User } from 'lucide-react'
import { timeSlots } from '@/lib/utils'

interface Doctor {
  id: string
  name: string
  specialization: string
  experience: number
  city: string
  address: string
  phone: string
  bio: string
  consultation_fee: number
  rating: number
  reviewCount: number
  availableSlots: string[]
}

interface DoctorCardProps {
  doctor: Doctor
  onBookAppointment: (doctorId: string) => void
}

export function DoctorCard({ doctor, onBookAppointment }: DoctorCardProps) {
  const [expanded, setExpanded] = useState(false)

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`w-4 h-4 ${
          i < rating 
            ? 'text-yellow-400 fill-current' 
            : 'text-gray-300 dark:text-gray-600'
        }`}
      />
    ))
  }

  return (
    <Card className="hover:shadow-lg transition-all duration-200">
      <CardContent className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
              {doctor.name}
            </h3>
            <p className="text-primary-600 dark:text-primary-400 font-medium mb-2">
              {doctor.specialization} • {doctor.experience} years exp.
            </p>
            
            <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-300 mb-3">
              <div className="flex items-center space-x-1">
                {renderStars(Math.floor(doctor.rating))}
                <span className="ml-1">
                  {doctor.rating.toFixed(1)} ({doctor.reviewCount} reviews)
                </span>
              </div>
            </div>
          </div>
          
          <div className="text-right">
            <p className="text-2xl font-bold text-primary-600 dark:text-primary-400">
              ₹{doctor.consultation_fee}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400">consultation</p>
          </div>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <MapPin className="w-4 h-4" />
            <span>{doctor.city}</span>
          </div>
          
          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
            <Phone className="w-4 h-4" />
            <span>{doctor.phone}</span>
          </div>
        </div>

        {expanded && (
          <div className="space-y-3 mb-4">
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">About</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{doctor.bio}</p>
            </div>
            
            <div>
              <h4 className="font-medium text-gray-900 dark:text-white mb-2">Address</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">{doctor.address}</p>
            </div>
          </div>
        )}

        <div className="mb-4">
          <h4 className="font-medium text-gray-900 dark:text-white mb-2 flex items-center">
            <Clock className="w-4 h-4 mr-2" />
            Available Time Slots
          </h4>
          <div className="grid grid-cols-2 gap-2">
            {doctor.availableSlots.length > 0 ? (
              doctor.availableSlots.map((slot) => {
                const timeSlot = timeSlots.find(t => t.value === slot)
                return (
                  <div
                    key={slot}
                    className="px-3 py-2 bg-primary-50 dark:bg-primary-900 text-primary-700 dark:text-primary-300 rounded-lg text-sm text-center"
                  >
                    {timeSlot?.label || slot}
                  </div>
                )
              })
            ) : (
              <div className="col-span-2 text-center py-4 text-gray-500 dark:text-gray-400 text-sm">
                No available slots today. Please contact the doctor directly.
              </div>
            )}
          </div>
        </div>

        <div className="flex space-x-3">
          <Button
            variant="primary"
            className="flex-1"
            onClick={() => onBookAppointment(doctor.id)}
            disabled={doctor.availableSlots.length === 0}
          >
            <div className='flex items-center justify-center'>
              <Calendar className="w-5 h-5 mr-2" />
              Book Appointment
            </div>
            
          </Button>
          <Button
            variant="outline"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? 'Less' : 'More'} Info
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}