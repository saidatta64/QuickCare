export const dynamic = "force-dynamic";
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'
import { timeSlots, isSlotAvailable } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const city = searchParams.get('city')
    const specialization = searchParams.get('specialization')
    const search = searchParams.get('search')

    let query = supabaseAdmin
      .from('doctors')
      .select(`
        *,
        users (
          name,
          email
        )
      `)

    if (city) {
      query = query.ilike('city', `%${city}%`)
    }

    if (specialization) {
      query = query.eq('specialization', specialization)
    }

    if (search) {
      query = query.or(`users.name.ilike.%${search}%,bio.ilike.%${search}%`)
    }

    const { data: doctors, error } = await query

    if (error) {
      console.error('Error fetching doctors:', error)
      return NextResponse.json({ error: 'Failed to fetch doctors' }, { status: 500 })
    }

    // Get reviews and ratings for each doctor
    const doctorsWithRatings = await Promise.all(
      doctors.map(async (doctor) => {
        const { data: reviews } = await supabaseAdmin
          .from('reviews')
          .select('rating')
          .eq('doctor_id', doctor.id)

        const reviewCount = reviews?.length || 0
        const averageRating = reviewCount > 0 
          ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviewCount
          : 0

        // Get availability for today
        const today = new Date()
        const todayString = today.toISOString().split('T')[0]

        // Check doctor availability
        const { data: availability } = await supabaseAdmin
          .from('doctor_availability')
          .select('is_available')
          .eq('doctor_id', doctor.id)
          .eq('date', todayString)
          .single()

        const isAvailable = availability?.is_available !== false

        // For now, we'll return all time slots for the doctor's available days
        // The actual availability will be checked when booking
        const availableSlots = isAvailable 
          ? timeSlots.map(slot => slot.value)
          : []

        return {
          id: doctor.id,
          name: doctor.users.name,
          specialization: doctor.specialization,
          experience: doctor.experience,
          city: doctor.city,
          address: doctor.address,
          phone: doctor.phone,
          bio: doctor.bio,
          consultation_fee: doctor.consultation_fee,
          rating: Number(averageRating.toFixed(1)),
          reviewCount,
          availableSlots
        }
      })
    )

    return NextResponse.json(doctorsWithRatings)
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}