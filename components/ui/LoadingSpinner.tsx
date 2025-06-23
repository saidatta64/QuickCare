import React from 'react'
import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

/**
 * Animated loader converted from HTML & CSS (Uiverse.io by milley69)
 * Props:
 *  - size: 'sm' | 'md' | 'lg' (controls SVG dimensions)
 *  - className: Additional CSS classes
 */
export function LoadingSpinner({ size = 'md', className }: LoadingSpinnerProps) {
  /**
   * Approximate SVG aspect ratio ~ 64:48 (width:height ≈ 4:3).
   * We scale both width and height proportionally by the factor map below.
   */
  const sizeMap: Record<'sm' | 'md' | 'lg', number> = {
    sm: 32, // base height in px ⇒ width ≈ 42.6
    md: 48, // base height in px ⇒ width ≈ 64
    lg: 64, // base height in px ⇒ width ≈ 85.3
  }

  const height = sizeMap[size]
  // Preserve aspect ratio (4:3) so width = height * 4 / 3
  const width = Math.round((height * 4) / 3)

  return (
    <div className={cn("flex items-center justify-center", className)} role="status" aria-live="polite">
      <svg
        width={width}
        height={height}
        viewBox="0 0 64 48"
        className="inline-block"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background trace */}
        <polyline
          points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
          fill="none"
          stroke="#ff4d5033"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Animated foreground trace */}
        <polyline
          points="0.157 23.954, 14 23.954, 21.843 48, 43 0, 50 24, 64 24"
          fill="none"
          stroke="#ff4d4f"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="48 144"
          strokeDashoffset="192"
          className="animate-loader-dash"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  )
}
