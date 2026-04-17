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

import { Download } from "lucide-react";
import type { PhotoWithFavorite } from "@/types";

interface DownloadButtonProps {
  photos: PhotoWithFavorite[];
  galleryTitle: string;
}

export function DownloadButton({ photos, galleryTitle }: DownloadButtonProps) {
  function handleDownload() {
    const link = document.createElement("a");
    link.href = `/api/galleries/download?title=${encodeURIComponent(galleryTitle)}`;
    link.click();
  }

  return (
    <button
      onClick={handleDownload}
      className="flex items-center gap-2 px-4 py-2 border border-[var(--border)] rounded-md text-sm font-medium hover:bg-[var(--muted)] transition-colors"
    >
      <Download className="w-4 h-4" />
      <span className="hidden sm:inline">Alle herunterladen</span>
    </button>
  );
}

interface DownloadPhotoButtonProps {
  photo: PhotoWithFavorite;
  dark?: boolean;
}

export function DownloadPhotoButton({ photo, dark }: DownloadPhotoButtonProps) {
  function handleDownload(e: React.MouseEvent) {
    e.stopPropagation();
    if (photo.driveLink) {
      window.open(photo.driveLink, "_blank");
      return;
    }
    const link = document.createElement("a");
    link.href = photo.previewUrl;
    link.download = photo.filename;
    link.click();
  }

  return (
    <button
      onClick={handleDownload}
      className={`p-1.5 rounded-full backdrop-blur-sm transition-colors ${
        dark
          ? "bg-white/10 hover:bg-white/20 text-white"
          : "bg-white/80 hover:bg-white text-[var(--foreground)]"
      }`}
      aria-label="Bild herunterladen"
    >
      <Download className="w-4 h-4" />
    </button>
  );
}
