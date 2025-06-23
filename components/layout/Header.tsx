'use client'

import { useSession, signOut } from 'next-auth/react'
import { useTheme } from '@/hooks/useTheme'
import { Button } from '@/components/ui/Button'
// Import the necessary Lucide React icons
import { Moon, Sun, LogOut, LayoutDashboard, User, Menu, X } from 'lucide-react' 
import Link from 'next/link' // Ensure Link is imported
import clsx from 'clsx' // Ensure clsx is imported
import React from 'react'

interface HeaderProps {
  title?: string
  children?: React.ReactNode // Keeping this in case you pass extra elements next to the title
}

export function Header({ title = 'QuickCare', children }: HeaderProps) {
  const { data: session } = useSession()
  const { isDark, toggleTheme } = useTheme()
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false)

  return (
    <header
      // Re-added fixed/static positioning for better mobile scroll behavior
      className={clsx(
        'fixed sm:static top-0 left-0 right-0 z-40',
        'bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700'
      )}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16">
          {/* Left: Logo & optional Children */}
          <div className="flex items-center gap-2 sm:gap-4"> {/* Adjusted gap for mobile */}
            <Link href="/" passHref legacyBehavior>
              <a className="text-xl sm:text-2xl font-bold text-cyan-600 dark:text-sky-400 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-cyan-500 rounded transition-colors hover:text-cyan-700 dark:hover:text-sky-300">
                {title}
              </a>
            </Link>
            {children}
          </div>

          {/* Right: Theme Toggle, User Info, Nav (conditional), Logout */}
          <div className="flex items-center gap-2 sm:gap-3 ml-auto"> {/* Adjusted gap for mobile */}
            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon" // Using 'icon' size for consistent padding
              onClick={toggleTheme}
              className="p-2" // Explicit padding to ensure consistent size
              aria-label="Toggle theme"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-amber-400" />
              ) : (
                <Moon className="w-5 h-5 text-gray-600 dark:text-gray-300" />
              )}
            </Button>

            {session && (
              <div className="flex items-center gap-2 sm:gap-3">
                {session.user.role === 'patient' && (
                  <>
                    {/* Welcome message (desktop only) */}
                    <div className="hidden sm:flex flex-col items-end sm:flex-row sm:items-center sm:gap-1 text-xs sm:text-sm text-gray-700 dark:text-gray-200 min-w-0">
                      <span className="whitespace-nowrap">Welcome,</span>
                      <span className="font-medium truncate">{session.user.name}</span>
                    </div>
                    {/* Desktop nav links */}
                    <nav className="hidden sm:flex items-center gap-4 text-gray-600 dark:text-gray-300 text-sm"> 
                      <Link href="/patient/appointments" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-50 dark:bg-gray-700 text-cyan-700 dark:text-cyan-200 font-medium hover:bg-cyan-100 dark:hover:bg-gray-600 transition-colors border border-cyan-200 dark:border-cyan-800 shadow-sm">
                        <LayoutDashboard className="w-4 h-4" /> Appointments
                      </Link>
                      <Link href="/patient/profile" className="flex items-center gap-2 px-4 py-2 rounded-lg bg-cyan-50 dark:bg-gray-700 text-cyan-700 dark:text-cyan-200 font-medium hover:bg-cyan-100 dark:hover:bg-gray-600 transition-colors border border-cyan-200 dark:border-cyan-800 shadow-sm">
                        <User className="w-4 h-4" /> Profile
                      </Link>
                    </nav>
                    {/* Logout (desktop) */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                      className="hidden sm:flex border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <div className='flex items-center space-x-1 sm:space-x-2'>
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Logout</span>
                      </div>
                    </Button>
                    {/* Mobile menu button */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="sm:hidden"
                      onClick={() => setMobileMenuOpen(true)}
                      aria-label="Open menu"
                    >
                      <Menu className="w-6 h-6" />
                    </Button>
                  </>
                )}
                {session.user.role !== 'patient' && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => signOut({ callbackUrl: '/auth/signin' })}
                      className="hidden sm:flex border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600"
                    >
                      <div className='flex items-center space-x-1 sm:space-x-2'>
                        <LogOut className="w-4 h-4" />
                        <span className="hidden sm:inline">Logout</span>
                      </div>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="sm:hidden"
                      onClick={() => setMobileMenuOpen(true)}
                      aria-label="Open menu"
                    >
                      <Menu className="w-6 h-6" />
                    </Button>
                  </>
                )}
                {/* Mobile menu overlay */}
                {mobileMenuOpen && (
                  <div className="fixed inset-0 z-50 bg-black bg-opacity-40 flex justify-end sm:hidden">
                    <div className="w-3/4 max-w-xs bg-white dark:bg-gray-800 h-full shadow-lg flex flex-col p-6 relative">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="absolute top-4 right-4"
                        onClick={() => setMobileMenuOpen(false)}
                        aria-label="Close menu"
                      >
                        <X className="w-6 h-6" />
                      </Button>
                      <div className="flex flex-col gap-6 mt-12">
                        {session.user.role === 'patient' && (
                          <>
                            <Link href="/patient/appointments" onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-2 text-lg font-medium px-4 py-2 rounded-lg bg-cyan-50 dark:bg-gray-700 text-cyan-700 dark:text-cyan-200 hover:bg-cyan-100 dark:hover:bg-gray-600 transition-colors border border-cyan-200 dark:border-cyan-800 shadow-sm">
                              <LayoutDashboard className="w-5 h-5" /> Appointments
                            </Link>
                            <Link href="/patient/profile" onClick={() => setMobileMenuOpen(false)}
                              className="flex items-center gap-2 text-lg font-medium px-4 py-2 rounded-lg bg-cyan-50 dark:bg-gray-700 text-cyan-700 dark:text-cyan-200 hover:bg-cyan-100 dark:hover:bg-gray-600 transition-colors border border-cyan-200 dark:border-cyan-800 shadow-sm">
                              <User className="w-5 h-5" /> Profile
                            </Link>
                          </>
                        )}
                        <Button
                          variant="outline"
                          size="lg"
                          onClick={() => { setMobileMenuOpen(false); signOut({ callbackUrl: '/auth/signin' }) }}
                          className="border-red-500 text-red-500 hover:bg-red-50 hover:text-red-600 w-full justify-start"
                        >
                          <LogOut className="w-5 h-5 mr-2" /> Logout
                        </Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}