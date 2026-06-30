/**
 * OptimizedImage — A wrapper component for responsive, performant images
 * Automatically adds srcset, sizes, lazy loading, and async decoding
 */

import React, { ImgHTMLAttributes } from "react";

interface OptimizedImageProps extends ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  alt: string;
  /** Breakpoints for srcset (e.g., [400, 800, 1200]) */
  breakpoints?: number[];
  /** CSS sizes attribute for responsive behavior */
  sizes?: string;
  /** Optional aspect ratio for skeleton/placeholder */
  aspectRatio?: string;
}

export default function OptimizedImage({
  src,
  alt,
  breakpoints = [400, 800, 1200],
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 1200px",
  aspectRatio,
  className = "",
  ...props
}: OptimizedImageProps) {
  // Generate srcSet from breakpoints
  const srcSet = breakpoints
    .map((bp) => `${src}${src.includes("?") ? "&" : "?"}w=${bp} ${bp}w`)
    .join(", ");

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      sizes={sizes}
      srcSet={srcSet}
      loading="lazy"
      decoding="async"
      {...props}
    />
  );
}
