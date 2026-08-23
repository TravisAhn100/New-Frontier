import type { ImgHTMLAttributes } from 'react'

interface ResolvedImageProps extends Omit<ImgHTMLAttributes<HTMLImageElement>, 'src'> {
  reference: string
}

export default function ResolvedImage({ reference, className, alt, ...props }: ResolvedImageProps) {
  if (!reference) {
    return <div className={`${className ?? ''} resolved-image--loading`} aria-hidden="true" />
  }

  return <img {...props} className={className} src={reference} alt={alt ?? ''} />
}
