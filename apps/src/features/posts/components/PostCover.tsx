"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

export function PostCover({ src, title, className = "" }: { src: string | null; title: string; className?: string }) {
  const [failed, setFailed] = useState(!src);
  return (
    <div className={`relative aspect-[16/9] overflow-hidden bg-muted ${className}`}>
      {!failed && src ? (
        <img src={src} alt={`Portada: ${title}`} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]" onError={() => setFailed(true)} />
      ) : (
        <div className="flex h-full w-full flex-col items-center justify-center gap-2 bg-gradient-to-br from-primary/10 via-muted to-secondary/15 text-muted-foreground">
          <ImageOff className="h-8 w-8 opacity-60" aria-hidden="true" />
          <span className="text-xs font-semibold">Publicación Dyxersoft</span>
        </div>
      )}
    </div>
  );
}
