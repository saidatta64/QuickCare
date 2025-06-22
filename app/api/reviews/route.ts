import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user || session.user.role !== 'patient') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { appointmentId, rating, comment } = await request.json()

    if (!appointmentId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    // Get patient ID
    const { data: patient } = await supabaseAdmin
      .from('patients')
      .select('id')
      .eq('user_id', session.user.id)
      .single()

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }

    // Verify appointment belongs to patient and is completed
    const { data: appointment } = await supabaseAdmin
      .from('appointments')
      .select('doctor_id, patient_id, status')
      .eq('id', appointmentId)
      .single()

    if (!appointment || appointment.patient_id !== patient.id) {
      return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
    }

    if (appointment.status !== 'completed') {
      return NextResponse.json({ error: 'Can only review completed appointments' }, { status: 400 })
    }

    // Check if review already exists
    const { data: existingReview } = await supabaseAdmin
      .from('reviews')
      .select('id')
      .eq('appointment_id', appointmentId)
      .single()

    if (existingReview) {
      return NextResponse.json({ error: 'Review already exists' }, { status: 400 })
    }

    // Create review
    const { data: review, error } = await supabaseAdmin
      .from('reviews')
      .insert({
        appointment_id: appointmentId,
        doctor_id: appointment.doctor_id,
        patient_id: patient.id,
        rating,
        comment: comment || ''
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating review:', error)
      return NextResponse.json({ error: 'Failed to create review' }, { status: 500 })
    }

    return NextResponse.json(review, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}