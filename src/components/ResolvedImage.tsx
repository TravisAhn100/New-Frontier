import type { ImgHTMLAttributes } from 'react'
import { useResolvedImage } from '../hooks/useResolvedImage'

interface ResolvedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  reference: string
}

export default function ResolvedImage({ reference, className, alt, ...props }: ResolvedImageProps) {
  const source = useResolvedImage(reference)

  if (!source) {
    return <div className={`${className ?? ''} resolved-image--loading`} aria-hidden="true" />
  }

  return <img {...props} className={className} src={source} alt={alt ?? ''} />
}
