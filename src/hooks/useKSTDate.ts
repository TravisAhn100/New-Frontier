import { useState, useEffect } from 'react'

/** Returns the current date formatted in Korean Standard Time (Asia/Seoul). */
export function useKSTDate(): string {
  const format = () =>
    new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Seoul',
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date())

  const [dateStr, setDateStr] = useState(format)

  useEffect(() => {
    // Refresh at the top of each minute in case the page straddles midnight KST
    const tick = () => setDateStr(format())
    const msUntilNextMinute =
      60_000 - (Date.now() % 60_000)
    const timeout = setTimeout(() => {
      tick()
      const interval = setInterval(tick, 60_000)
      return () => clearInterval(interval)
    }, msUntilNextMinute)

    return () => clearTimeout(timeout)
  }, [])

  return dateStr
}
