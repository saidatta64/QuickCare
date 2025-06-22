'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { Header } from '@/components/layout/Header'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { User, ArrowLeft, Lock } from 'lucide-react'
import Link from 'next/link'

interface ProfileFormData {
  name: string
  currentPassword: string
  newPassword: string
  confirmPassword: string
}

export default function PatientProfile() {
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')
  
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<ProfileFormData>()
  const watchNewPassword = watch('newPassword')

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

    // Set initial form values
    reset({
      name: session.user.name,
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    })
  }, [session, status, router, reset])

  const onSubmit = async (data: ProfileFormData) => {
    setLoading(true)
    setError('')
    setMessage('')

    try {
      // Update name if changed
      if (data.name !== session?.user.name) {
        const nameResponse = await fetch('/api/user/profile', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ name: data.name }),
        })

        if (!nameResponse.ok) {
          const error = await nameResponse.json()
          throw new Error(error.error || 'Failed to update name')
        }

        // Update session
        await update({ name: data.name })
      }

      // Update password if provided
      if (data.currentPassword && data.newPassword) {
        const passwordResponse = await fetch('/api/user/password', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            currentPassword: data.currentPassword,
            newPassword: data.newPassword,
          }),
        })

        if (!passwordResponse.ok) {
          const error = await passwordResponse.json()
          throw new Error(error.error || 'Failed to update password')
        }

        // Clear password fields
        reset({
          name: data.name,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        })
      }

      setMessage('Profile updated successfully!')
    } catch (error) {
      setError(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  if (status === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (!session || session.user.role !== 'patient') {
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header>
        <Link 
          href="/patient/dashboard"
          className="flex items-center space-x-2 text-gray-600 dark:text-gray-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </Link>
      </Header>
      
      <main className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Profile Settings
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage your account information and security settings
          </p>
        </div>

        <div className="space-y-6">
          {/* Profile Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center">
                <User className="w-5 h-5 mr-2" />
                Profile Information
              </h2>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {message && (
                  <div className="bg-success-50 dark:bg-success-900 text-success-600 dark:text-success-200 p-3 rounded-lg text-sm">
                    {message}
                  </div>
                )}

                {error && (
                  <div className="bg-error-50 dark:bg-error-900 text-error-600 dark:text-error-200 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Input
                  label="Full Name"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                  error={errors.name?.message}
                />

                <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4 flex items-center">
                    <Lock className="w-5 h-5 mr-2" />
                    Change Password
                  </h3>
                  
                  <div className="space-y-4">
                    <Input
                      label="Current Password"
                      type="password"
                      {...register('currentPassword', {
                        validate: (value) => {
                          if (watchNewPassword && !value) {
                            return 'Current password is required to change password'
                          }
                          return true
                        }
                      })}
                      error={errors.currentPassword?.message}
                      placeholder="Enter current password"
                    />

                    <Input
                      label="New Password"
                      type="password"
                      {...register('newPassword', {
                        validate: (value) => {
                          if (value && value.length < 6) {
                            return 'Password must be at least 6 characters'
                          }
                          return true
                        }
                      })}
                      error={errors.newPassword?.message}
                      placeholder="Enter new password"
                    />

                    <Input
                      label="Confirm New Password"
                      type="password"
                      {...register('confirmPassword', {
                        validate: (value) => {
                          if (watchNewPassword && value !== watchNewPassword) {
                            return 'Passwords do not match'
                          }
                          return true
                        }
                      })}
                      error={errors.confirmPassword?.message}
                      placeholder="Confirm new password"
                    />
                  </div>
                </div>

                <div className="pt-6">
                  <Button
                    type="submit"
                    variant="primary"
                    loading={loading}
                    className="w-full"
                  >
                    Update Profile
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Account Information */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Account Information
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Email Address
                  </label>
                  <p className="text-gray-900 dark:text-white">{session.user.email}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Account Type
                  </label>
                  <p className="text-gray-900 dark:text-white capitalize">{session.user.role}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Member Since
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {new Date().toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}