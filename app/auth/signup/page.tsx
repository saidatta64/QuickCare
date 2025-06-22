'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent, CardHeader } from '@/components/ui/Card'
import { useTheme } from '@/hooks/useTheme'
import { Sun, Moon, Stethoscope } from 'lucide-react'

interface SignUpFormData {
  name: string
  email: string
  password: string
  confirmPassword: string
}

export default function SignUpPage() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const { isDark, toggleTheme } = useTheme()
  
  const { register, handleSubmit, watch, formState: { errors } } = useForm<SignUpFormData>()
  const watchPassword = watch('password')

  const onSubmit = async (data: SignUpFormData) => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        setError(result.error || 'Registration failed')
      } else {
        setSuccess(true)
        setTimeout(() => {
          router.push('/auth/signin')
        }, 2000)
      }
    } catch (error) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-50 dark:from-gray-900 dark:to-gray-800 px-4">
      <div className="absolute top-4 right-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          className="p-2"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </Button>
      </div>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-4">
            <div className="bg-primary-600 p-3 rounded-full">
              <Stethoscope className="w-8 h-8 text-white" />
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Join QuickCare
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Create your patient account to book appointments
          </p>
        </div>

        <Card className="shadow-xl">
          <CardHeader>
            <h2 className="text-2xl font-semibold text-center text-gray-900 dark:text-white">
              Sign Up as Patient
            </h2>
          </CardHeader>
          <CardContent>
            {success ? (
              <div className="text-center py-8">
                <div className="bg-success-50 dark:bg-success-900 text-success-600 dark:text-success-200 p-4 rounded-lg mb-4">
                  Account created successfully! Redirecting to sign in...
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {error && (
                  <div className="bg-error-50 dark:bg-error-900 text-error-600 dark:text-error-200 p-3 rounded-lg text-sm">
                    {error}
                  </div>
                )}

                <Input
                  label="Full Name"
                  type="text"
                  {...register('name', {
                    required: 'Name is required',
                    minLength: {
                      value: 2,
                      message: 'Name must be at least 2 characters',
                    },
                  })}
                  error={errors.name?.message}
                  placeholder="Enter your full name"
                />

                <Input
                  label="Email Address"
                  type="email"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: {
                      value: /\S+@\S+\.\S+/,
                      message: 'Invalid email address',
                    },
                  })}
                  error={errors.email?.message}
                  placeholder="Enter your email"
                />

                <Input
                  label="Password"
                  type="password"
                  {...register('password', {
                    required: 'Password is required',
                    minLength: {
                      value: 6,
                      message: 'Password must be at least 6 characters',
                    },
                  })}
                  error={errors.password?.message}
                  placeholder="Create a password"
                />

                <Input
                  label="Confirm Password"
                  type="password"
                  {...register('confirmPassword', {
                    required: 'Please confirm your password',
                    validate: (value) =>
                      value === watchPassword || 'Passwords do not match',
                  })}
                  error={errors.confirmPassword?.message}
                  placeholder="Confirm your password"
                />

                <Button
                  type="submit"
                  variant="primary"
                  className="w-full"
                  loading={loading}
                >
                  Create Account
                </Button>
              </form>
            )}

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Already have an account?{' '}
                <Link
                  href="/auth/signin"
                  className="text-primary-600 dark:text-primary-400 hover:text-primary-500 font-medium"
                >
                  Sign in
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}