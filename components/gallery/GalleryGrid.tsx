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
import { FavoriteButton } from "./FavoriteButton";
import { GalleryLightbox } from "./GalleryLightbox";
import { DownloadPhotoButton } from "@/components/shared/DownloadButton";

interface Props {
  photos: PhotoWithFavorite[];
  galleryId: string;
}

export function GalleryGrid({ photos, galleryId }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  return (
    <>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-1">
        {photos.map((photo, index) => (
          <div
            key={photo.id}
            className="relative aspect-square group cursor-pointer overflow-hidden"
            onClick={() => setLightboxIndex(index)}
          >
            <img
              src={photo.previewUrl}
              alt={photo.filename}
              className="photo w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
              onLoad={(e) => e.currentTarget.classList.add("loaded")}
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
            <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <FavoriteButton
                photoId={photo.id}
                galleryId={galleryId}
                initialFavorited={photo.isFavorited}
              />
            </div>
            <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <DownloadPhotoButton photo={photo} />
            </div>
          </div>
        ))}
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
