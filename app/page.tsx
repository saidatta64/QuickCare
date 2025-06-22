'use client'

import { useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

export default function HomePage() {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'loading') return

    if (!session) {
      router.push('/auth/signin')
      return
    }

    // Redirect based on user role
    if (session.user.role === 'doctor') {
      router.push('/doctor/dashboard')
    } else if (session.user.role === 'patient') {
      router.push('/patient/dashboard')
    } else {
      router.push('/auth/signin')
    }
  }, [session, status, router])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <LoadingSpinner size="lg" />
    </div>
  )
}