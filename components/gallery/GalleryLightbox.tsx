/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

"use client";

import { useCallback, useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PhotoWithFavorite } from "@/types";
import { FavoriteButton } from "./FavoriteButton";
import { DownloadPhotoButton } from "@/components/shared/DownloadButton";

interface Props {
  photos: PhotoWithFavorite[];
  initialIndex: number;
  galleryId: string;
  onClose: () => void;
}

export function GalleryLightbox({ photos, initialIndex, galleryId, onClose }: Props) {
  const [index, setIndex] = useState(initialIndex);

  const prev = useCallback(
    () => setIndex((i) => (i - 1 + photos.length) % photos.length),
    [photos.length]
  );
  const next = useCallback(
    () => setIndex((i) => (i + 1) % photos.length),
    [photos.length]
  );

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, prev, next]);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const photo = photos[index];

  return (
    <div
      className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative max-w-5xl max-h-full w-full px-16"
        onClick={(e) => e.stopPropagation()}
      >
        <img
          key={photo.id}
          src={photo.previewUrl}
          alt={photo.filename}
          className="photo w-full max-h-[85vh] object-contain animate-fade-in loaded mx-auto"
          onLoad={(e) => e.currentTarget.classList.add("loaded")}
        />
      </div>

      <button
        onClick={onClose}
        className="absolute top-4 right-4 p-2 text-white/70 hover:text-white transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
      >
        <ChevronLeft className="w-8 h-8" />
      </button>

      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 text-white/70 hover:text-white transition-colors"
      >
        <ChevronRight className="w-8 h-8" />
      </button>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-4">
        <FavoriteButton
          photoId={photo.id}
          galleryId={galleryId}
          initialFavorited={photo.isFavorited}
          dark
        />
        <DownloadPhotoButton photo={photo} dark />
        <span className="text-white/50 text-sm">{index + 1} / {photos.length}</span>
      </div>
    </div>
  );
}
