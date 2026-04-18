import { useEffect, useState } from 'react'

export function useInitialLoading(delay = 600) {
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const timer = window.setTimeout(() => setLoading(false), delay)
    return () => window.clearTimeout(timer)
  }, [delay])

  return loading
}
