import { twMerge } from 'tailwind-merge'

type ClassValue = string | false | null | undefined

/** Joins class names and resolves conflicting Tailwind utilities by position, not source order. */
export function cn(...classes: ClassValue[]): string {
  return twMerge(classes.filter(Boolean).join(' '))
}
