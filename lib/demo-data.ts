/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

// Demo-Daten für den Modus ohne Datenbank

export const DEMO_PHOTOGRAPHER = {
  id: "demo-photographer-id",
  name: "Julia Schneider Fotografie",
  email: "admin@demo.com",
  passwordHash: "",
  logoUrl: null,
  accentColor: "#6366f1",
  footerText: "© Julia Schneider Fotografie 2025",
  googleReviewUrl: null,
  secondReviewUrl: null,
  secondReviewLabel: null,
  createdAt: new Date("2025-01-01"),
  updatedAt: new Date("2025-01-01"),
};

export const DEMO_CLIENT = {
  id: "demo-client-id",
  name: "Anna & Max Müller",
  email: "anna@beispiel.de",
  photographerId: "demo-photographer-id",
  createdAt: new Date("2025-03-15"),
  updatedAt: new Date("2025-03-15"),
};

// 12 schöne Fotos von picsum.photos
export const DEMO_PHOTOS = Array.from({ length: 12 }, (_, i) => ({
  id: `demo-photo-${i + 1}`,
  galleryId: "demo-gallery-id",
  filename: `hochzeit-${String(i + 1).padStart(3, "0")}.jpg`,
  previewUrl: `https://picsum.photos/seed/wedding${i + 1}/1200/800`,
  originalUrl: `https://picsum.photos/seed/wedding${i + 1}/2400/1600`,
  driveLink: null,
  isSneakPeak: i < 3,
  sortOrder: i,
  width: 1200,
  height: 800,
  sizeBytes: 1_200_000,
  createdAt: new Date("2025-04-20"),
  isFavorited: false,
}));

export const DEMO_GALLERY = {
  id: "demo-gallery-id",
  title: "Hochzeit Anna & Max",
  slug: "demo",
  description: "Eine wunderschöne Sommerhochzeit im Allgäu",
  design: "MASONRY" as const,
  status: "PUBLISHED" as const,
  greetingText:
    "Liebe Anna & Max, hier sind eure unvergesslichen Hochzeitsfotos. Viel Freude beim Stöbern! 💕",
  clientId: "demo-client-id",
  photographerId: "demo-photographer-id",
  expiresAt: null,
  photos: DEMO_PHOTOS,
  client: { name: "Anna & Max Müller", id: "demo-client-id" },
  photographer: DEMO_PHOTOGRAPHER,
  _count: { photos: DEMO_PHOTOS.length },
  createdAt: new Date("2025-04-18"),
  updatedAt: new Date("2025-04-20"),
};
