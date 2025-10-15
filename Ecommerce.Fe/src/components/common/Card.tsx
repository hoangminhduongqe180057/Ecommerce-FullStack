// src/components/common/Card.tsx
import type { ReactNode } from 'react'

interface CardProps {
  children: ReactNode
  className?: string
  padding?: 'none' | 'sm' | 'md' | 'lg'
  hover?: boolean
}

export default function Card({
  children,
  className = '',
  padding = 'md',
  hover = false,
}: CardProps) {
  const paddingStyles = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-6',
  }
  
  const hoverStyle = hover ? 'hover:shadow-lg transition-shadow duration-200 cursor-pointer' : ''
  
  return (
    <div
      className={`
        bg-white rounded-lg shadow-md
        ${paddingStyles[padding]}
        ${hoverStyle}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
