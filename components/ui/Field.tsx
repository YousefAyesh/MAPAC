import type { ReactNode } from 'react'

export function Field({
  id,
  label,
  error,
  hint,
  required = false,
  children,
}: {
  id: string
  label: string
  error?: string
  hint?: string
  required?: boolean
  children: (props: { id: string; 'aria-describedby'?: string; 'aria-invalid'?: boolean }) => ReactNode
}) {
  const errorId = error ? `${id}-error` : undefined
  const hintId = hint ? `${id}-hint` : undefined
  const describedBy = [errorId, hintId].filter(Boolean).join(' ') || undefined

  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-navy">
        {label}
        {required && (
          <>
            {' '}
            <span className="text-crimson-deep" aria-hidden="true">
              *
            </span>
            <span className="sr-only">(required)</span>
          </>
        )}
      </label>
      {hint && (
        <p id={hintId} className="mt-1 text-xs text-body">
          {hint}
        </p>
      )}
      <div className="mt-1.5">
        {children({ id, 'aria-describedby': describedBy, 'aria-invalid': error ? true : undefined })}
      </div>
      {error && (
        <p id={errorId} className="mt-1.5 text-sm font-medium text-crimson-deep">
          {error}
        </p>
      )}
    </div>
  )
}
