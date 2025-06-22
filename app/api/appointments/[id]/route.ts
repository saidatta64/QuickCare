import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { status } = await request.json()
    const appointmentId = params.id

    // Verify the appointment belongs to the doctor
    if (session.user.role === 'doctor') {
      const { data: doctor } = await supabaseAdmin
        .from('doctors')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (!doctor) {
        return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
      }

      const { data: appointment } = await supabaseAdmin
        .from('appointments')
        .select('doctor_id')
        .eq('id', appointmentId)
        .single()

      if (!appointment || appointment.doctor_id !== doctor.id) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
      }

      // Update appointment status
      const { error } = await supabaseAdmin
        .from('appointments')
        .update({ status, updated_at: new Date().toISOString() })
        .eq('id', appointmentId)

      if (error) {
        console.error('Error updating appointment:', error)
        return NextResponse.json({ error: 'Failed to update appointment' }, { status: 500 })
      }

      return NextResponse.json({ message: 'Appointment updated successfully' })
    }

    // For patients - only allow cancellation
    if (session.user.role === 'patient' && status === 'cancelled') {
      const { data: patient } = await supabaseAdmin
        .from('patients')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (!patient) {
        return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
      }

      const { data: appointment } = await supabaseAdmin
        .from('appointments')
        .select('patient_id, status')
        .eq('id', appointmentId)
        .single()

      if (!appointment || appointment.patient_id !== patient.id) {
        return NextResponse.json({ error: 'Appointment not found' }, { status: 404 })
      }

      if (appointment.status !== 'scheduled') {
        return NextResponse.json({ error: 'Cannot cancel this appointment' }, { status: 400 })
      }

      // Update appointment status
      const { error } = await supabaseAdmin
        .from('appointments')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', appointmentId)

      if (error) {
        console.error('Error cancelling appointment:', error)
        return NextResponse.json({ error: 'Failed to cancel appointment' }, { status: 500 })
      }

      return NextResponse.json({ message: 'Appointment cancelled successfully' })
    }

    return NextResponse.json({ error: 'Unauthorized action' }, { status: 403 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}