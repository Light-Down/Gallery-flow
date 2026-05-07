/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { GalleryGrid } from "@/components/gallery/GalleryGrid";
import { GalleryMasonry } from "@/components/gallery/GalleryMasonry";
import { GalleryHorizontal } from "@/components/gallery/GalleryHorizontal";
import { GallerySlideshow } from "@/components/gallery/GallerySlideshow";
import { GalleryMagazine } from "@/components/gallery/GalleryMagazine";
import { GalleryPolaroid } from "@/components/gallery/GalleryPolaroid";
import { SneakPeakSection } from "@/components/gallery/SneakPeakSection";
import { ReviewButton } from "@/components/shared/ReviewButton";
import { DownloadButton } from "@/components/shared/DownloadButton";
import type { GalleryWithPhotos, PhotoWithFavorite } from "@/types";

interface PageProps {
  params: Promise<{ gallerySlug: string }>;
}

export default async function GalleryPage({ params }: PageProps) {
  const { gallerySlug } = await params;

  // Demo-Modus: Auth deaktiviert
  const gallery = await prisma.gallery.findUnique({
    where: { slug: gallerySlug },
    include: {
      photos: { orderBy: { sortOrder: "asc" } },
      photographer: true,
      client: true,
    },
  });

  if (!gallery) notFound();

  if (gallery.status === "DRAFT") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--muted-foreground)]">Diese Galerie ist noch nicht verfügbar.</p>
      </div>
    );
  }

  const allPhotos: PhotoWithFavorite[] = gallery.photos.map((p) => ({
    ...p,
    isFavorited: false,
  }));

  const sneakPeakPhotos = allPhotos.filter((p) => p.isSneakPeak);
  const visiblePhotos =
    gallery.status === "SNEAK_PEAK" ? sneakPeakPhotos : allPhotos;

  const galleryData: GalleryWithPhotos = {
    id: gallery.id,
    title: gallery.title,
    slug: gallery.slug,
    description: gallery.description,
    design: gallery.design,
    status: gallery.status,
    greetingText: gallery.greetingText,
    expiresAt: gallery.expiresAt,
    photos: visiblePhotos,
    photographer: {
      logoUrl: gallery.photographer.logoUrl,
      accentColor: gallery.photographer.accentColor,
      footerText: gallery.photographer.footerText,
      name: gallery.photographer.name,
      googleReviewUrl: gallery.photographer.googleReviewUrl,
      secondReviewUrl: gallery.photographer.secondReviewUrl,
      secondReviewLabel: gallery.photographer.secondReviewLabel,
    },
    client: { name: gallery.client.name, id: gallery.client.id },
  };

  const GalleryComponent = {
    GRID: GalleryGrid,
    MASONRY: GalleryMasonry,
    HORIZONTAL: GalleryHorizontal,
    SLIDESHOW: GallerySlideshow,
    MAGAZINE: GalleryMagazine,
    POLAROID: GalleryPolaroid,
  }[gallery.design];

  return (
    <div>
      <header className="px-6 py-6 border-b border-[var(--border)] flex items-center justify-between">
        <div>
          {gallery.photographer.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={gallery.photographer.logoUrl}
              alt={gallery.photographer.name}
              className="h-8 object-contain"
            />
          ) : (
            <span className="font-display text-xl font-semibold">
              {gallery.photographer.name}
            </span>
          )}
        </div>
        <DownloadButton
          photos={visiblePhotos}
          galleryTitle={gallery.title}
        />
      </header>

      <main className="px-6 pt-10 pb-4">
        {gallery.greetingText && (
          <p className="font-display text-lg italic text-[var(--muted-foreground)] mb-8 max-w-2xl">
            {gallery.greetingText}
          </p>
        )}

        {gallery.status === "SNEAK_PEAK" && (
          <SneakPeakSection photos={sneakPeakPhotos} />
        )}

        <GalleryComponent photos={visiblePhotos} galleryId={gallery.id} />
      </main>

      <ReviewButton
        googleReviewUrl={gallery.photographer.googleReviewUrl}
        secondReviewUrl={gallery.photographer.secondReviewUrl}
        secondReviewLabel={gallery.photographer.secondReviewLabel}
      />

      <footer className="px-6 py-8 border-t border-[var(--border)] text-center text-sm text-[var(--muted-foreground)]">
        {gallery.photographer.footerText ?? `© ${gallery.photographer.name}`}
      </footer>
    </div>
  );
}
