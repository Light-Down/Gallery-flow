/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import { getSession } from "@/lib/auth";
import { adminDb } from "@/lib/firebase-admin";
import type { GalleryStatus } from "@/types";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Plus } from "lucide-react";
import { GalleryCard } from "@/components/dashboard/GalleryCard";

export default async function GalleriesPage() {
  const session = await getSession();
  if (!session || session.userType !== "photographer") redirect("/login");

  const snapshot = await adminDb
    .collection("galleries")
    .where("photographerId", "==", session.uid)
    .orderBy("updatedAt", "desc")
    .get();

  const galleries = await Promise.all(
    snapshot.docs.map(async (doc) => {
      const data = doc.data();
      const [clientDoc, photosSnap] = await Promise.all([
        data.clientId ? adminDb.collection("clients").doc(data.clientId).get() : Promise.resolve(null),
        adminDb.collection("photos").where("galleryId", "==", doc.id).count().get(),
      ]);
      return {
        id: doc.id,
        title: data.title as string,
        slug: data.slug as string,
        status: data.status as GalleryStatus,
        design: data.design as string,
        updatedAt: data.updatedAt?.toDate?.() as Date | undefined,
        client: clientDoc?.exists ? { name: (clientDoc.data()?.name ?? "") as string } : { name: "" },
        _count: { photos: photosSnap.data().count },
      };
    })
  );

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <h1 className="font-display text-3xl font-semibold">Galerien</h1>
        <Link
          href="/dashboard/galleries/new"
          className="flex items-center gap-2 px-4 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
        >
          <Plus className="w-4 h-4" />
          Neue Galerie
        </Link>
      </div>

      {galleries.length === 0 ? (
        <div className="bg-white rounded-lg border border-[var(--border)] p-12 text-center">
          <p className="text-[var(--muted-foreground)] mb-4">Noch keine Galerien erstellt.</p>
          <Link
            href="/dashboard/galleries/new"
            className="px-4 py-2 bg-[var(--accent)] text-[var(--accent-foreground)] rounded-md text-sm font-medium hover:opacity-90 transition-opacity"
          >
            Erste Galerie erstellen
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {galleries.map((gallery) => (
            <GalleryCard key={gallery.id} gallery={gallery} />
          ))}
        </div>
      )}
    </div>
  );
}
