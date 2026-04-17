/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import { notFound, redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
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
  const session = await getSession();

  if (!session) redirect("/login");

  const galleriesSnap = await adminDb
    .collection("galleries")
    .where("slug", "==", gallerySlug)
    .limit(1)
    .get();

  if (galleriesSnap.empty) notFound();

  const galleryDoc = galleriesSnap.docs[0];
  const galleryData = galleryDoc.data();

  if (session.userType === "client" && galleryData.clientId !== session.uid) {
    redirect("/login");
  }

  if (galleryData.status === "DRAFT") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-[var(--muted-foreground)]">Diese Galerie ist noch nicht verfügbar.</p>
      </div>
    );
  }

  const [photosSnap, photographerDoc, clientDoc] = await Promise.all([
    adminDb.collection("photos").where("galleryId", "==", galleryDoc.id).orderBy("sortOrder", "asc").get(),
    adminDb.collection("photographers").doc(galleryData.photographerId).get(),
    galleryData.clientId ? adminDb.collection("clients").doc(galleryData.clientId).get() : Promise.resolve(null),
  ]);

  const favSnap = session.userType === "client"
    ? await adminDb.collection("favorites").where("clientId", "==", session.uid).get()
    : null;

  const favoriteIds = new Set(favSnap?.docs.map((f) => f.data().photoId) ?? []);

  const photographer = photographerDoc.data() ?? {};
  const client = clientDoc?.data() ?? {};

  const allPhotos: PhotoWithFavorite[] = photosSnap.docs.map((p) => {
    const d = p.data();
    return {
      id: p.id,
      filename: d.filename as string,
      previewUrl: d.previewUrl as string,
      driveLink: (d.driveLink as string | null) ?? null,
      isSneakPeak: (d.isSneakPeak as boolean) ?? false,
      sortOrder: (d.sortOrder as number) ?? 0,
      width: (d.width as number | null) ?? null,
      height: (d.height as number | null) ?? null,
      sizeBytes: (d.sizeBytes as number | null) ?? null,
      isFavorited: favoriteIds.has(p.id),
    };
  });

  const sneakPeakPhotos = allPhotos.filter((p) => p.isSneakPeak);
  const visiblePhotos = galleryData.status === "SNEAK_PEAK" ? sneakPeakPhotos : allPhotos;

  const galleryForDisplay: GalleryWithPhotos = {
    id: galleryDoc.id,
    title: galleryData.title,
    slug: galleryData.slug,
    description: galleryData.description ?? null,
    design: galleryData.design,
    status: galleryData.status,
    greetingText: galleryData.greetingText ?? null,
    expiresAt: galleryData.expiresAt ?? null,
    photos: visiblePhotos,
    photographer: {
      logoUrl: photographer.logoUrl ?? null,
      accentColor: photographer.accentColor ?? "#1a1a1a",
      footerText: photographer.footerText ?? null,
      name: photographer.name ?? "",
      googleReviewUrl: photographer.googleReviewUrl ?? null,
      secondReviewUrl: photographer.secondReviewUrl ?? null,
      secondReviewLabel: photographer.secondReviewLabel ?? null,
    },
    client: { name: client.name ?? "", id: galleryData.clientId ?? "" },
  };

  const designMap = {
    GRID: GalleryGrid,
    MASONRY: GalleryMasonry,
    HORIZONTAL: GalleryHorizontal,
    SLIDESHOW: GallerySlideshow,
    MAGAZINE: GalleryMagazine,
    POLAROID: GalleryPolaroid,
  } as const;
  const GalleryComponent = designMap[galleryData.design as keyof typeof designMap] ?? GalleryMasonry;

  return (
    <div>
      <header className="px-6 py-6 border-b border-[var(--border)] flex items-center justify-between">
        <div>
          {photographer.logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={photographer.logoUrl}
              alt={photographer.name}
              className="h-8 object-contain"
            />
          ) : (
            <span className="font-display text-xl font-semibold">
              {photographer.name}
            </span>
          )}
        </div>
        <DownloadButton
          photos={visiblePhotos}
          galleryTitle={galleryData.title}
        />
      </header>

      <main className="px-6 pt-10 pb-4">
        {galleryData.greetingText && (
          <p className="font-display text-lg italic text-[var(--muted-foreground)] mb-8 max-w-2xl">
            {galleryData.greetingText}
          </p>
        )}

        {galleryData.status === "SNEAK_PEAK" && (
          <SneakPeakSection photos={sneakPeakPhotos} />
        )}

        <GalleryComponent photos={visiblePhotos} galleryId={galleryDoc.id} />
      </main>

      <ReviewButton
        googleReviewUrl={photographer.googleReviewUrl ?? null}
        secondReviewUrl={photographer.secondReviewUrl ?? null}
        secondReviewLabel={photographer.secondReviewLabel ?? null}
      />

      <footer className="px-6 py-8 border-t border-[var(--border)] text-center text-sm text-[var(--muted-foreground)]">
        {photographer.footerText ?? `© ${photographer.name}`}
      </footer>
    </div>
  );
}
