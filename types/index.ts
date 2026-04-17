/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

export type GalleryDesign = "MASONRY" | "GRID" | "HORIZONTAL" | "SLIDESHOW" | "MAGAZINE" | "POLAROID";
export type GalleryStatus = "DRAFT" | "SNEAK_PEAK" | "PUBLISHED" | "EXPIRED";

export interface PhotographerBranding {
  logoUrl: string | null;
  accentColor: string;
  footerText: string | null;
  name: string;
  googleReviewUrl: string | null;
  secondReviewUrl: string | null;
  secondReviewLabel: string | null;
}

export interface PhotoWithFavorite {
  id: string;
  filename: string;
  previewUrl: string;
  driveLink: string | null;
  isSneakPeak: boolean;
  sortOrder: number;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  isFavorited: boolean;
}

export interface GalleryWithPhotos {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  design: GalleryDesign;
  status: GalleryStatus;
  greetingText: string | null;
  expiresAt: Date | null;
  photos: PhotoWithFavorite[];
  photographer: PhotographerBranding;
  client: { name: string; id: string };
}

export interface UploadProgress {
  file: File;
  progress: number;
  status: "pending" | "uploading" | "done" | "error";
  url?: string;
  error?: string;
}

