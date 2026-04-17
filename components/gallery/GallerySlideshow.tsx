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
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PhotoWithFavorite } from "@/types";
import { FavoriteButton } from "./FavoriteButton";
import { DownloadPhotoButton } from "@/components/shared/DownloadButton";

interface Props {
  photos: PhotoWithFavorite[];
  galleryId: string;
}

export function GallerySlideshow({ photos, galleryId }: Props) {
  const [index, setIndex] = useState(0);

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
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [prev, next]);

  const current = photos[index];

  return (
    <div className="relative w-full" style={{ height: "80vh" }}>
      <img
        key={current.id}
        src={current.previewUrl}
        alt={current.filename}
        className="photo w-full h-full object-contain animate-fade-in loaded"
        onLoad={(e) => e.currentTarget.classList.add("loaded")}
      />

      <button
        onClick={prev}
        className="absolute left-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={next}
        className="absolute right-4 top-1/2 -translate-y-1/2 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      <div className="absolute top-4 right-4 flex gap-2">
        <FavoriteButton
          photoId={current.id}
          galleryId={galleryId}
          initialFavorited={current.isFavorited}
        />
        <DownloadPhotoButton photo={current} />
      </div>

      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-white bg-black/40 px-3 py-1 rounded-full">
        {index + 1} / {photos.length}
      </div>

      <div className="flex gap-1 justify-center mt-2 overflow-x-auto pb-2">
        {photos.map((photo, i) => (
          <button
            key={photo.id}
            onClick={() => setIndex(i)}
            className={`flex-shrink-0 w-12 h-12 overflow-hidden rounded transition-opacity ${
              i === index ? "opacity-100 ring-2 ring-[var(--accent)]" : "opacity-50 hover:opacity-75"
            }`}
          >
            <img
              src={photo.previewUrl}
              alt=""
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>
    </div>
  );
}
