'use client'
import React, { useState } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
} from 'date-fns'
import { cn } from '@/lib/utils'
import { Button } from '../ui/Button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarHeatmapProps {
  appointmentData: { [key: string]: number }
  onDateClick: (date: Date) => void
  selectedDate: Date | null
}

export function CalendarHeatmap({
  appointmentData,
  onDateClick,
  selectedDate,
}: CalendarHeatmapProps) {
  const today = new Date()
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedYear, setSelectedYear] = useState<number>(today.getFullYear())
  const [selectedMonth, setSelectedMonth] = useState<number>(today.getMonth())

  const firstOfMonth = startOfMonth(new Date(selectedYear, selectedMonth))
  const lastOfMonth = endOfMonth(firstOfMonth)
  const days = eachDayOfInterval({ start: firstOfMonth, end: lastOfMonth })

  const getIntensity = (count: number) => {
    if (count === 0) return 'bg-gray-100 dark:bg-gray-700'
    if (count <= 2) return 'bg-indigo-200 dark:bg-primary-800'
    if (count <= 5) return 'bg-indigo-400 dark:bg-primary-600'
    if (count <= 8) return 'bg-indigo-600 dark:bg-primary-500'
    return 'bg-indigo-800 dark:bg-primary-400'
  }

  const monthNavigation = (direction: 'prev' | 'next') => {
    setCurrentDate(direction === 'prev' 
      ? subMonths(currentDate, 1) 
      : addMonths(currentDate, 1))
  }

  const handleKeyDown = (e: React.KeyboardEvent, day: Date) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onDateClick(day)
    }
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => monthNavigation('prev')}
          aria-label="Previous month"
          className="w-8 h-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
          {format(currentDate, 'MMMM yyyy')}
        </h3>
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => monthNavigation('next')}
          aria-label="Next month"
          className="w-8 h-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      

      <div className="grid grid-cols-7 gap-2 mb-4">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <div
            key={day}
            className="text-center text-sm font-medium text-gray-500 dark:text-gray-400 p-2"
          >
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-2">
        {days.map((day) => {
          const dateKey = format(day, 'yyyy-MM-dd')
          const count = appointmentData[dateKey] || 0
          const isSelected = selectedDate && isSameDay(day, selectedDate)
          const todayDate = isToday(day)

          return (
            <button
              key={dateKey}
              onClick={() => onDateClick(day)}
              onKeyDown={(e) => handleKeyDown(e, day)}
              aria-label={`${format(day, 'EEEE, MMMM d, yyyy')} - ${count} appointments`}
              aria-pressed={isSelected}
              tabIndex={0}
              className={cn(
                'aspect-square p-2 rounded-lg text-sm font-medium transition-all duration-200',
                'hover:scale-105 hover:shadow-md transform transition-transform',
                getIntensity(count),
                isSelected && 'ring-2 ring-cyan-500 ring-offset-2 dark:ring-offset-gray-800 scale-105',
                todayDate && 'ring-2 ring-blue-500 ring-offset-2 dark:ring-offset-gray-800',
                'focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2',
                'relative overflow-hidden group'
              )}
              title={`${format(day, 'MMM d, yyyy')}: ${count} appointments`}
            >
              <div className="flex flex-col items-center justify-center h-full">
                <span
                  className={cn(
                    'text-gray-900 dark:text-white',
                    count === 0 && 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {format(day, 'd')}
                </span>
                {count > 0 && <span className="text-xs opacity-75 transition-opacity duration-200 group-hover:opacity-100">
                  {count}
                </span>}
              </div>
            </button>
          )
        })}
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
        <span>Less</span>
        <div className="flex space-x-1">
          {[0, 1, 3, 6, 9].map((count) => (
            <div key={count} className={cn('w-3 h-3 rounded-sm', getIntensity(count))} />
          ))}
        </div>
        <span>More</span>
      </div>
    </div>
  )
}
