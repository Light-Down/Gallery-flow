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
import { Heart, Images } from "lucide-react";

interface ClientCardProps {
  client: {
    id: string;
    name: string;
    email: string;
    galleries: { id: string; title: string; status: string }[];
    _count: { favorites: number };
  };
}

export function ClientCard({ client }: ClientCardProps) {
  return (
    <Link href={`/dashboard/clients/${client.id}`}>
      <div className="bg-white rounded-lg border border-[var(--border)] p-5 hover:shadow-sm transition-shadow cursor-pointer">
        <div className="flex items-start justify-between mb-3">
          <div>
            <h3 className="font-medium">{client.name}</h3>
            <p className="text-sm text-[var(--muted-foreground)]">{client.email}</p>
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-[var(--muted-foreground)]">
          <span className="flex items-center gap-1">
            <Images className="w-3.5 h-3.5" />
            {client.galleries.length} Galerie{client.galleries.length !== 1 ? "n" : ""}
          </span>
          <span className="flex items-center gap-1">
            <Heart className="w-3.5 h-3.5" />
            {client._count.favorites} Favoriten
          </span>
        </div>
      </div>
    </Link>
  );
}
