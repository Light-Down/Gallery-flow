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

import { useState } from "react";
import type { PhotoWithFavorite } from "@/types";
import { GalleryLightbox } from "./GalleryLightbox";
import { FavoriteButton } from "./FavoriteButton";

interface Props {
  photos: PhotoWithFavorite[];
  galleryId: string;
}

function seededRotation(id: string): number {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = (hash << 5) - hash + id.charCodeAt(i);
    hash |= 0;
  }
  return ((hash % 6) - 3) * 1.0;
}

export function GalleryPolaroid({ photos, galleryId }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div
        className="min-h-screen px-4 py-8"
        style={{ backgroundColor: "#fafaf7" }}
      >
        <div className="columns-1 sm:columns-2 lg:columns-3 xl:columns-4 gap-8">
          {photos.map((photo, index) => {
            const rotation = seededRotation(photo.id);
            return (
              <div
                key={photo.id}
                className="break-inside-avoid mb-8 inline-block w-full cursor-pointer group"
                style={{ transform: `rotate(${rotation}deg)` }}
                onClick={() => setLightboxIndex(index)}
              >
                <div className="bg-white shadow-md p-3 pb-10 transition-shadow duration-200 group-hover:shadow-lg">
                  <div className="overflow-hidden">
                    <img
                      src={photo.previewUrl}
                      alt={photo.filename}
                      className="photo w-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
                      onLoad={(e) => e.currentTarget.classList.add("loaded")}
                    />
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="font-handwriting text-lg text-[var(--muted-foreground)]">
                      {photo.filename.replace(/\.[^.]+$/, "")}
                    </span>
                    <div onClick={(e) => e.stopPropagation()}>
                      <FavoriteButton
                        photoId={photo.id}
                        galleryId={galleryId}
                        initialFavorited={photo.isFavorited}
                      />
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {lightboxIndex !== null && (
        <GalleryLightbox
          photos={photos}
          initialIndex={lightboxIndex}
          galleryId={galleryId}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  );
}
