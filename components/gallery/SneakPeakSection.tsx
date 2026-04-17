/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import type { PhotoWithFavorite } from "@/types";

interface Props {
  photos: PhotoWithFavorite[];
}

export function SneakPeakSection({ photos }: Props) {
  if (photos.length === 0) return null;

  return (
    <div className="mb-12">
      <div className="flex items-center gap-3 mb-6">
        <span className="text-xl">✨</span>
        <h2 className="font-display text-2xl font-semibold">Erste Vorschau</h2>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.slice(0, 6).map((photo) => (
          <div key={photo.id} className="aspect-[4/3] overflow-hidden rounded">
            <img
              src={photo.previewUrl}
              alt={photo.filename}
              className="photo w-full h-full object-cover"
              onLoad={(e) => e.currentTarget.classList.add("loaded")}
            />
          </div>
        ))}
      </div>
    </div>
  );
}
