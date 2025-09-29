import { useEffect, useState } from 'react'

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function useDebounceCallback(callback: Function, delay: number) {
  const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null)

  const debouncedCallback = (...args: any[]) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer)
    }

    const newTimer = setTimeout(() => {
      callback(...args)
    }, delay)

    setDebounceTimer(newTimer)
  }

  return debouncedCallback
}