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

import { useEffect, useRef, useState } from "react";
import type { PhotoWithFavorite } from "@/types";
import { FavoriteButton } from "./FavoriteButton";
import { GalleryLightbox } from "./GalleryLightbox";
import { DownloadPhotoButton } from "@/components/shared/DownloadButton";

interface Props {
  photos: PhotoWithFavorite[];
  galleryId: string;
}

export function GalleryHorizontal({ photos, galleryId }: Props) {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    function onWheel(e: WheelEvent) {
      if (Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
        e.preventDefault();
        el!.scrollLeft += e.deltaY;
      }
    }

    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <>
      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-auto overflow-y-hidden pb-4"
        style={{ height: "70vh", scrollbarWidth: "thin" }}
      >
        {photos.map((photo, index) => {
          const aspectRatio =
            photo.width && photo.height ? photo.width / photo.height : 1.5;
          const width = aspectRatio * 70;

          return (
            <div
              key={photo.id}
              className="relative flex-shrink-0 group cursor-pointer overflow-hidden h-full"
              style={{ width: `${width}vh` }}
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
          );
        })}
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
