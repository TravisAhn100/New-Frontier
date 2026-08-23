import { useEffect, useState } from 'react'
import { imageService, isStoredImageReference } from '../services/imageService'

export function useResolvedImage(reference?: string) {
  const [source, setSource] = useState(() => reference && !isStoredImageReference(reference) ? reference : undefined)

  useEffect(() => {
    let active = true
    let objectUrl: string | undefined

    if (!reference) {
      setSource(undefined)
      return () => {
        active = false
      }
    }

    if (!isStoredImageReference(reference)) {
      setSource(reference)
      return () => {
        active = false
      }
    }

    setSource(undefined)
    void imageService.resolve(reference).then((resolved) => {
      if (!active) {
        if (resolved) URL.revokeObjectURL(resolved)
        return
      }
      objectUrl = resolved
      setSource(resolved)
    })

    return () => {
      active = false
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [reference])

  return source
}
