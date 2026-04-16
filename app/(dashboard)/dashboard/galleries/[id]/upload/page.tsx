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

import { useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { UploadZone } from "@/components/dashboard/UploadZone";

export default function UploadPage() {
  const { id } = useParams<{ id: string }>();

  return (
    <div>
      <div className="flex items-center gap-4 mb-8">
        <Link href={`/dashboard/galleries/${id}`} className="text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-display text-3xl font-semibold">Fotos hochladen</h1>
      </div>

      <div className="bg-white rounded-lg border border-[var(--border)] p-6">
        <UploadZone galleryId={id} />
      </div>
    </div>
  );
}
