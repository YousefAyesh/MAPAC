'use client'

import { useId, useState, type ReactNode } from 'react'

export function Disclosure({
  summary,
  children,
  defaultOpen = false,
}: {
  summary: string
  children: ReactNode
  defaultOpen?: boolean
}) {
  const [open, setOpen] = useState(defaultOpen)
  const panelId = useId()

  return (
    <div className="border-b border-border-subtle">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full items-center justify-between gap-4 py-4 text-left"
      >
        <span className="font-serif text-lg font-semibold text-navy">{summary}</span>
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className={`h-5 w-5 shrink-0 text-crimson transition-transform ${open ? 'rotate-45' : ''}`}
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path d="M12 5v14M5 12h14" />
        </svg>
      </button>
      <div id={panelId} hidden={!open} className="pb-5">
        <div className="max-w-3xl leading-relaxed">{children}</div>
      </div>
    </div>
  )
}
