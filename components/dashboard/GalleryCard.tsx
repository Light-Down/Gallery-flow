/**
 * Gallery Flow
 * Copyright (C) 2025 Gallery Flow Contributors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 */

import Link from "next/link";
import { Images, ExternalLink } from "lucide-react";

type GalleryStatus = "DRAFT" | "SNEAK_PEAK" | "PUBLISHED" | "EXPIRED";

const statusLabels: Record<GalleryStatus, { label: string; className: string }> = {
  DRAFT: { label: "Entwurf", className: "bg-gray-100 text-gray-600" },
  SNEAK_PEAK: { label: "Sneak Peak", className: "bg-yellow-100 text-yellow-700" },
  PUBLISHED: { label: "Veröffentlicht", className: "bg-green-100 text-green-700" },
  EXPIRED: { label: "Abgelaufen", className: "bg-red-100 text-red-700" },
};

interface GalleryCardProps {
  gallery: {
    id: string;
    title: string;
    slug: string;
    status: GalleryStatus;
    design: string;
    client: { name: string };
    _count: { photos: number };
    updatedAt?: Date;
  };
}

export function GalleryCard({ gallery }: GalleryCardProps) {
  const status = statusLabels[gallery.status];

  return (
    <div className="bg-white rounded-lg border border-[var(--border)] p-5 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <Link href={`/dashboard/galleries/${gallery.id}`} className="flex-1">
          <h3 className="font-medium hover:text-[var(--accent)] transition-colors">
            {gallery.title}
          </h3>
          <p className="text-sm text-[var(--muted-foreground)]">{gallery.client.name}</p>
        </Link>
        <div className="flex items-center gap-2 ml-2">
          <span className={`text-xs px-2 py-0.5 rounded-full ${status.className}`}>
            {status.label}
          </span>
          <Link
            href={`/gallery/${gallery.slug}`}
            target="_blank"
            className="text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
      <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
        <span className="flex items-center gap-1">
          <Images className="w-3.5 h-3.5" />
          {gallery._count.photos} Fotos
        </span>
        <span className="text-xs">{gallery.design}</span>
        <Link
          href={`/dashboard/galleries/${gallery.id}/upload`}
          className="ml-auto text-xs underline hover:text-[var(--foreground)] transition-colors"
        >
          Upload
        </Link>
      </div>
    </div>
  );
}
