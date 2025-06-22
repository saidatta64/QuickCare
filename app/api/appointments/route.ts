import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const {
      doctorId,
      appointmentDate,
      timeSlot,
      age,
      gender,
      phone,
      notes
    } = await request.json()

    // Get patient profile
    const { data: patient } = await supabaseAdmin
      .from('patients')
      .select('id, first_name, last_name')
      .eq('user_id', session.user.id)
      .single()

    if (!patient) {
      return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
    }
    
    const fullPatientName = `${patient.first_name} ${patient.last_name}`.trim()

    // Get current queue position for the slot
    const { data: existingAppointments } = await supabaseAdmin
      .from('appointments')
      .select('queue_position')
      .eq('doctor_id', doctorId)
      .eq('patient_id', patient.id)
      .eq('appointment_date', appointmentDate)
      .eq('time_slot', timeSlot)
      .eq('status', 'scheduled')
      .order('queue_position', { ascending: false })
      .limit(1)

    const queuePosition = existingAppointments?.[0]?.queue_position ?? 0

    // Check if slot is full (max 7 appointments)
    if (queuePosition >= 7) {
      return NextResponse.json({ error: 'Time slot is full' }, { status: 400 })
    }

    // Update patient info
    await supabaseAdmin
      .from('patients')
      .update({
        age,
        gender,
        phone: phone || null
      })
      .eq('id', patient.id)

    // Create appointment
    const { data: appointment, error } = await supabaseAdmin
      .from('appointments')
      .insert({
        doctor_id: doctorId,
        patient_id: patient.id,
        patient_name: fullPatientName,
        patient_age: age,
        patient_gender: gender,
        patient_phone: phone || null,
        appointment_date: appointmentDate,
        time_slot: timeSlot,
        queue_position: queuePosition + 1,
        notes: notes || '',
        status: 'scheduled'
      })
      .select(`
        *,
        doctors (
          users (name),
          specialization,
          consultation_fee
        )
      `)
      .single()

    if (error) {
      console.error('Appointment creation error:', error)
      return NextResponse.json({ error: 'Failed to create appointment' }, { status: 500 })
    }

    return NextResponse.json(appointment, { status: 201 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const role = session.user.role

    if (role === 'doctor') {
      // Get doctor's appointments
      const { data: doctor } = await supabaseAdmin
        .from('doctors')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (!doctor) {
        return NextResponse.json({ error: 'Doctor profile not found' }, { status: 404 })
      }

      const { data: appointments, error } = await supabaseAdmin
        .from('appointments')
        .select('*')
        .eq('doctor_id', doctor.id)
        .order('appointment_date', { ascending: false })
        .order('queue_position', { ascending: true })

      if (error) {
        console.error('Error fetching appointments:', error)
        return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
      }

      // Return the appointments with patient details directly from the appointments table
      return NextResponse.json(appointments)

    } else if (role === 'patient') {
      // Get patient's appointments
      const { data: patient } = await supabaseAdmin
        .from('patients')
        .select('id')
        .eq('user_id', session.user.id)
        .single()

      if (!patient) {
        return NextResponse.json({ error: 'Patient profile not found' }, { status: 404 })
      }

      const { data: appointments, error } = await supabaseAdmin
        .from('appointments')
        .select(`
          *,
          doctors (
            users (name),
            specialization,
            city,
            consultation_fee
          )
        `)
        .eq('patient_id', patient.id)
        .order('appointment_date', { ascending: false })

      if (error) {
        console.error('Error fetching appointments:', error)
        return NextResponse.json({ error: 'Failed to fetch appointments' }, { status: 500 })
      }

      return NextResponse.json(appointments)
    }

    return NextResponse.json({ error: 'Invalid role' }, { status: 400 })
  } catch (error) {
    console.error('API error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}