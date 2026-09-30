import type { ReactNode } from 'react'

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={`rounded-lg border border-border-subtle bg-white p-6 ${className}`.trim()}
    >
      {children}
    </div>
  )
}
