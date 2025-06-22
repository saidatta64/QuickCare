'use client'

import { useSession, signOut } from 'next-auth/react'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/Button'
import { Moon, Sun, LogOut } from 'lucide-react'

interface HeaderProps {
  title?: string
  children?: React.ReactNode
}

export function Header({ title = 'QuickCare', children }: HeaderProps) {
  const { data: session } = useSession()
  const { isDark, toggleTheme } = useTheme()

  return (
    <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center space-x-4">
            <h1 className="text-3xl font-bold text-cyan-600 dark:text-sky-400">
              {title}
            </h1>
            {children}
          </div>
          
          <div className="flex items-center space-x-3 ml-auto">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleTheme}
              className="p-2"
              aria-label="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5" />}
            </Button>
            
            {session && (
              <div className="flex items-center space-x-3">
                { session.user.role == 'patient' ? <span className="text-sm text-gray-800 dark:text-gray-300">
                  Welcome, {session.user.name}
                </span> : null}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                   className=" border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600">
                    <div className='flex items-center space-x-2'>
                      <LogOut className="w-4 h-4" />
                     <span >Logout</span>
                    </div>
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}