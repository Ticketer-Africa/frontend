"use client";

import { useState } from "react";

export function SiteImage({ src, alt }: { src: string; alt: string }) {
  const [failed, setFailed] = useState(false);
  if (failed) return <div className="es-image-fallback" role="img" aria-label={alt || "Image unavailable"}>Image unavailable</div>;
  return <img src={src} alt={alt} loading="lazy" onError={() => setFailed(true)} />;
}
