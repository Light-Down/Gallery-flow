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

function PhotoItem({
  photo,
  index,
  galleryId,
  className,
  onClick,
}: {
  photo: PhotoWithFavorite;
  index: number;
  galleryId: string;
  className?: string;
  onClick: () => void;
}) {
  return (
    <div className={`relative group cursor-pointer overflow-hidden ${className}`} onClick={onClick}>
      <img
        src={photo.previewUrl}
        alt={photo.filename}
        className="photo w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.02]"
        onLoad={(e) => e.currentTarget.classList.add("loaded")}
      />
      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-200" />
      <div className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <FavoriteButton photoId={photo.id} galleryId={galleryId} initialFavorited={photo.isFavorited} />
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
        <DownloadPhotoButton photo={photo} />
      </div>
    </div>
  );
}

export function GalleryMagazine({ photos, galleryId }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const chunks: PhotoWithFavorite[][] = [];
  let i = 0;
  while (i < photos.length) {
    const isFeature = chunks.length % 2 === 0 && chunks.length > 0;
    if (isFeature) {
      chunks.push([photos[i]]);
      i += 1;
    } else {
      chunks.push(photos.slice(i, i + 6));
      i += 6;
    }
  }

  return (
    <>
      {photos.length > 0 && (
        <div className="mb-2" style={{ height: "60vh" }}>
          <PhotoItem
            photo={photos[0]}
            index={0}
            galleryId={galleryId}
            className="h-full w-full"
            onClick={() => setLightboxIndex(0)}
          />
        </div>
      )}

      {(() => {
        const rest = photos.slice(1);
        const elements: React.ReactNode[] = [];
        let idx = 0;

        while (idx < rest.length) {
          const chunk = rest.slice(idx, idx + 6);
          const absoluteStart = idx + 1;

          elements.push(
            <div key={`grid-${idx}`} className="grid grid-cols-2 sm:grid-cols-3 gap-1 mb-1">
              {chunk.map((photo, j) => (
                <PhotoItem
                  key={photo.id}
                  photo={photo}
                  index={absoluteStart + j}
                  galleryId={galleryId}
                  className="aspect-square"
                  onClick={() => setLightboxIndex(absoluteStart + j)}
                />
              ))}
            </div>
          );

          idx += 6;

          const featurePhoto = rest[idx];
          if (featurePhoto) {
            elements.push(
              <div key={`feature-${idx}`} className="mb-1" style={{ height: "50vh" }}>
                <PhotoItem
                  photo={featurePhoto}
                  index={idx + 1}
                  galleryId={galleryId}
                  className="h-full w-full"
                  onClick={() => setLightboxIndex(idx + 1)}
                />
              </div>
            );
            idx += 1;
          }
        }

        return elements;
      })()}

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
