// Updated Patient Dashboard to improve Header layout and resolve prop type errors
'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { DoctorCard } from '@/components/patient/DoctorCard'
import { BookingModal } from '@/components/patient/BookingModal'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { specializations } from '@/lib/utils'
import { Search, Filter, MapPin, User, Calendar } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'

const FloatingChatButton = dynamic(
  () => import('@/components/assistant/FloatingChatButton'),
  { ssr: false }
)

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

export default function PatientDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [filteredDoctors, setFilteredDoctors] = useState<Doctor[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [selectedSpecialization, setSelectedSpecialization] = useState('')
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [bookingLoading, setBookingLoading] = useState(false)

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
    fetchDoctors()
  }, [session, status, router])

  useEffect(() => {
    filterDoctors()
  }, [doctors, searchQuery, selectedCity, selectedSpecialization])

  const fetchDoctors = async () => {
    try {
      const response = await fetch('/api/doctors')
      if (response.ok) {
        const data = await response.json()
        setDoctors(data)
        setFilteredDoctors(data)
      }
    } catch (error) {
      console.error('Error fetching doctors:', error)
    } finally {
      setLoading(false)
    }
  }

  const filterDoctors = () => {
    let filtered = doctors
    if (searchQuery) {
      filtered = filtered.filter(doctor =>
        doctor.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.specialization.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doctor.bio.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }
    if (selectedCity) {
      filtered = filtered.filter(doctor =>
        doctor.city.toLowerCase().includes(selectedCity.toLowerCase())
      )
    }
    if (selectedSpecialization) {
      filtered = filtered.filter(doctor =>
        doctor.specialization === selectedSpecialization
      )
    }
    setFilteredDoctors(filtered)
  }

  const handleBookAppointment = (doctorId: string) => {
    const doctor = doctors.find(d => d.id === doctorId)
    if (doctor) {
      setSelectedDoctor(doctor)
    }
  }

  const handleBooking = async (bookingData: any) => {
    setBookingLoading(true)
    try {
      const response = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          doctorId: selectedDoctor?.id,
          ...bookingData,
        }),
      })

      if (response.ok) {
        await fetchDoctors()
        alert('Appointment booked successfully!')
      } else {
        const error = await response.json()
        alert(error.error || 'Failed to book appointment')
      }
    } catch (error) {
      console.error('Error booking appointment:', error)
      alert('Failed to book appointment')
    } finally {
      setBookingLoading(false)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session || session.user.role !== 'patient') return null

  const cities = [...new Set(doctors.map(d => d.city))].sort()

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-6">
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-1">
            Find Your Doctor
          </h1>
          <p className="text-gray-600 dark:text-gray-400 text-sm sm:text-base">
            Book appointments with experienced healthcare professionals
          </p>
        </div>

        <div className="mb-8 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <Input
                placeholder="Search doctors by name or specialization..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-full"
              />
            </div>
            <Button
              variant="outline"
              className="w-full md:w-auto"
              onClick={() => {
                setSearchQuery('')
                setSelectedCity('')
                setSelectedSpecialization('')
              }}
            >
              Clear Filters
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <MapPin className="inline w-4 h-4 mr-1" />
                City
              </label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Cities</option>
                {cities.map(city => (
                  <option key={city} value={city}>{city}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Filter className="inline w-4 h-4 mr-1" />
                Specialization
              </label>
              <select
                value={selectedSpecialization}
                onChange={(e) => setSelectedSpecialization(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">All Specializations</option>
                {specializations.map(spec => (
                  <option key={spec} value={spec}>{spec}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="mb-4">
          <p className="text-gray-600 dark:text-gray-400">
            {filteredDoctors.length} doctor{filteredDoctors.length !== 1 ? 's' : ''} found
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredDoctors.map(doctor => (
            <DoctorCard
              key={doctor.id}
              doctor={doctor}
              onBookAppointment={handleBookAppointment}
            />
          ))}
        </div>

        {filteredDoctors.length === 0 && !loading && (
          <div className="text-center py-12">
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              No doctors found matching your criteria.
            </p>
          </div>
        )}
      </main>

      <BookingModal
        isOpen={!!selectedDoctor}
        onClose={() => setSelectedDoctor(null)}
        doctor={selectedDoctor}
        availableSlots={selectedDoctor?.availableSlots || []}
        onBook={handleBooking}
        loading={bookingLoading}
      />

      <FloatingChatButton />
    </div>
  )
}
