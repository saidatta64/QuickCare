import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { supabaseAdmin } from '@/lib/supabase'

// Enable debug logging
const DEBUG = process.env.NODE_ENV !== 'production'

export async function POST(request: NextRequest) {
  try {
    DEBUG && console.log('Registration request received')
    
    const { name, email, password } = await request.json()
    DEBUG && console.log('Registration data:', { name, email, password: password ? '[REDACTED]' : 'undefined' })

    if (!name || !email || !password) {
      const error = 'Missing required fields'
      DEBUG && console.error(error, { name, email, hasPassword: !!password })
      return NextResponse.json(
        { error },
        { status: 400 }
      )
    }

    // Check if user already exists
    DEBUG && console.log('Checking for existing user')
    const { data: existingUser, error: existingUserError } = await supabaseAdmin
      .from('users')
      .select('id')
      .eq('email', email)
      .single()

    if (existingUserError && existingUserError.code !== 'PGRST116') {
      DEBUG && console.error('Error checking existing user:', existingUserError)
      return NextResponse.json(
        { error: 'Error checking user existence' },
        { status: 500 }
      )
    }

    if (existingUser) {
      DEBUG && console.log('User already exists:', email)
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      )
    }

    // Hash password
    DEBUG && console.log('Hashing password')
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    DEBUG && console.log('Creating user in database')
    const { data: user, error: userError } = await supabaseAdmin
      .from('users')
      .insert({
        name,
        email,
        password_hash: passwordHash,
        role: 'patient',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (userError) {
      DEBUG && console.error('Error creating user:', userError)
      return NextResponse.json(
        { 
          error: 'Failed to create user',
          details: DEBUG ? userError.message : undefined 
        },
        { status: 500 }
      )
    }
    
    DEBUG && console.log('User created successfully:', user.id)

    // Create patient profile
    DEBUG && console.log('Creating patient profile')
    const { error: patientError } = await supabaseAdmin
      .from('patients')
      .insert({
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })

    if (patientError) {
      DEBUG && console.error('Error creating patient profile:', patientError)
      // Clean up user if patient creation fails
      await supabaseAdmin
        .from('users')
        .delete()
        .eq('id', user.id)

      return NextResponse.json(
        { 
          error: 'Failed to create patient profile',
          details: DEBUG ? patientError.message : undefined
        },
        { status: 500 }
      )
    }
    
    DEBUG && console.log('Patient profile created successfully')

    DEBUG && console.log('Registration completed successfully')
    return NextResponse.json(
      { 
        message: 'User created successfully',
        userId: user.id 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Registration error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        ...(DEBUG && { details: error instanceof Error ? error.message : String(error) })
      },
      { status: 500 }
    )
  }
}